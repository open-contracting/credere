from fastapi import APIRouter, Depends

from app.auth import get_current_user, verifyTokeClass

authorizedCredentials = verifyTokeClass()

router = APIRouter()


@router.get("/secure-endpoint-example", dependencies=[Depends(authorizedCredentials)])
def example_of_secure_endpoint():
    """
    Example of a secure endpoint that requires authorized credentials.

    This endpoint is protected and requires authorization using the `authorizedCredentials` dependency.

    :return: Response indicating the success of the request.
    :rtype: dict
    """
    return {"message": "OK"}


@router.get(
    "/secure-endpoint-example-username-extraction",
    dependencies=[Depends(authorizedCredentials)],
)
def example_of_secure_endpoint_with_username(
    usernameFromToken: str = Depends(get_current_user),
):
    """
    Example of a secure endpoint that requires authorized credentials and extracts the username from the token.

    This endpoint is protected and requires authorization using the `authorizedCredentials` dependency.
    The `get_current_user` dependency is used to extract the username from the token.

    :param usernameFromToken: Username extracted from the token.
    :type usernameFromToken: str

    :return: Response containing the extracted username.
    :rtype: dict
    """
    return {"username": usernameFromToken}
