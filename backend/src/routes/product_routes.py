from fastapi import APIRouter, Form, UploadFile, File, HTTPException, Depends
from typing import List, Optional
from src.services.product_service import (
    upload_products,
    get_unapproved_products,
    update_product_status,
    get_approved_products,
    update_product_info,
    get_seller_products,
)
from src.services.category_service import (
    create_category,
    get_all_categories,
    update_category,
    delete_category,
)
from src.models.product import ProductModel
from src.schemas.product_schema import (
    UpdateProductRequest,
    UpdateProductDetails,
    CategoryCreate,
    CategoryUpdate,
)
from src.config.auth_middleware import admin_only, get_current_user

router = APIRouter()


# Existing product upload endpoint
@router.post("/upload-products", response_description="Upload multiple products")
async def upload_product(
    product_names: List[str] = Form(...),
    descriptions: List[str] = Form(...),
    prices: List[float] = Form(...),
    categories: List[str] = Form(...),
    stocks: List[int] = Form(...),
    seller_ids: List[str] = Form(...),
    images: List[UploadFile] = File(...),
):
    products = []
    try:
        image_index = 0
        images_per_product = len(images) // len(product_names)

        for i, (
            product_name,
            description,
            price,
            category,
            stock,
            seller_id,
        ) in enumerate(
            zip(product_names, descriptions, prices, categories, stocks, seller_ids)
        ):
            # Get images for this product
            product_images = images[image_index : image_index + images_per_product]
            image_index += images_per_product

            product_data = {
                "product_name": product_name,
                "description": description,
                "price": float(price),
                "category": category,
                "stock": int(stock),
                "seller_id": seller_id,
            }

            product = await upload_products(product_data, product_images)
            products.append(product)

        return {"products": products}

    except Exception as e:
        print(f"Error in upload_product endpoint: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# Existing seller products endpoint
@router.get("/products/seller/{seller_id}", response_model=List[ProductModel])
async def get_seller_products_endpoint(seller_id: str):
    return await get_seller_products(seller_id)


# Existing unapproved products endpoint
@router.get("/products/unapproved", response_model=List[ProductModel])
async def get_product():
    return await get_unapproved_products()


# Existing approved products endpoint
@router.get("/products/approved", response_model=List[ProductModel])
async def get_product():
    return await get_approved_products()


# Existing update product status endpoint
@router.put("/products/{product_id}", response_model=ProductModel)
async def update_product(product_id: str, isApproved: UpdateProductRequest):
    return await update_product_status(product_id, isApproved.dict())


# Existing update product details endpoint
@router.put("/manage_products/{productId}")
async def update_product_details(
    productId: str,
    product_name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category: Optional[str] = Form(None),
    stock: Optional[int] = Form(0),
    status: Optional[str] = Form("active"),
    existing_images: Optional[str] = Form(None),
    new_images: Optional[UploadFile] = File(None),
):
    product_data = {
        "product_name": product_name,
        "description": description,
        "price": price,
        "category": category,
        "stock": stock,
        "status": status,
        "images": [existing_images] if existing_images else [],
    }

    updated_product = await update_product_info(
        productId, product_data, [new_images] if new_images else None
    )
    return updated_product


@router.get("/categories", response_description="Get all categories")
async def get_categories():
    """Get all categories - accessible by all users"""
    return await get_all_categories()


@router.post("/categories", response_description="Create new category")
async def add_category(name: str = Form(...)):
    """Create a new category"""
    try:
        # Create a dict that matches your schema
        category_dict = {"name": name}
        category_data = CategoryCreate(**category_dict)
        return await create_category(category_data)
    except Exception as e:
        print(f"Error creating category: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/categories/{category_id}", response_description="Update category")
async def update_category_endpoint(category_id: str, name: str = Form(...)):
    """Update an existing category"""
    category_data = CategoryUpdate(name=name)
    return await update_category(category_id, category_data)


@router.delete("/categories/{category_id}", response_description="Delete category")
async def delete_category_endpoint(category_id: str):
    """Delete a category"""
    return await delete_category(category_id)
