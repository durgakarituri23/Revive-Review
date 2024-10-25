from motor.motor_asyncio import AsyncIOMotorClient
from src.models.product import ProductModel
import os
from fastapi import UploadFile
from src.config.database import upload_product
from typing import List
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
    image_filenames = [await save_image(image) for image in images]
    product_data["images"] = image_filenames
    product = ProductModel(**product_data)
    await upload_product.insert_one(product.dict(by_alias=True))
    return product