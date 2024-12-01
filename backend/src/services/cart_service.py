from fastapi import HTTPException
from src.config.database import cart, product_collection
from src.models.cart import Cart
from src.schemas.cart_schema import UpdateCart, DeleteCartProduct, UpdatePaymentStatus
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from src.services.buyer_service import verify_buyer
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def add_to_cart(request: Cart):
    """Add items to user's cart"""
    try:
        await verify_buyer(request.email)
        logger.info(f"Adding items to cart for user: {request.email}")

        for item in request.products:
            product = await product_collection.find_one({"_id": item.productId})

            if not product:
                raise HTTPException(status_code=404, detail=f"Product not found")

            if product.get("status") != "approved":
                raise HTTPException(
                    status_code=400, detail=f"Product is not approved for purchase"
                )

        existing_cart = await cart.find_one({"email": request.email})

        if existing_cart:
            logger.info(f"Updating existing cart for user: {request.email}")
            updated_products = existing_cart.get("products", [])

            for new_item in request.products:
                product_found = False
                for cart_item in updated_products:
                    if cart_item["productId"] == new_item.productId:
                        cart_item["quantity"] += new_item.quantity
                        product_found = True
                        break
                if not product_found:
                    updated_products.append(
                        {"productId": new_item.productId, "quantity": new_item.quantity}
                    )

            await cart.update_one(
                {"email": request.email}, {"$set": {"products": updated_products}}
            )
        else:
            logger.info(f"Creating new cart for user: {request.email}")
            new_cart = {
                "email": request.email,
                "products": [
                    {"productId": item.productId, "quantity": item.quantity}
                    for item in request.products
                ],
                "buyed": False,
            }
            await cart.insert_one(new_cart)

        return {"message": "Products added to cart successfully"}

    except Exception as e:
        logger.error(f"Error in add_to_cart: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def fetch_cart_items(email: str):
    """Fetch cart items with product details"""
    try:
        await verify_buyer(email)
        logger.info(f"Fetching cart items for user: {email}")

        user_cart = await cart.find_one({"email": email})

        if not user_cart or not user_cart.get("products"):
            return []

        product_ids = [item["productId"] for item in user_cart["products"]]
        all_products = await product_collection.find(
            {"_id": {"$in": product_ids}}
        ).to_list(None)

        quantity_map = {
            item["productId"]: item["quantity"] for item in user_cart["products"]
        }

        matched_products = []
        for product in all_products:
            product_id_str = str(product["_id"])
            if product_id_str in quantity_map:
                product_copy = dict(product)
                product_copy["_id"] = product_id_str
                product_copy["quantity"] = quantity_map[product_id_str]
                matched_products.append(product_copy)

        return jsonable_encoder(matched_products)

    except Exception as e:
        logger.error(f"Error in fetch_cart_items: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def update_cart_quantity(request: UpdateCart):
    """Update item quantity in cart"""
    try:
        await verify_buyer(request.email)

        result = await cart.update_one(
            {"email": request.email, "products.productId": request.id},
            {"$set": {"products.$.quantity": request.quantity}},
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Product not found in cart")

        return {"message": "Cart updated successfully"}
    except Exception as e:
        logger.error(f"Error in update_cart_quantity: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def delete_cart_product(request: DeleteCartProduct):
    """Remove item from cart"""
    try:
        await verify_buyer(request.email)

        result = await cart.update_one(
            {"email": request.email},
            {"$pull": {"products": {"productId": request.productId}}},
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Product not found in cart")

        return {"message": "Product removed from cart successfully"}
    except Exception as e:
        logger.error(f"Error in delete_cart_product: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def clear_cart(email: str):
    """Clear all items from cart"""
    try:
        await verify_buyer(email)
        logger.info(f"Clearing cart for user: {email}")

        result = await cart.update_one(
            {"email": email},
            {
                "$set": {
                    "products": [],
                    "buyed": True,
                    "purchased_at": str(datetime.utcnow())
                }
            }
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Cart not found")

        return {"message": "Cart cleared successfully"}
    except Exception as e:
        logger.error(f"Error in clear_cart: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def get_cart_total(email: str):
    """Calculate total price of cart items"""
    try:
        items = await fetch_cart_items(email)
        total = sum(item.get("price", 0) * item.get("quantity", 1) for item in items)
        return {"total": total}
    except Exception as e:
        logger.error(f"Error calculating cart total: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def update_payment_status(request: UpdatePaymentStatus):
    """Update payment status for cart items"""
    try:
        await verify_buyer(request.email)
        logger.info(f"Updating payment status for user: {request.email}")

        # Find the user's cart
        user_cart = await cart.find_one({"email": request.email})
        if not user_cart:
            logger.error(f"Cart not found for user: {request.email}")
            raise HTTPException(status_code=404, detail="Cart not found")

        # Update the payment status
        result = await cart.update_one(
            {"email": request.email},
            {"$set": {"buyed": request.buyed, "purchased_at": str(datetime.utcnow())}},
        )

        if result.modified_count == 0:
            logger.error(f"Failed to update payment status for user: {request.email}")
            raise HTTPException(
                status_code=500, detail="Failed to update payment status"
            )

        # Update product statuses
        if request.buyed:
            product_ids = [item["productId"] for item in user_cart.get("products", [])]
            for product_id in product_ids:
                await product_collection.update_one(
                    {"_id": product_id},
                    {
                        "$set": {
                            "status": "sold",
                            "sold_at": str(datetime.utcnow()),
                            "buyer_email": request.email,
                        }
                    },
                )

        logger.info(f"Successfully updated payment status for user: {request.email}")
        return {"message": "Payment status updated successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in update_payment_status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
