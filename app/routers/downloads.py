import io
import zipfile

import pandas as pd
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import letter
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer
from sqlalchemy.orm import Session

import app.utils.applications as utils
from app import models
from app.auth import get_user
from app.db import get_db, transaction_session
from app.i18n import get_translated_string
from app.utils import tables
from reportlab_mods import styleSubTitle, styleTitle

router = APIRouter()


@router.get(
    "/applications/documents/id/{id}",
    tags=["applications"],
)
async def get_borrower_document(
    id: int,
    session: Session = Depends(get_db),
    user: models.User = Depends(get_user),
):
    """
    Retrieve a borrower document by its ID and stream the file content as a response.

    :param id: The ID of the borrower document to retrieve.
    :type id: int

    :param session: The database session.
    :type session: Session

    :param user: The current user.
    :type user: models.User

    :return: A streaming response with the borrower document file content.
    :rtype: StreamingResponse

    """
    with transaction_session(session):
        document = models.BorrowerDocument.first_by(session, "id", id)
        utils.get_file(document, user, session)

        def file_generator():
            yield document.file

        headers = {
            "Content-Disposition": f'attachment; filename="{document.name}"',
            "Content-Type": "application/octet-stream",
        }
        return StreamingResponse(file_generator(), headers=headers)


@router.get(
    "/applications/{application_id}/download-application/{lang}",
    tags=["applications"],
)
async def download_application(
    application_id: int,
    lang: str,
    session: Session = Depends(get_db),
    user: models.User = Depends(get_user),
):
    """
    Retrieve all documents related to an application and stream them as a zip file.

    :param application_id: The ID of the application to retrieve documents for.
    :type application_id: int

    :param session: The database session.
    :type session: Session

    :param user: The current user.
    :type user: models.User

    :return: A streaming response with a zip file containing the documents.
    :rtype: StreamingResponse
    """
    with transaction_session(session):
        application = utils.get_application_by_id(application_id, session)

        borrower = application.borrower
        award = application.award

        documents = (
            session.query(models.BorrowerDocument)
            .filter(models.BorrowerDocument.application_id == application_id)
            .all()
        )

        previous_awards = utils.get_previous_awards(application, session)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)

        elements = []

        elements.append(Paragraph(get_translated_string("Application Details", lang), styleTitle))

        elements.append(tables.create_application_table(application, lang))
        elements.append(Spacer(1, 20))
        elements.append(tables.create_borrower_table(borrower, application, lang))
        elements.append(Spacer(1, 20))
        elements.append(tables.create_documents_table(documents, lang))
        elements.append(Spacer(1, 20))
        elements.append(tables.create_award_table(award, lang))

        if previous_awards and len(previous_awards) > 0:
            elements.append(Spacer(1, 20))
            elements.append(Paragraph(get_translated_string("Previous Public Sector Contracts", lang), styleSubTitle))
            for award in previous_awards:
                elements.append(tables.create_award_table(award, lang))
                elements.append(Spacer(1, 20))

        doc.build(elements)

        name = get_translated_string("Application Details", lang).replace(" ", "_")
        filename = f"{name}-{application.borrower.legal_identifier}" + f"-{application.award.source_contract_id}.pdf"

        in_memory_zip = io.BytesIO()
        with zipfile.ZipFile(in_memory_zip, "w") as zip_file:
            zip_file.writestr(filename, buffer.getvalue())
            for document in documents:
                zip_file.writestr(document.name, document.file)

        application_action_type = (
            models.ApplicationActionType.OCP_DOWNLOAD_APPLICATION
            if user.is_OCP()
            else models.ApplicationActionType.FI_DOWNLOAD_APPLICATION
        )
        models.ApplicationAction.create(
            session,
            type=application_action_type,
            application_id=application.id,
            user_id=user.id,
        )

        headers = {
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Type": "application/zip",
        }

        return StreamingResponse(io.BytesIO(in_memory_zip.getvalue()), headers=headers)


@router.get(
    "/applications/export/{lang}",
    tags=["applications"],
    response_class=StreamingResponse,
)
async def export_applications(
    lang: str,
    user: models.User = Depends(get_user),
    session: Session = Depends(get_db),
):
    df = pd.DataFrame(utils.get_all_fi_applications_emails(session, user.lender_id, lang))
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=export.csv"
    return response
