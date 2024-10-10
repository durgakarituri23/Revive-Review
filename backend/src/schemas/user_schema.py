from pydantic import BaseModel, EmailStr


class RegisterModel(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: EmailStr
    password: str


class UserResponseModel(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: EmailStr

class LoginModel(BaseModel):
    email:EmailStr 
    password: str 

class LoginResponse(BaseModel):
    email:EmailStr 
    password: str 

    