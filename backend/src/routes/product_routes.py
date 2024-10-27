
from fastapi import APIRouter,Form,UploadFile,File
from typing import List
from src.services.product_service import upload_products,get_unapproved_products,update_product_status
from src.models.product import ProductModel 
from src.schemas.product_schema import UpdateProductRequest
router = APIRouter()  # Create an APIRouter instance
from fastapi.staticfiles import StaticFiles


@router.post("/upload-products", response_description="Upload multiple products")
async def upload_product(
    product_names: List[str] = Form(...),
    descriptions: List[str] = Form(...),
    prices: List[float] = Form(...),
    images: List[UploadFile] = File(...)
):
    products = []

    image_index = 0
    images_per_product = len(images) // len(product_names)
    
    for product_name, description, price  in zip(product_names, descriptions, prices):
        product_images = images[image_index:image_index + images_per_product]
        image_index += images_per_product
        product_data = {
            "product_name": product_name,
            "description": description,
            "price": price
        }
        product = await upload_products(product_data, product_images)
        products.append(product)
    return products


@router.get("/products/unapproved", response_model=List[ProductModel])
async def get_product():
    return await get_unapproved_products()

@router.put("/products/{product_id}", response_model=ProductModel)
async def update_product(product_id: str, isApproved: UpdateProductRequest):
    return await update_product_status(product_id,isApproved.dict())
    