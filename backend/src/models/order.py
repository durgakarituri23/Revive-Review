from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float
    image: Optional[str]

class OrderModel(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    buyer_email: str
    order_date: str = Field(default_factory=lambda: datetime.now().isoformat())
    items: List[OrderItem]
    total_amount: float
    status: str = "completed"  # pending, completed, cancelled
    shipping_address: dict
    payment_method: dict
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}