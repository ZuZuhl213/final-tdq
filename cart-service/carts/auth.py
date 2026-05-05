import os

import jwt
from rest_framework import authentication, exceptions


class ServiceUser:
    def __init__(self, user_id: int, username: str, role: str):
        self.id = user_id
        self.username = username
        self.role = role
        self.is_authenticated = True


class JWTServiceAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ", 1)[1]
        secret = os.environ.get("JWT_SECRET_KEY", "jwt-secret")
        try:
            payload = jwt.decode(token, secret, algorithms=["HS256"])
        except jwt.PyJWTError as exc:
            raise exceptions.AuthenticationFailed("Invalid token") from exc

        user_id = payload.get("user_id")
        if not user_id:
            raise exceptions.AuthenticationFailed("Invalid token payload")

        user = ServiceUser(user_id=user_id, username=payload.get("username", ""), role=payload.get("role", "customer"))
        return (user, token)
