from fastapi import HTTPException, status

class UserAlreadyExists(HTTPException):
    def __init__(self, detail: str = "User already exists"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)

class InvalidCredentials(HTTPException):
    def __init__(self, detail: str = "Invalid credentials"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

class InvalidToken(HTTPException):
    def __init__(self, detail: str = "Invalid token"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

class TokenExpired(HTTPException):
    def __init__(self, detail: str = "Token expired"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

class NotFound(HTTPException):
    def __init__(self, detail: str = "Not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

