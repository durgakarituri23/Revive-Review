from pydantic import BaseModel, EmailStr

class User(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: EmailStr
    password: str 


class Seller(User):
    business_name:str
    address: str
    tax_id: str 