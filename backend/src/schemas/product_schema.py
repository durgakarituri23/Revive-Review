from pydantic import BaseModel
from typing import List

class ProductCreate(BaseModel):
    product_name: str
    description: str
    price: float

class ProductResponse(ProductCreate):
    id: str
    images: List[str] = []