# src/services/product_service.py
from motor.motor_asyncio import AsyncIOMotorClient
from src.models.product import ProductModel, Category
import os
from fastapi import UploadFile, HTTPException
from src.config.database import upload_product
from src.schemas.product_schema import (
    UpdateProductRequest,
    UpdateProductDetails,
    CategoryCreate,
    CategoryUpdate,
)
from typing import List, Optional
from bson import ObjectId
from uuid import uuid4

UPLOAD_DIRECTORY = "./uploaded_images"

if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)


async def save_image(image: UploadFile):
    filename = f"{uuid4()}_{image.filename}"
    file_path = os.path.join(UPLOAD_DIRECTORY, filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await image.read())
    return filename


async def upload_products(product_data: dict, images: List[UploadFile]):
    try:
        image_filenames = []
        for image in images:
            if image:
                filename = await save_image(image)
                image_filenames.append(filename)

        validated_data = {
            "product_name": product_data["product_name"],
            "description": product_data["description"],
            "price": float(product_data["price"]),
            "category": product_data["category"],
            "seller_id": product_data["seller_id"],
            "images": image_filenames,
            "isApproved": False,
        }

        product = ProductModel(**validated_data)
        await upload_product.insert_one(product.dict(by_alias=True))
        return product

    except Exception as e:
        print(f"Error in upload_products: {str(e)}")
        raise e


async def get_seller_products_by_id(seller_id: str):
    products = []
    async for product in upload_product.find({"seller_id": seller_id}):
        products.append(product)
    return products


async def get_unapproved_products():
    products = []
    async for product in upload_product.find({"isApproved": False}):
        products.append(product)
    return products


async def get_approved_products():
    products = []
    async for product in upload_product.find({"isApproved": True}):
        products.append(product)
    return products


# New function to get products by seller ID
async def get_seller_products(seller_id: str):
    products = []
    async for product in upload_product.find({"seller_id": seller_id}):
        products.append(product)
    return products


async def fetch_product_by_id(product_id: str):  # Changed function name
    product = await upload_product.find_one({"_id": product_id})
    if product:
        return ProductModel(**product)
    return None


async def update_product_status(product_id: str, isApproved: dict):
    result = await upload_product.update_one(
        {"_id": product_id}, {"$set": {"isApproved": isApproved["isApproved"]}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    updated_product = await upload_product.find_one({"_id": product_id})
    return ProductModel(**updated_product)


async def update_product_info(
    product_id: str, product: dict, new_images: Optional[List[UploadFile]] = None
):
    update_data = {
        "product_name": product["product_name"],
        "description": product["description"],
        "price": product["price"],
        "category": product["category"],
    }

    # Handle images
    if new_images:
        image_filenames = []
        for image in new_images:
            if image:
                filename = await save_image(image)
                image_filenames.append(filename)

        # Combine with existing images
        if product.get("images"):
            image_filenames.extend(product["images"])

        update_data["images"] = image_filenames

    result = await upload_product.update_one({"_id": product_id}, {"$set": update_data})

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    updated_product = await upload_product.find_one({"_id": product_id})
    return updated_product


# New function to delete seller's product
async def delete_seller_product(product_id: str, seller_id: str):
    result = await upload_product.delete_one(
        {
            "_id": product_id,
            "seller_id": seller_id,  # Ensure seller can only delete their own products
        }
    )

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found or unauthorized")

    return {"message": "Product deleted successfully"}
