from pydantic import BaseModel, EmailStr
from typing import Optional

class User(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: EmailStr
    password: str 
    address: Optional[str] = None  # Optional field for address
    postal_code: Optional[str] = None  # Optional field for postal code


class Seller(User):
    business_name:str
    address: str
    tax_id: str 