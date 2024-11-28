from fastapi import APIRouter, Form, UploadFile, File
from typing import List
from src.services.product_service import (
    upload_products,
    get_unapproved_products,
    update_product_status,
    get_approved_products,
    update_product_info,
    get_seller_products  # New function to add
)
from src.models.product import ProductModel 
from src.schemas.product_schema import UpdateProductRequest, UpdateProductDetails
router = APIRouter()

@router.post("/upload-products", response_description="Upload multiple products")
async def upload_product(
    product_names: List[str] = Form(...),
    descriptions: List[str] = Form(...),
    prices: List[float] = Form(...),
    categories: List[str] = Form(...),
    seller_ids: List[str] = Form(...),  # Add seller_ids parameter
    images: List[UploadFile] = File(...)
):
    products = []

    image_index = 0
    images_per_product = len(images) // len(product_names)
    
    for product_name, description, price, category, seller_id in zip(
        product_names, descriptions, prices, categories, seller_ids
    ):
        product_images = images[image_index:image_index + images_per_product]
        image_index += images_per_product

        # Create product data with seller_id
        product_data = {
            "product_name": product_name,
            "description": description,
            "price": price,
            "category": category,
            "seller_id": seller_id  # Include seller_id in the product data
        }

        # Call the upload function with product data and images
        product = await upload_products(product_data, product_images)
        products.append(product)

    return {"products": products}

# New endpoint to get products by seller ID
@router.get("/products/seller/{seller_id}", response_model=List[ProductModel])
async def get_seller_products_endpoint(seller_id: str):
    return await get_seller_products(seller_id)


@router.get("/products/unapproved", response_model=List[ProductModel])
async def get_product():
    return await get_unapproved_products()

@router.get("/products/approved",response_model=List[ProductModel])
async def get_product():
    return await get_approved_products()


@router.put("/products/{product_id}", response_model=ProductModel)
async def update_product(product_id: str, isApproved: UpdateProductRequest):
    return await update_product_status(product_id,isApproved.dict())

@router.put("/manage_products/{productId}")
async def update_product_details(productId: str,  product:UpdateProductDetails):
   
    return await update_product_info(productId,product.dict())