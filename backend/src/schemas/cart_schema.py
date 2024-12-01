from pydantic import BaseModel, EmailStr
from typing import Optional

class UpdateCart(BaseModel):
    email: str
    id: str
    quantity: int

class DeleteCartProduct(BaseModel):
    email: str
    productId: str

class CartResponse(BaseModel):
    message: str
    
class UpdatePaymentStatus(BaseModel):
    email: EmailStr
    buyed: bool