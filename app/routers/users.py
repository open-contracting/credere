from botocore.exceptions import ClientError
from fastapi import APIRouter, Header, HTTPException, Response, status

from ..core import user_dependencies
from ..core.user_dependencies import client
from ..schema.user_tables.users import BasicUser, SetupMFA

router = APIRouter()


@router.post("/users/register")
def register_user(user: BasicUser):
    try:
        response = user_dependencies.admin_create_user(user.username, user.name)
        print(response)
    except client.exceptions.UsernameExistsException as e:
        print(e)
        raise HTTPException(status_code=400, detail="Username already exists")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong")

    return {"message": "User created successfully"}


@router.put("/users/change-password")
def change_password(user: BasicUser, response: Response):
    try:
        response = user_dependencies.initiate_auth(user.username, user.temp_password)
        if response["ChallengeName"] == "NEW_PASSWORD_REQUIRED":
            session = response["Session"]
            response = user_dependencies.respond_to_auth_challenge(
                user.username, session, "NEW_PASSWORD_REQUIRED", user.password
            )

        print(response)

        user_dependencies.verified_email(user.username)
        if response["ChallengeName"] == "MFA_SETUP":
            mfa_setup_response = user_dependencies.mfa_setup(response["Session"])
            return {
                "message": "Password changed with MFA setup required",
                "secret_code": mfa_setup_response["secret_code"],
                "session": mfa_setup_response["session"],
                "username": user.username,
            }

        return {"message": "Password changed"}
    except ClientError as e:
        print(e)
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        if e.response["Error"]["Code"] == "ExpiredTemporaryPasswordException":
            return {"message": "Temporal password is expired, please request a new one"}
        else:
            return {"message": "There was an error trying to update the password"}


@router.put("/users/setup-mfa")
def setup_mfa(user: SetupMFA, response: Response):
    try:
        response = user_dependencies.verify_software_token(
            user.secret, user.session, user.temp_password
        )
        print(response)

        return {"message": "MFA configured successfully"}
    except ClientError as e:
        print(e)
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        if e.response["Error"]["Code"] == "NotAuthorizedException":
            return {"message": "Invalid session for the user, session is expired"}
        else:
            return {"message": "There was an error trying to setup mfa"}


@router.post("/users/login")
def login(user: BasicUser, response: Response):
    try:
        response = user_dependencies.initiate_auth(user.username, user.password)

        # todo load user from db
        return {
            "user": {"email": user.username, "name": "User"},
            "access_token": response["AuthenticationResult"]["AccessToken"],
        }
    except ClientError as e:
        print(e)
        response.status_code = status.HTTP_401_UNAUTHORIZED
        if e.response["Error"]["Code"] == "ExpiredTemporaryPasswordException":
            return {"message": "Temporal password is expired, please request a new one"}
        else:
            return {"message": "There was an error trying to login"}


@router.post("/users/login-mfa")
def login_mfa(user: BasicUser):
    try:
        response = user_dependencies.initiate_auth(user.username, user.password)
        if "ChallengeName" in response:
            print(response["ChallengeName"])
            session = response["Session"]
            access_token = user_dependencies.respond_to_auth_challenge(
                user.username,
                session,
                response["ChallengeName"],
                "",
                mfa_code=user.temp_password,
            )
            print(access_token)

            # todo load user from db
            return {
                "user": {"email": user.username, "name": "User"},
                "access_token": access_token,
            }

    except ClientError as e:
        print(e)
        if e.response["Error"]["Code"] == "ExpiredTemporaryPasswordException":
            return {"message": "Temporal password is expired, please request a new one"}
        else:
            return {"message": "There was an error trying to login"}


@router.get("/users/logout")
def logout(Authorization: str = Header(None)):
    try:
        response = user_dependencies.logout_user(Authorization)
        print(response)
    except ClientError as e:
        print(e)
        return {"message": "User was unable to logout"}

    return {"message": "User logged out successfully"}


@router.get("/users/me")
def me(response: Response, Authorization: str = Header(None)):
    try:
        response = client.get_user(AccessToken=Authorization)
        for item in response["UserAttributes"]:
            if item["Name"] == "email":
                email_value = item["Value"]
                break

        return {"user": {"email": email_value, "name": "User"}}
    except ClientError as e:
        print(e)
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return {"message": "User not found"}


@router.post("/users/forgot-password")
def forgot_password(user: BasicUser):
    try:
        response = user_dependencies.reset_password(user.username)
        print(response)
        return {"message": "An email with a reset link was sent to end user"}
    except Exception as e:
        print(e)
        return {"message": "There was an issue trying to change the password"}
