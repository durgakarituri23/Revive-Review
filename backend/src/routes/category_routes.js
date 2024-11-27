from typing import List
from fastapi import APIRouter, Depends, HTTPException

from src.models.category import Category
from src.services.category_service import get_categories, create_category, update_category, delete_category
router = APIRouter()

@router.get("/categories/", response_model=List[Category])
async def get_categories():
    return  await get_categories()

@router.post("/categories/new")
async def create_category(category: Category):
    return await create_category(category)

@router.put("/categories/{name}")
async def update_category(name: str, category: Category):
    return await update_category(name, category)

@router.delete("/categories/{name}")
async def delete_category(name: str):
    return await delete_category(name)