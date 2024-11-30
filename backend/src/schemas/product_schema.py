from pydantic import BaseModel
from typing import List
from typing import Optional
from typing import Any


class ProductCreate(BaseModel):
    product_name: str
    description: str
    price: float
    seller_id: str


class ProductResponse(ProductCreate):
    id: str
    images: List[str] = []
    seller_id: str


class UpdateProductRequest(BaseModel):
    isApproved: bool


class UpdateProductDetails(BaseModel):
    product_name: str
    description: str
    price: float
    category: Optional[str] = None
    images: Optional[List[str]] = None


class CategoryBase(BaseModel):
    name: str


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(CategoryBase):
    pass


class CategoryInDB(CategoryBase):
    id: str

    class Config:
        from_attributes = True
