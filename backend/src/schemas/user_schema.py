from pydantic import BaseModel, EmailStr
from typing import Optional,Union


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
    email: EmailStr 
    password: str
    access_token: str
    token_type: str

class PasswordReset(BaseModel):
    email:EmailStr

class AuthCode(BaseModel):
    code : str

class updatePassword(BaseModel):
    email:EmailStr
    password: str
    
class UpdatedPassword(BaseModel):
    email:EmailStr
    password: str


class RegisterSeller(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: EmailStr
    password: str
    business_name:str
    address: str
    tax_id: str 


class UserDetails(BaseModel):
    first_name: str
    last_name: str
    phone: str
    address: Optional[str]
    postal_code: Optional[str]

class UpdateUserDetails(BaseModel):
    first_name: str
    last_name: str
    email:EmailStr
    phone: str
    address: Optional[str]
    postal_code: Optional[str]

class update_cart(BaseModel):
    email:EmailStr
    id:str
    quantity:int

class delete_cart_product(BaseModel):
    email:EmailStr
    productId:str

class CardPayment(BaseModel):
    type: str = "card"
    cardNumber: str
    cardName: str
    cvv: str

class PaypalPayment(BaseModel):
    type: str = "paypal"
    paypalEmail: str  

PaymentMethod = Union[CardPayment, PaypalPayment]

class PaymentMethodrequest(BaseModel):
    email: str
    paymentMethod: PaymentMethod

class UpdatePaymentStatus(BaseModel):
    email: EmailStr
    buyed: bool