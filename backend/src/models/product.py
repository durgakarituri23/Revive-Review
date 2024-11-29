from pydantic import BaseModel, Field
from bson import ObjectId
from typing import List,Optional

class ProductModel(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    product_name: str
    description: str
    price: float
    seller_id: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[int] = 0
    status: Optional[str] = "active"
    images: List[str] = Field(default_factory=list)
    isApproved: Optional[bool] = False

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}