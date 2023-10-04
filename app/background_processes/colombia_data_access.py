from datetime import datetime, timedelta

from app.db.session import app_settings

from . import background_utils

URLS = {
    "CONTRACTS": "https://www.datos.gov.co/resource/jbjy-vk9h.json",
    "AWARDS": "https://www.datos.gov.co/resource/p6dx-8zbt.json",
    "BORROWER_EMAIL": "https://www.datos.gov.co/resource/vzyx-b5wf.json",
    "BORROWER": "https://www.datos.gov.co/resource/4ex9-j3n8.json?&es_pyme=SI",
}

headers = {"X-App-Token": app_settings.colombia_secop_app_token}


def create_new_award(
    source_contract_id: str,
    entry: dict,
    borrower_id: int = None,
    previous: bool = False,
) -> dict:
    """
    Create a new award and insert it into the database.

    :param source_contract_id: The unique identifier for the award's source contract.
    :type source_contract_id: str
    :param entry: The dictionary containing the award data.
    :type entry: dict
    :param borrower_id: The ID of the borrower associated with the award. (default: None)
    :type borrower_id: int, optional
    :param previous: Whether the award is a previous award or not. (default: False)
    :type previous: bool, optional

    :return: The newly created award data as a dictionary.
    :rtype: dict
    """

    new_award = {
        "source_contract_id": source_contract_id,
        "source_url": entry.get("urlproceso", {}).get("url", ""),
        "entity_code": entry.get("codigo_entidad", ""),
        "source_last_updated_at": entry.get("ultima_actualizacion", ""),
        "award_amount": entry.get("valor_del_contrato", ""),
        "contractperiod_startdate": entry.get("fecha_de_inicio_del_contrato", None),
        "contractperiod_enddate": entry.get("fecha_de_fin_del_contrato", None),
        "procurement_method": entry.get("modalidad_de_contratacion", ""),
        "buyer_name": entry.get("nombre_entidad", ""),
        "contracting_process_id": entry.get("proceso_de_compra", ""),
        "procurement_category": entry.get("tipo_de_contrato", ""),
        "previous": previous,
        "payment_method": {
            "habilita_pago_adelantado": entry.get("habilita_pago_adelantado", ""),
            "valor_de_pago_adelantado": entry.get("valor_de_pago_adelantado", ""),
            "valor_facturado": entry.get("valor_facturado", ""),
            "valor_pendiente_de_pago": entry.get("valor_pendiente_de_pago", ""),
            "valor_pagado": entry.get("valor_pagado", ""),
        },
        "source_data_contracts": entry,
    }

    award_url = (
        f"{URLS['AWARDS']}?$where=id_del_portafolio='{entry['proceso_de_compra']}'"
        f" AND nombre_del_proveedor='{entry['proveedor_adjudicado']}'"
    )

    award_response = background_utils.make_request_with_retry(award_url, headers)

    if len(award_response.json()) > 1 or len(award_response.json()) == 0:
        error_data = {
            "entry": entry,
            "proveedor_adjudicado": entry["proveedor_adjudicado"],
            "id_del_portafolio": entry["proceso_de_compra"],
            "response": award_response.json(),
        }
        background_utils.raise_sentry_error(
            (
                f"Skipping Award [previous {previous}]"
                " - Zero or more than one results for 'proceso_de_compra' and 'proveedor_adjudicado'"
            ),
            error_data,
        )

    award_response_json = award_response.json()[0]

    new_award["description"] = award_response_json.get(
        "descripci_n_del_procedimiento", ""
    )
    new_award["award_date"] = award_response_json.get("fecha_adjudicacion", None)
    new_award["source_data_awards"] = award_response_json

    new_award["contract_status"] = award_response_json.get(
        "estado_del_procedimiento", ""
    )
    new_award["title"] = award_response_json.get("nombre_del_procedimiento", "")

    if borrower_id:
        new_award["borrower_id"] = borrower_id

    return new_award


def get_new_contracts(index: int, last_updated_award_date):
    """
    Get new contracts data from the source API.

    :param index: The index of the contracts data to retrieve (pagination index).
    :type index: int
    :param last_updated_award_date: The last updated date of the award data.
    :type last_updated_award_date: datetime or None

    :return: The response object containing the new contracts data.
    :rtype: httpx.Response
    """

    offset = index * app_settings.secop_pagination_limit
    delta = timedelta(days=app_settings.secop_default_days_from_ultima_actualizacion)
    converted_date = (datetime.now() - delta).strftime("%Y-%m-%dT00:00:00.000")

    if last_updated_award_date:
        delta = timedelta(days=1)
        converted_date = (last_updated_award_date - delta).strftime(
            "%Y-%m-%dT00:00:00.000"
        )

    url = (
        f"{URLS['CONTRACTS']}?$limit={app_settings.secop_pagination_limit}&$offset={offset}"
        "&$order=ultima_actualizacion desc null last&$where=es_pyme = 'Si' AND estado_contrato = 'Borrador' "
        f"AND ultima_actualizacion >= '{converted_date}' AND localizaci_n = 'Colombia, Bogotá, Bogotá'"
    )

    return background_utils.make_request_with_retry(url, headers)


def get_previous_contracts(documento_proveedor):
    """
    Get previous contracts data for the given document provider from the source API.

    :param documento_proveedor: The document provider to get previous contracts data for.
    :type documento_proveedor: str

    :return: The response object containing the previous contracts data.
    :rtype: httpx.Response
    """

    url = f"{URLS['CONTRACTS']}?$where=documento_proveedor = '{documento_proveedor}' AND fecha_de_firma IS NOT NULL"

    return background_utils.make_request_with_retry(url, headers)


def get_source_contract_id(entry):
    """
    Get the source contract ID from the given entry data.

    :param entry: The dictionary containing the award data.
    :type entry: dict

    :return: The source contract ID.
    :rtype: str
    """

    source_contract_id = entry.get("id_contrato", "")

    if not source_contract_id:
        background_utils.raise_sentry_error("Skipping Award - No id_contrato", entry)

    return source_contract_id


def create_new_borrower(
    borrower_identifier: str, documento_proveedor: str, entry: dict
) -> dict:
    """
    Create a new borrower and insert it into the database.

    :param borrower_identifier: The unique identifier for the borrower.
    :type borrower_identifier: str
    :param documento_proveedor: The document provider for the borrower.
    :type documento_proveedor: str
    :param entry: The dictionary containing the borrower data.
    :type entry: dict

    :return: The newly created borrower data as a dictionary.
    :rtype: dict
    """

    borrower_url = (
        f"{URLS['BORROWER']}&nit_entidad={documento_proveedor}"
        f"&codigo_entidad={entry.get('codigo_proveedor', '')}"
    )
    borrower_response = background_utils.make_request_with_retry(borrower_url, headers)

    if len(borrower_response.json()) > 1:
        error_data = {
            "entry": entry,
            "documento_proveedor": documento_proveedor,
            "response": borrower_response.json(),
        }
        background_utils.raise_sentry_error(
            "Skipping Award - There are more than one borrower for this borrower identifier",
            error_data,
        )

    borrower_response_json = borrower_response.json()[0]
    email = get_email(documento_proveedor, entry)

    new_borrower = {
        "borrower_identifier": borrower_identifier,
        "legal_name": borrower_response_json.get("nombre_entidad", ""),
        "email": email,
        "address": "Direccion: {}\nCiudad: {}\nProvincia: {}\nEstado: {}".format(
            borrower_response_json.get("direccion", "No provisto"),
            borrower_response_json.get("ciudad", "No provisto"),
            borrower_response_json.get("provincia", "No provisto"),
            borrower_response_json.get("estado", "No provisto"),
        ),
        "legal_identifier": borrower_response_json.get("nit_entidad", ""),
        "type": borrower_response_json.get("tipo_organizacion", ""),
        "source_data": borrower_response_json,
    }

    return new_borrower


def get_email(documento_proveedor, entry) -> str:
    """
    Get the email address for the borrower based on the given document provider and entry data.

    :param documento_proveedor: The document provider for the borrower.
    :type documento_proveedor: str
    :param entry: The dictionary containing the borrower data.
    :type entry: dict

    :return: The email address of the borrower.
    :rtype: str
    """

    borrower_email_url = f"{URLS['BORROWER_EMAIL']}?nit={documento_proveedor}"
    borrower_response_email = background_utils.make_request_with_retry(
        borrower_email_url, headers
    )

    if len(borrower_response_email.json()) == 0:
        error_data = {
            "entry": entry,
            "response": borrower_response_email.json(),
        }
        background_utils.raise_sentry_error(
            "Skipping Award - No email for borrower", error_data
        )

    borrower_response_email_json = borrower_response_email.json()[0]
    email = borrower_response_email_json.get("correo_entidad", "")

    if not background_utils.is_valid_email(email):
        error_data = {
            "entry": entry,
            "response": borrower_response_email_json,
        }
        background_utils.raise_sentry_error(
            "Skipping Award - Borrower has no valid email address", error_data
        )

    if len(borrower_response_email.json()) > 1:
        same_email = True
        for borrower_email in borrower_response_email.json():
            if borrower_email.get("correo_entidad", "") != email:
                same_email = False
                break

        if not same_email:
            error_data = {
                "entry": entry,
                "response": borrower_response_email.json(),
            }
            background_utils.raise_sentry_error(
                "Skipping Award - More than one email for borrower", error_data
            )

    return email


def get_documento_proveedor(entry) -> str:
    """
    Get the document provider from the given entry data.

    :param entry: The dictionary containing the borrower data.
    :type entry: dict

    :return: The document provider for the borrower.
    :rtype: str
    """

    documento_proveedor = entry.get("documento_proveedor", None)
    if not documento_proveedor or documento_proveedor == "No Definido":
        error_data = {"entry": entry}

        background_utils.raise_sentry_error(
            "Skipping Award - documento_proveedor is 'No Definido'",
            error_data,
        )

    return documento_proveedor
