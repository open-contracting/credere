from background_utils import generate_uuid, get_secret_hash
from background_config import DAYS_UNTIL_EXPIRED
from app.schema.core import Application
from datetime import datetime, timedelta
from app.db.session import get_db
from contextlib import contextmanager
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException


def insert_application(application: Application):
    with contextmanager(get_db)() as session:
        try:
            obj_db = Application(**application)
            session.add(obj_db)
            session.commit()
            session.refresh(obj_db)
        except SQLAlchemyError as e:
            print(e)
            raise HTTPException(
                status_code=500, detail="Database error occurred"
            ) from e

    return obj_db


def create_application(
    award_id, borrower_id, email, legal_identifier, source_contract_id
):
    new_uuid: str = generate_uuid(legal_identifier)
    award_borrowed_identifier: str = get_secret_hash(
        legal_identifier + source_contract_id
    )
    application = {
        "award_id": award_id,
        "borrower_id": borrower_id,
        "primary_email": email,
        "award_borrowed_identifier": award_borrowed_identifier,
        "uuid": new_uuid,
        "expired_at": datetime.utcnow() + timedelta(days=DAYS_UNTIL_EXPIRED),
    }

    insert_application(application)
    return application
