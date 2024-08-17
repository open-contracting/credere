import json
import os
from typing import Generator

from fastapi import status
from sqlalchemy.orm import Session, sessionmaker

from app import models
from app.settings import app_settings

BASEDIR = os.path.realpath(os.path.join(os.getcwd(), os.path.dirname(__file__)))


class MockResponse:
    def __init__(self, status_code, json_data):
        self.status_code = status_code
        self.json_data = json_data

    @property
    def text(self):
        return json.dumps(self.json_data)

    def json(self):
        return self.json_data


def load_json_file(filename):
    with open(os.path.join(BASEDIR, filename)) as f:
        return json.load(f)


def get_test_db(engine):
    factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def inner() -> Generator[Session, None, None]:
        session = factory()
        try:
            yield session
        finally:
            session.close()

    return inner


def create_user(session, aws_client, *, email, **kwargs):
    # Like create_user().
    user = models.User.create(session, email=email, **kwargs)
    response = aws_client.cognito.admin_create_user(
        UserPoolId=app_settings.cognito_pool_id,
        Username=email,
        TemporaryPassword=aws_client.generate_password(),
        MessageAction="SUPPRESS",
        UserAttributes=[{"Name": "email", "Value": email}],
    )
    user.external_id = response["User"]["Username"]
    session.commit()

    # Like change_password().
    response = aws_client.initiate_auth(email, "initial-autogenerated-password")
    assert response["ChallengeName"] == "NEW_PASSWORD_REQUIRED"
    response = aws_client.respond_to_auth_challenge(
        username=email,
        session=response["Session"],
        challenge_name="NEW_PASSWORD_REQUIRED",
        new_password="12345-UPPER-lower",
    )
    aws_client.cognito.admin_update_user_attributes(
        UserPoolId=app_settings.cognito_pool_id,
        Username=email,
        UserAttributes=[
            {"Name": "email_verified", "Value": "true"},
        ],
    )

    return {"Authorization": "Bearer " + response["AuthenticationResult"]["AccessToken"]}


def assert_ok(response):
    assert response.status_code == status.HTTP_200_OK, f"{response.status_code}: {response.json()}"
