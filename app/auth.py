import functools
from typing import TYPE_CHECKING, Any

import jwt
import requests
from fastapi import HTTPException, Request, status
from fastapi.security import HTTPBearer
from jwt.utils import base64url_decode
from pydantic import BaseModel

from app.i18n import _
from app.settings import app_settings

JWK = dict[str, str]


class JWKS(BaseModel):
    keys: list[JWK]


class JWTAuthorizationCredentials(BaseModel):
    jwt_token: str
    header: dict[str, str]
    claims: dict[str, Any]
    signature: str
    message: str


@functools.lru_cache
def get_keys() -> dict[str, JWK]:
    return {
        jwk["kid"]: jwk
        for jwk in JWKS.model_validate(
            requests.get(
                f"https://cognito-idp.{app_settings.aws_region}.amazonaws.com/"
                f"{app_settings.cognito_pool_id}/.well-known/jwks.json",
                timeout=10,
            ).json()
        ).keys
    }


# https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html
class JWTAuthorization(HTTPBearer):
    """
    An extension of HTTPBearer authentication to verify JWT (JSON Web Tokens) with public keys.

    This class loads and keeps track of public keys from an external source and verifies incoming tokens.

    :param auto_error: If set to True, automatic error responses will be sent when request authentication fails.
    """

    def __init__(self, *, auto_error: bool = True):
        super().__init__(auto_error=auto_error)
        self.kid_to_jwk = get_keys()

    def verify_jwk_token(self, jwt_credentials: JWTAuthorizationCredentials) -> bool:
        """
        Verify the provided JWT credentials with the loaded public keys.

        :param jwt_credentials: JWT credentials extracted from the request.
        :return: Returns True if the token is verified, False otherwise.
        """
        try:
            kid = jwt_credentials.header["kid"]

            # "If you receive a token with the correct issuer but a different kid, Amazon Cognito might have rotated
            # the signing key. Refresh the cache from your user pool jwks_uri endpoint."
            if kid not in self.kid_to_jwk:
                get_keys.cache_clear()
                self.kid_to_jwk = get_keys()

            public_key = self.kid_to_jwk[kid]
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=_("JWK public key not found"),
            ) from None

        msg = jwt_credentials.message.encode()
        sig = base64url_decode(jwt_credentials.signature.encode())

        obj = jwt.PyJWK(public_key)
        alg_obj = obj.Algorithm
        if TYPE_CHECKING:
            assert alg_obj
        prepared_key = alg_obj.prepare_key(obj.key)

        return alg_obj.verify(msg, prepared_key, sig)

    # Return type "Coroutine[Any, Any, JWTAuthorizationCredentials]" of "__call__" incompatible with
    # return type "Coroutine[Any, Any, HTTPAuthorizationCredentials | None]" in supertypes "HTTPBearer" and "HTTPBase"
    async def __call__(self, request: Request) -> JWTAuthorizationCredentials:  # type: ignore[override]
        """
        Authenticate and verify the provided JWT token in the request.

        :param request: Incoming request instance.
        :return: JWT credentials if the token is verified.
        """
        if credentials := await super().__call__(request):
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=_("Wrong authentication method"),
                )

            jwt_token = credentials.credentials

            if "." in jwt_token:
                message, signature = jwt_token.rsplit(".", 1)
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=_("JWK invalid"),
                )

            try:
                jwt_credentials = JWTAuthorizationCredentials(
                    jwt_token=jwt_token,
                    header=jwt.get_unverified_header(jwt_token),
                    claims=jwt.decode(jwt_token, options={"verify_signature": False}),
                    signature=signature,
                    message=message,
                )
            except jwt.InvalidTokenError:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=_("JWK invalid"),
                ) from None

            if not self.verify_jwk_token(jwt_credentials):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=_("JWK invalid"),
                )

            return jwt_credentials
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=_("Not authenticated"),
        )
