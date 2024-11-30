from fastapi import APIRouter, Query
from src.models.cart import Cart
from src.schemas.cart_schema import UpdateCart, DeleteCartProduct
from src.services.cart_service import (
    add_to_cart,
    fetch_cart_items,
    update_cart_quantity,
    delete_cart_product,
    clear_cart,
    get_cart_total
)

router = APIRouter(tags=["cart"])

@router.post("/cart/add")  # Changed to match frontend endpoint
async def add_to_cart_route(request: Cart):
    """Add items to cart"""
    return await add_to_cart(request)

@router.get("/cart")  # Changed to match frontend endpoint
async def get_cart_route(email: str = Query(...)):
    """Get cart items for a user"""
    return await fetch_cart_items(email)

@router.put("/cart/update")  # Changed to match frontend endpoint
async def update_cart_route(request: UpdateCart):
    """Update item quantity in cart"""
    return await update_cart_quantity(request)

@router.delete("/cart/delete")  # Changed to match frontend endpoint
async def delete_from_cart_route(request: DeleteCartProduct):
    """Remove item from cart"""
    return await delete_cart_product(request)

@router.delete("/cart/clear")
async def clear_cart_route(email: str = Query(...)):
    """Clear all items from cart"""
    return await clear_cart(email)

@router.get("/cart/total")
async def get_cart_total_route(email: str = Query(...)):
    """Get total price of cart"""
    return await get_cart_total(email)