from pydantic import BaseModel
from typing import List, Optional

class OrderItemSchema(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float
    image: Optional[str]

class OrderCreateSchema(BaseModel):
    buyer_email: str
    items: List[OrderItemSchema]
    total_amount: float
    shipping_address: dict
    payment_method: dict

class OrderUpdateSchema(BaseModel):
    status: str