import os
import uuid
from contextlib import contextmanager
from datetime import datetime
from typing import Any, Generator
from unittest.mock import MagicMock, patch

import boto3
import moto
import pytest
from botocore.config import Config
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine

from app import aws, dependencies, main, models
from app.db import get_db
from app.settings import app_settings
from tests import create_user, get_test_db


@pytest.fixture(scope="session")
def app() -> Generator[FastAPI, Any, None]:
    yield main.app


@pytest.fixture(scope="session")
def engine():
    return create_engine(os.getenv("TEST_DATABASE_URL"))


# http://docs.getmoto.org/en/latest/docs/getting_started.html#example-on-usage
@pytest.fixture(scope="session", autouse=True)
def aws_credentials():
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"


# Setting "session" scope causes test failures, because users, etc. that are not expected to exist do exist.
@pytest.fixture(autouse=True)
def mock_aws(aws_credentials):
    # http://docs.getmoto.org/en/latest/docs/services/cognito-idp.html
    with moto.mock_aws():
        yield


# IMPORTANT! All calls to aws.ses_client must be mocked.
#
# Setting "session" scope and calling `mock_send_templated_email.reset_mock()` at the start of tests saves little time.
@pytest.fixture(autouse=True)
def mock_send_templated_email(mock_aws):
    with patch.object(aws.ses_client, "send_templated_email", MagicMock()) as mock:
        mock.return_value = {"MessageId": "123"}
        yield mock


@pytest.fixture(scope="session", autouse=True)
def database(engine):
    models.SQLModel.metadata.create_all(engine)
    yield
    models.SQLModel.metadata.drop_all(engine)


@pytest.fixture
def reset_database(engine):
    models.SQLModel.metadata.drop_all(engine)
    models.SQLModel.metadata.create_all(engine)
    yield
    models.SQLModel.metadata.drop_all(engine)
    models.SQLModel.metadata.create_all(engine)


@pytest.fixture
def sessionmaker(engine):
    return get_test_db(engine)


@pytest.fixture
def session(sessionmaker):
    with contextmanager(sessionmaker)() as db_session:
        yield db_session


@pytest.fixture
def aws_client(mock_aws):
    config = Config(region_name=app_settings.aws_region)

    cognito_client = boto3.client("cognito-idp", config=config)
    cognito_pool_id = cognito_client.create_user_pool(PoolName="TestUserPool")["UserPool"]["Id"]
    cognito_client.set_user_pool_mfa_config(
        UserPoolId=cognito_pool_id, SoftwareTokenMfaConfiguration={"Enabled": True}, MfaConfiguration="ON"
    )
    app_settings.cognito_pool_id = cognito_pool_id
    app_settings.cognito_client_id = cognito_client.create_user_pool_client(
        UserPoolId=cognito_pool_id, ClientName="TestAppClient"
    )["UserPoolClient"]["ClientId"]
    app_settings.cognito_client_secret = "secret"

    ses_client = boto3.client("ses", config=config)
    ses_client.verify_email_identity(EmailAddress=app_settings.email_sender_address)
    for key in ("-es", ""):
        ses_client.create_template(
            Template={
                "TemplateName": f"credere-main{key}",
                "SubjectPart": "Your email subject",
                "HtmlPart": "<html><body>Your HTML content</body></html>",
                "TextPart": "Your plain text content",
            }
        )

    yield aws.Client(
        cognito_client,
        ses_client,
        lambda: "initial-autogenerated-password",
    )


@pytest.fixture
def client(app: FastAPI, engine, aws_client) -> Generator[TestClient, Any, None]:
    # Mock dependencies. aws.client is used only in get_aws_client().
    app.dependency_overrides[dependencies.get_aws_client] = lambda: aws_client
    app.dependency_overrides[get_db] = get_test_db(engine)

    with TestClient(app) as client:
        yield client


@pytest.fixture
def lender(session):
    instance = models.Lender.create(
        session,
        name=uuid.uuid4(),
        email_group="test@example.com",
        type="Some Type",
        sla_days=7,
        status="Active",
    )
    session.commit()
    return instance


@pytest.fixture
def unauthorized_lender(session):
    instance = models.Lender.create(
        session,
        name=uuid.uuid4(),
        email_group="test@example.com",
        type="Some Type",
        sla_days=7,
        status="Active",
    )
    session.commit()
    return instance


@pytest.fixture
def admin_header(session, aws_client):
    return create_user(
        session,
        aws_client,
        email=f"ocp-test-{uuid.uuid4()}@open-contracting.org",
        name="OCP Test User",
        type=models.UserType.OCP,
    )


@pytest.fixture
def lender_header(session, aws_client, lender):
    return create_user(
        session,
        aws_client,
        email=f"lender-user-{uuid.uuid4()}@example.com",
        name="Lender Test User",
        type=models.UserType.FI,
        lender=lender,
    )


@pytest.fixture
def unauthorized_lender_header(session, aws_client, unauthorized_lender):
    return create_user(
        session,
        aws_client,
        email=f"lender-user-{uuid.uuid4()}@example.com",
        name="Lender Test User",
        type=models.UserType.FI,
        lender=unauthorized_lender,
    )


@pytest.fixture
def user_payload():
    return {
        "email": f"test-{uuid.uuid4()}@noreply.open-contracting.org",
        "name": "Test User",
        "type": models.UserType.FI,
    }


@pytest.fixture
def credit_product(session, lender):
    instance = models.CreditProduct.create(
        session,
        borrower_size=models.BorrowerSize.SMALL,
        lower_limit=5000.00,
        upper_limit=500000.00,
        interest_rate=3.75,
        type=models.CreditType.LOAN,
        required_document_types={
            "INCORPORATION_DOCUMENT": True,
        },
        other_fees_total_amount=1000,
        other_fees_description="Other test fees",
        more_info_url="www.moreinfo.test",
        lender=lender,
    )
    session.commit()
    return instance


@pytest.fixture
def award(session):
    instance = models.Award.create(
        session,
        entidad="TEST ENTITY",
        nit_entidad="1234567890",
        departamento_entidad="Test Department",
        ciudad_entidad="Test City",
        ordenentidad="Test Order",
        codigo_pci="Yes",
        award_amount="123456",
        id_del_proceso="TEST_PROCESS_ID",
        referencia_del_proceso="TEST_PROCESS_REFERENCE",
        ppi="ND",
        id_del_portafolio="TEST_PORTFOLIO_ID",
        nombre_del_procedimiento="Test Procedure Name",
        descripci_n_del_procedimiento="Test Procedure Description",
        fase="Test Phase",
        fecha_de_publicacion_del="2023-01-01T00:00:00.000",
        fecha_de_ultima_publicaci="2023-01-01T00:00:00.000",
        fecha_de_publicacion_fase_3="2023-01-01T00:00:00.000",
        precio_base="100000",
        modalidad_de_contratacion="Test Contract Modality",
        justificaci_n_modalidad_de="Test Modality Justification",
        duracion="2",
        unidad_de_duracion="Days",
        fecha_de_recepcion_de="2023-01-05T00:00:00.000",
        fecha_de_apertura_de_respuesta="2023-01-06T00:00:00.000",
        fecha_de_apertura_efectiva="2023-01-06T00:00:00.000",
        ciudad_de_la_unidad_de="Test Unit City",
        nombre_de_la_unidad_de="Test Unit Name",
        proveedores_invitados="3",
        proveedores_con_invitacion="0",
        visualizaciones_del="0",
        proveedores_que_manifestaron="0",
        respuestas_al_procedimiento="1",
        respuestas_externas="0",
        g_nero_representante_legal="Otro",
        conteo_de_respuestas_a_ofertas="0",
        proveedores_unicos_con="1",
        numero_de_lotes="0",
        estado_del_procedimiento="Adjudicado",
        id_estado_del_procedimiento="70",
        adjudicado="Si",
        id_adjudicacion="TEST_AWARD_ID",
        codigoproveedor="713916229",
        departamento_proveedor="No aplica",
        ciudad_proveedor="No aplica",
        fecha_adjudicacion="2023-01-09T00:00:00.000",
        valor_total_adjudicacion="100000",
        nombre_del_adjudicador="Test Adjudicator",
        nombre_del_proveedor="Test Provider",
        nit_del_proveedor_adjudicado="No Definido",
        codigo_principal_de_categoria="V1.90101603",
        estado_de_apertura_del_proceso="Cerrado",
        tipo_de_contrato="Servicios de aprovisionamiento",
        subtipo_de_contrato="No Especificado",
        categorias_adicionales="ND",
        urlproceso={"url": "https://example.com"},
        codigo_entidad="702836172",
        estadoresumen="Adjudicado",
    )
    session.commit()
    return instance


@pytest.fixture
def borrower(session):
    instance = models.Borrower.create(
        session,
        borrower_identifier=uuid.uuid4(),
        legal_name="",  # tests expect this to be in missing_data
        email="test@example.com",
        address="Direccion: Test Address\nCiudad: Test City\nProvincia: No provisto\nEstado: No provisto",
        legal_identifier="",
        type="Test Organization Type",
        sector="",
        size=models.BorrowerSize.NOT_INFORMED,
        created_at=datetime.utcnow(),
        updated_at="2023-06-22T17:48:05.381251",
        declined_at=None,
        source_data={
            "nombre_entidad": "Test Entity",
            "nit": "123456789121",
            "tel_fono_entidad": "1234567890",
            "correo_entidad": "test@example.com",
            "direccion": "Test Address",
            "estado_entidad": "Test State",
            "ciudad": "Test City",
            "website": "https://example.com",
            "tipo_organizacion": "Test Organization Type",
            "tipo_de_documento": "Test Document Type",
            "numero_de_cuenta": "Test Account Number",
            "banco": "Test Bank",
            "tipo_cuenta": "Test Account Type",
            "tipo_documento_representante_legal": "Test Representative Document Type",
            "num_documento_representante_legal": "987654321",
            "nombre_representante_legal": "Test Legal Representative",
            "nacionalidad_representante_legal": "COLOMBIANO",
            "direcci_n_representante_legal": "Test Representative Address",
            "genero_representante_legal": "No Definido",
            "es_pyme": "SI",
            "regimen_tributario": "Test Tax Regime",
            "pais": "CO",
        },
        status=models.BorrowerStatus.ACTIVE,
    )
    session.commit()
    return instance


@pytest.fixture
def application_uuid():
    return uuid.uuid4()


@pytest.fixture
def application_payload(application_uuid, award, borrower):
    return {
        "award_id": award.id,
        "uuid": application_uuid,
        "primary_email": "test@example.com",
        "award_borrower_identifier": "test_hash_12345678",
        "borrower": borrower,
        "contract_amount_submitted": None,
        "amount_requested": 10000,
        "currency": "COP",
        "calculator_data": {},
        "pending_documents": True,
        "pending_email_confirmation": True,
        "borrower_submitted_at": None,
        "borrower_accepted_at": None,
        "borrower_declined_at": None,
        "borrower_declined_preferences_data": {},
        "borrower_declined_data": {},
        "lender_started_at": None,
        "secop_data_verification": {
            "legal_name": False,
            "address": True,
            "legal_identifier": True,
            "type": True,
            "size": True,
            "sector": True,
            "email": True,
        },
        "lender_approved_at": None,
        "lender_approved_data": {},
        "lender_rejected_data": {},
        "lender_rejected_at": None,
        "repayment_months": None,
        "borrower_uploaded_contract_at": None,
        "completed_in_days": None,
        "created_at": datetime.utcnow(),
        "updated_at": "2023-06-26T03:14:31.572553+00:00",
        "archived_at": None,
    }


@pytest.fixture
def pending_application(session, application_payload, credit_product, lender):
    instance = models.Application.create(
        session,
        **application_payload,
        status=models.ApplicationStatus.PENDING,
        credit_product_id=credit_product.id,
        lender=lender,
    )
    session.commit()
    return instance


@pytest.fixture
def declined_application(session, application_payload, credit_product):
    instance = models.Application.create(
        session,
        **application_payload,
        status=models.ApplicationStatus.DECLINED,
    )
    session.commit()
    return instance


@pytest.fixture
def accepted_application(session, application_payload, credit_product):
    instance = models.Application.create(
        session,
        **application_payload,
        status=models.ApplicationStatus.ACCEPTED,
        credit_product_id=credit_product.id,
    )
    session.commit()
    return instance


@pytest.fixture
def started_application(session, application_payload, lender):
    instance = models.Application.create(
        session,
        **application_payload,
        status=models.ApplicationStatus.STARTED,
        lender=lender,
    )
    session.commit()
    return instance
