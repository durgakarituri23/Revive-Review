
from fastapi import APIRouter,Form,UploadFile,File
from typing import List
from src.services.product_service import upload_products
router = APIRouter()  # Create an APIRouter instance


@router.post("/upload-products", response_description="Upload multiple products")
async def upload_product(
    product_names: List[str] = Form(...),
    descriptions: List[str] = Form(...),
    prices: List[float] = Form(...),
    images: List[UploadFile] = File(...)
):
    products = []

    # Group images based on the number of products
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