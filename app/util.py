import base64
import hashlib
import hmac
import os.path
import uuid
from collections.abc import Callable, Generator
from contextlib import contextmanager
from datetime import datetime
from enum import Enum, StrEnum
from typing import Any, TypeVar

import niquests
import orjson
from email_validator import EmailNotValidError, validate_email
from fastapi import File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from sqlmodel import col
from starlette.responses import RedirectResponse

from app import models
from app.db import get_db, handle_skipped_award, rollback_on_error
from app.exceptions import SkippedAwardError
from app.i18n import _
from app.settings import app_settings
from app.sources import colombia as data_access

T = TypeVar("T")
MAX_FILE_SIZE = app_settings.max_file_size_mb * 1024 * 1024  # MB in bytes
ALLOWED_EXTENSIONS = {".png", ".pdf", ".jpeg", ".jpg", ".zip"}


# https://fastapi.tiangolo.com/tutorial/path-operation-configuration/#tags-with-enums
class Tags(Enum):
    authentication = "authentication"
    applications = "applications"
    lenders = "lenders"
    meta = "meta"
    statistics = "statistics"
    users = "users"


class SortOrder(StrEnum):
    ASC = "asc"
    DESC = "desc"


class StatisticRange(StrEnum):
    CUSTOM_RANGE = "CUSTOM_RANGE"
    LAST_WEEK = "LAST_WEEK"
    LAST_MONTH = "LAST_MONTH"


def loads(response: niquests.Response) -> Any:
    return orjson.loads(response.text)


def get_object_or_404(session: Session, model: type[T], field: str, value: Any) -> T:
    # "type[T]" has no attribute "first_by" https://github.com/python/typing/issues/213
    obj: T | None = model.first_by(session, field, value)  # type: ignore[attr-defined]
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=_("%(model_name)s not found", model_name=model.__name__),
        )
    return obj


def generate_uuid(string: str) -> str:
    """
    Generate a UUID based on the given string.

    :param string: The input string to generate the UUID from.
    :return: The generated UUID.
    """
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, string))


def get_secret_hash(string: str) -> str:
    """Calculate the hash of a string."""
    message = string.encode()
    key = app_settings.hash_key.encode()
    return base64.b64encode(hmac.new(key, message, digestmod=hashlib.sha256).digest()).decode()


def is_valid_email(email: str) -> bool:
    """
    Check if the given email is valid.

    :param email: The email address to validate.
    :return: True if the email is valid, False otherwise.
    """
    try:
        return bool(validate_email(email, allow_smtputf8=False))
    except EmailNotValidError:
        return False


def validate_file(file: UploadFile = File(...)) -> tuple[bytes, str | None]:
    """
    Validate the uploaded file.

    This function checks whether the file has an allowed format and whether its size is below the maximum allowed size.

    If the file does not pass these checks, raise an HTTPException. Otherwise, return the file and its filename.

    :param file: The uploaded file.
    :return: A dictionary mapping the file to its filename.
    :raise HTTPException: If the file format is not allowed or if the file size is too large.
    """
    filename = file.filename
    # Value of type variable "AnyOrLiteralStr" of "splitext" cannot be "str | None"
    # Item "None" of "str | None" has no attribute "lower"
    if os.path.splitext(filename)[1].lower() not in ALLOWED_EXTENSIONS:  # type: ignore[type-var,union-attr]
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=_("Format not allowed. It must be a PNG, JPEG, PDF or ZIP file"),
        )
    new_file = file.file.read()
    if len(new_file) >= MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=_("File is too large"),
        )
    return new_file, filename


def get_modified_data_fields(session: Session, application: models.Application) -> models.ApplicationWithRelations:
    modified_data_fields: dict[str, Any] = {"award_updates": {}, "borrower_updates": {}}

    for action in (
        session.query(models.ApplicationAction)
        .join(models.Application)
        .filter(
            models.ApplicationAction.application_id == application.id,
            col(models.ApplicationAction.type).in_(
                (models.ApplicationActionType.AWARD_UPDATE, models.ApplicationActionType.BORROWER_UPDATE)
            ),
        )
    ):
        action_data = action.data
        key_prefix = (
            "award_updates" if action.type == models.ApplicationActionType.AWARD_UPDATE else "borrower_updates"
        )
        for key in action_data:
            if (
                key not in modified_data_fields[key_prefix]
                or action.created_at > modified_data_fields[key_prefix][key]["modified_at"]
            ):
                modified_data_fields[key_prefix][key] = {
                    "modified_at": action.created_at,
                    "user": action.user.name,
                    "user_type": action.user.type,
                }

    return models.ApplicationWithRelations(
        **application.model_dump(),
        award=application.award,
        borrower=application.borrower,
        lender=application.lender,
        credit_product=application.credit_product,
        # incompatible type "list[BorrowerDocument]"; expected "list[BorrowerDocumentBase]"
        # https://github.com/open-contracting/credere-backend/issues/376
        borrower_documents=application.borrower_documents,  # type: ignore[arg-type]
        modified_data_fields=modified_data_fields,
    )


def create_award_from_data_source(
    session: Session, entry: dict[str, Any], borrower_id: int | None = None, *, previous: bool = False
) -> models.Award:
    """
    Create a new award and insert it into the database.

    :param entry: The dictionary containing the award data.
    :param borrower_id: The ID of the borrower associated with the award. (default: None)
    :param previous: Whether the award is a previous award or not. (default: False)
    :return: The inserted award.
    """
    data = data_access.get_award(entry, borrower_id, previous=previous)
    if award := models.Award.first_by(session, "source_contract_id", data["source_contract_id"]):
        raise SkippedAwardError(
            "Award already exists",
            data={
                "found": award.id,
                "lookup": {"source_contract_id": data["source_contract_id"]},
                "create": {"entry": entry, "borrower_id": borrower_id, "previous": previous},
            },
        )

    return models.Award.create(session, **data)


# A background task.
def get_previous_awards_from_data_source(
    borrower_id: int, db_provider: Callable[[], Generator[Session, None, None]] = get_db
) -> None:
    """
    Fetch previous awards for a borrower that accepted an application.

    This won't generate an application; it will only insert the awards into the database.

    :param borrower_id: The ID of the borrower for whom to fetch and process previous awards.
    """
    with contextmanager(db_provider)() as session:
        borrower = models.Borrower.get(session, borrower_id)

    awards_response_json = loads(data_access.get_previous_awards(borrower.legal_identifier))
    if not awards_response_json:
        return

    for entry in awards_response_json:
        with contextmanager(db_provider)() as session, handle_skipped_award(session, "Error creating award"):
            create_award_from_data_source(session, entry, borrower.id, previous=True)

            session.commit()


def create_or_update_borrower_document(
    session: Session,
    filename: str | None,
    application: models.Application,
    borrower_document_type: models.BorrowerDocumentType,
    file: bytes,
    *,
    verified: bool | None = False,
) -> models.BorrowerDocument:
    """
    Create a new borrower document or update an existing one.

    This function first checks if a document of the same type already exists for the application in the session.
    If it does, it updates the existing document's file, name, verified status, and submission time with the provided
    values. If it doesn't, it creates a new BorrowerDocument with the provided values and adds it to the session.

    :param filename: The name of the file to be added or updated.
    :param application: The application associated with the document.
    :param borrower_document_type: The type of the document.
    :param file: The file to be added or updated.
    :param verified: The verified status of the document. Defaults to False.
    :return: The newly created or updated BorrowerDocument.
    """
    existing_document: models.BorrowerDocument | None = (
        session.query(models.BorrowerDocument)
        .filter(
            models.BorrowerDocument.application_id == application.id,
            models.BorrowerDocument.type == borrower_document_type,
        )
        .first()
    )

    if existing_document:
        return existing_document.update(
            session,
            file=file,
            name=filename,
            verified=verified,
            submitted_at=datetime.utcnow(),
        )

    return models.BorrowerDocument.create(
        session,
        application_id=application.id,
        type=borrower_document_type,
        file=file,
        name=filename,
        verified=verified,
    )


def handle_external_onboarding(
    session: Session, application: models.Application, *, forward: bool = False
) -> RedirectResponse:
    with rollback_on_error(session):
        external_onboarding_url = application.lender.external_onboarding_url

        if not external_onboarding_url:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=_("The lender has no external onboarding URL"),
            )

        if not application.borrower_accessed_external_onboarding_at:
            application.borrower_accessed_external_onboarding_at = datetime.now(application.created_at.tzinfo)

            models.ApplicationAction.create(
                session,
                type=models.ApplicationActionType.MSME_ACCESS_EXTERNAL_ONBOARDING,
                application_id=application.id,
            )

            session.commit()

            if forward:
                return RedirectResponse(external_onboarding_url, status_code=status.HTTP_303_SEE_OTHER)

        return RedirectResponse(
            f"{app_settings.frontend_url}/application/{application.uuid}/external-onboarding-completed",
            status_code=status.HTTP_303_SEE_OTHER,
        )
