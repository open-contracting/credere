from datetime import datetime, timedelta
from typing import Any
from urllib.parse import quote_plus

import requests

from app import sources, util
from app.exceptions import SkippedAwardError
from app.settings import app_settings

URLS = {
    "CONTRACTS": "https://www.datos.gov.co/resource/jbjy-vk9h.json",
    "AWARDS": "https://www.datos.gov.co/resource/p6dx-8zbt.json",
    "BORROWER": "https://www.datos.gov.co/resource/4ex9-j3n8.json",
}

HEADERS = {"X-App-Token": app_settings.colombia_secop_app_token}

SUPPLIER_TYPE_TO_EXCLUDE = "persona natural colombiana"

# https://www.datos.gov.co/resource/p6dx-8zbt.json?$query=SELECT distinct `tipo_de_contrato`
PROCUREMENT_CATEGORIES = [
    "Comodato",
    "Empréstito",
    "Venta inmuebles",
    "Seguros",
    "Interventoría",
    "Arrendamiento de muebles",
    "Negocio fiduciario",
    "Concesión",
    "No",
    "Asociación Público Privada",
    "No Especificado",
    "Otro",
    "Acuerdo Marco de Precios",
    "Arrendamiento de inmuebles",
    "Compraventa",
    "Comisión",
    "Prestación de servicios",
    "Decreto 092 de 2017",
    "Venta muebles",
    "Operaciones de Crédito Público",
    "Suministros",
    "Obra",
    "Servicios financieros",
    "Acuerdo de cooperación",
    "Consultoría",
]


def _get_remote_contract(
    proceso_de_compra: str, proveedor_adjudicado: str, *, previous: bool = False
) -> tuple[list[dict[str, str]], str]:
    params = f"proceso_de_compra='{proceso_de_compra}' AND documento_proveedor='{proveedor_adjudicado}'"
    if previous:
        params = f"{params} AND fecha_de_firma IS NOT NULL"
    contract_url = f"{URLS['CONTRACTS']}?$where={quote_plus(params)}"
    return util.loads(sources.make_request_with_retry(contract_url, HEADERS)), contract_url


def get_award(
    entry: dict[str, Any],
    borrower_id: int | None = None,
    *,
    previous: bool = False,
) -> dict[str, str | None]:
    """
    Create a new award and insert it into the database.

    :param entry: The dictionary containing the award data.
    :param borrower_id: The database ID of the borrower associated with the award. (default: None)
    :param previous: Whether the award is a previous award or not. (default: False)
    :return: The newly created award data as a dictionary.
    """
    proceso_de_compra = entry["id_del_portafolio"]
    proveedor_adjudicado = entry["nit_del_proveedor_adjudicado"]

    contract_response_json, contract_url = _get_remote_contract(
        proceso_de_compra, proveedor_adjudicado, previous=previous
    )
    if not contract_response_json:
        # Retry without proveedor_adjudicado, in case contract data is available, but not the supplier name.
        contract_response_json, contract_url = _get_remote_contract(
            proceso_de_compra, "No Adjudicado", previous=previous
        )
        if not contract_response_json:
            raise SkippedAwardError("No remote contracts found", url=contract_url, data={"previous": previous})

    remote_contract = contract_response_json[0]

    source_contract_id = remote_contract.get("id_contrato", "")
    if not source_contract_id:
        raise SkippedAwardError("Missing id_contrato", data=remote_contract)

    new_award = {
        "source_url": entry.get("urlproceso", {}).get("url", ""),
        "entity_code": entry.get("nit_entidad", ""),
        "source_last_updated_at": entry.get("fecha_de_ultima_publicaci"),
        "procurement_method": entry.get("modalidad_de_contratacion", ""),
        "buyer_name": entry.get("entidad", ""),
        "contracting_process_id": proceso_de_compra,
        "procurement_category": entry.get("tipo_de_contrato", ""),
        "previous": previous,
        "source_data_awards": entry,
        "description": entry.get("descripci_n_del_procedimiento", ""),
        "award_date": entry.get("fecha_adjudicacion"),
        "contract_status": entry.get("estado_del_procedimiento", ""),
        "title": entry.get("nombre_del_procedimiento", ""),
        "payment_method": {
            "habilita_pago_adelantado": remote_contract.get("habilita_pago_adelantado", ""),
            "valor_de_pago_adelantado": remote_contract.get("valor_de_pago_adelantado", ""),
            "valor_facturado": remote_contract.get("valor_facturado", ""),
            "valor_pendiente_de_pago": remote_contract.get("valor_pendiente_de_pago", ""),
            "valor_pagado": remote_contract.get("valor_pagado", ""),
        },
        "contractperiod_startdate": remote_contract.get("fecha_de_inicio_del_contrato"),
        "contractperiod_enddate": remote_contract.get("fecha_de_fin_del_contrato"),
        "award_amount": remote_contract.get("valor_del_contrato", ""),
        "source_data_contracts": remote_contract,
        "source_contract_id": source_contract_id,
    }

    if borrower_id:
        new_award["borrower_id"] = borrower_id

    return new_award


def get_new_awards(index: int, from_date: datetime | None, until_date: datetime | None = None) -> requests.Response:
    offset = index * app_settings.secop_pagination_limit
    date_format = "%Y-%m-%dT%H:%M:%S.000"

    base_url = (
        f"{URLS['AWARDS']}?$limit={app_settings.secop_pagination_limit}&$offset={offset}"
        "&$order=fecha_de_ultima_publicaci desc null last&$where="
        " caseless_eq(`adjudicado`, 'Si')"
    )

    if from_date and until_date:
        url = (
            f"{base_url} AND ((fecha_de_ultima_publicaci >= '{from_date.strftime(date_format)}' "
            f"AND fecha_de_ultima_publicaci < '{until_date.strftime(date_format)}') OR "
            f"(fecha_adjudicacion >= '{from_date.strftime(date_format)}' "
            f"AND fecha_adjudicacion < '{until_date.strftime(date_format)}'))"
        )
    else:
        # from_date is set to the maximum value of Award.last_updated. Use `>` below to avoid repetition across runs.
        if from_date:
            converted_date = from_date
        # from_date is None if the fetch-awards command is run on a fresh database.
        else:
            converted_date = datetime.now() - timedelta(days=app_settings.secop_default_days_from_ultima_actualizacion)
        url = (
            f"{base_url} AND (fecha_de_ultima_publicaci > '{converted_date.strftime(date_format)}' "
            f"OR fecha_adjudicacion > '{converted_date.strftime(date_format)}')"
        )

    return sources.make_request_with_retry(url, HEADERS)


def get_award_by_id_and_supplier(award_id: str, supplier_id: str) -> requests.Response:
    url = f"{URLS['AWARDS']}?$where=nit_del_proveedor_adjudicado = '{supplier_id}' AND id_adjudicacion = '{award_id}'"
    return sources.make_request_with_retry(url, HEADERS)


def get_previous_awards(supplier_id: str) -> requests.Response:
    """
    Get previous contracts data for the given document provider from the source API.

    :param supplier_id: The document provider to get previous contracts data for.
    :return: The response object containing the previous awards data.
    """
    url = f"{URLS['AWARDS']}?$where=nit_del_proveedor_adjudicado = '{supplier_id}'"
    return sources.make_request_with_retry(url, HEADERS)


def get_borrower(borrower_identifier: str, supplier_id: str, entry: dict[str, str]) -> dict[str, str]:
    """
    Get the borrower information from the source.

    :param borrower_identifier: The unique identifier for the borrower.
    :param supplier_id: The document provider for the borrower.
    :param entry: The dictionary containing the borrower data.
    :return: The newly created borrower data as a dictionary.
    """
    borrower_url = f"{URLS['BORROWER']}?nit_entidad={supplier_id}&codigo_entidad={entry.get('codigoproveedor', '')}"
    borrower_response_json = util.loads(sources.make_request_with_retry(borrower_url, HEADERS))
    len_borrower_response_json = len(borrower_response_json)

    if len_borrower_response_json != 1:
        raise SkippedAwardError(
            "Multiple remote borrowers found",
            url=borrower_url,
            data={"response": borrower_response_json, "count": len_borrower_response_json},
        )

    remote_borrower = borrower_response_json[0]
    # Emails in data source are uppercase and AWS SES is case sensitive.
    email = remote_borrower.get("correo_electronico", "").lower()

    if not util.is_valid_email(email):
        raise SkippedAwardError(
            "Invalid remote borrower email",
            url=borrower_url,
            data={"response": remote_borrower, "email": email},
        )

    if (
        remote_borrower.get("tipo_entidad", "").lower() == SUPPLIER_TYPE_TO_EXCLUDE
        or remote_borrower.get("regimen_tributario", "") == "Persona Natural"
        or remote_borrower.get("tipo_de_documento", "") == "Cédula de Ciudadanía"
    ):
        raise SkippedAwardError(
            f"Borrower is {SUPPLIER_TYPE_TO_EXCLUDE}",
            url=borrower_url,
            data={"response": borrower_response_json},
        )

    return {
        "borrower_identifier": borrower_identifier,
        "legal_name": remote_borrower.get("nombre_entidad", ""),
        "email": email,
        "address": (
            f"Direccion: {remote_borrower.get('direccion', 'No provisto')}\n"
            f"Ciudad: {remote_borrower.get('ciudad', 'No provisto')}\n"
            f"Departamento: {remote_borrower.get('departamento', 'No provisto')}\n"
        ),
        "legal_identifier": remote_borrower.get("nit_entidad", ""),
        "type": remote_borrower.get("tipo_entidad", ""),
        "source_data": remote_borrower,
        "is_msme": remote_borrower.get("es_pyme", "").lower() == "si",
    }


def get_supplier_id(entry: dict[str, str]) -> str:
    """
    Get the document provider from the given entry data.

    :param entry: The dictionary containing the borrower data.
    :return: The document provider for the borrower.
    """
    supplier_id = entry.get("nit_del_proveedor_adjudicado")
    if not supplier_id or supplier_id == "No Definido":
        raise SkippedAwardError("Missing supplier_id", data=entry)

    return supplier_id
