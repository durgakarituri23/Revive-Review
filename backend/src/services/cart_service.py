from fastapi import HTTPException
from src.config.database import cart, product_collection
from src.models.cart import Cart
from src.schemas.cart_schema import UpdateCart, DeleteCartProduct, UpdatePaymentStatus
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from src.services.buyer_service import verify_buyer
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def add_to_cart(request: Cart):
    """Add items to user's cart"""
    try:
        # Verify buyer
        await verify_buyer(request.email)
        logger.info(f"Adding items to cart for user: {request.email}")

        for item in request.products:
            logger.info(f"Processing product ID: {item.productId}")

            # Query directly with string ID since IDs are stored as strings
            product = await product_collection.find_one({"_id": item.productId})
            
            logger.info(f"Product found: {product is not None}")

            if not product:
                # Debug log
                all_products = await product_collection.find().to_list(None)
                logger.info("All products in database:")
                for p in all_products:
                    logger.info(f"ID: {p['_id']}, Type: {type(p['_id'])}")
                raise HTTPException(
                    status_code=404,
                    detail=f"Product not found"
                )

            if product.get("status") != "approved":
                logger.error(f"Product not approved: {item.productId}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Product is not approved for purchase"
                )

            logger.info(f"Found valid product: {product.get('product_name', 'Unknown')}")

        # Get or create cart
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
                    updated_products.append({
                        "productId": new_item.productId,  # Keep as string
                        "quantity": new_item.quantity
                    })

            await cart.update_one(
                {"email": request.email},
                {"$set": {"products": updated_products}}
            )
        else:
            logger.info(f"Creating new cart for user: {request.email}")
            new_cart = {
                "email": request.email,
                "products": [{
                    "productId": item.productId,  # Keep as string
                    "quantity": item.quantity
                } for item in request.products],
                "buyed": False
            }
            await cart.insert_one(new_cart)

        logger.info(f"Successfully added products to cart for user: {request.email}")
        return {"message": "Products added to cart successfully"}

    except HTTPException as he:
        logger.error(f"HTTP Exception in add_to_cart: {str(he)}")
        raise he
    except Exception as e:
        logger.error(f"Unexpected error in add_to_cart: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def fetch_cart_items(email: str):
    """Fetch cart items with product details"""
    try:
        await verify_buyer(email)
        logger.info(f"Fetching cart items for user: {email}")

        user_cart = await cart.find_one({"email": email})
        
        if not user_cart or not user_cart.get("products"):
            logger.info(f"No cart items found for user: {email}")
            return []

        # Get product IDs from cart - keep as strings
        product_ids = [item["productId"] for item in user_cart["products"]]
        all_products = await product_collection.find({"_id": {"$in": product_ids}}).to_list(None)
        
        quantity_map = {item["productId"]: item["quantity"] for item in user_cart["products"]}

        matched_products = []
        for product in all_products:
            product_id_str = str(product["_id"])
            if product_id_str in quantity_map:
                product_copy = dict(product)
                product_copy["_id"] = product_id_str
                product_copy["quantity"] = quantity_map[product_id_str]
                matched_products.append(product_copy)

        logger.info(f"Successfully fetched {len(matched_products)} items for user: {email}")
        return jsonable_encoder(matched_products)

    except Exception as e:
        logger.error(f"Error in fetch_cart_items: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def update_cart_quantity(request: UpdateCart):
    """Update item quantity in cart"""
    try:
        await verify_buyer(request.email)
        logger.info(f"Updating quantity for product {request.id} in cart for user: {request.email}")

        result = await cart.update_one(
            {"email": request.email, "products.productId": request.id},
            {"$set": {"products.$.quantity": request.quantity}}
        )

        if result.modified_count == 0:
            logger.error(f"Product {request.id} not found in cart for user: {request.email}")
            raise HTTPException(status_code=404, detail="Product not found in cart")

        logger.info(f"Successfully updated quantity for product {request.id}")
        return {"message": "Cart updated successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in update_cart_quantity: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def delete_cart_product(request: DeleteCartProduct):
    """Remove item from cart"""
    try:
        await verify_buyer(request.email)
        logger.info(f"Removing product {request.productId} from cart for user: {request.email}")

        result = await cart.update_one(
            {"email": request.email},
            {"$pull": {"products": {"productId": request.productId}}}
        )

        if result.modified_count == 0:
            logger.error(f"Product {request.productId} not found in cart for user: {request.email}")
            raise HTTPException(status_code=404, detail="Product not found in cart")

        logger.info(f"Successfully removed product {request.productId} from cart")
        return {"message": "Product removed from cart successfully"}
    except HTTPException as he:
        raise he
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
            {"$set": {"products": []}}
        )

        if result.modified_count == 0:
            logger.error(f"Cart not found for user: {email}")
            raise HTTPException(status_code=404, detail="Cart not found")

        logger.info(f"Successfully cleared cart for user: {email}")
        return {"message": "Cart cleared successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in clear_cart: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def get_cart_total(email: str):
    """Calculate total price of items in cart"""
    try:
        items = await fetch_cart_items(email)
        total = sum(item["price"] * item["quantity"] for item in items)
        logger.info(f"Calculated cart total for user {email}: ${total}")
        return {"total": total}
    except Exception as e:
        logger.error(f"Error in get_cart_total: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def update_payment_status(request: UpdatePaymentStatus):
    """Update payment status for cart items"""
    try:
        await verify_buyer(request.email)
        logger.info(f"Updating payment status for user: {request.email}")

        result = await cart.update_one(
            {"email": request.email},
            {"$set": {"buyed": request.buyed}}
        )

        if result.modified_count == 0:
            logger.error(f"Failed to update payment status for user: {request.email}")
            raise HTTPException(status_code=404, detail="Cart not found or status not updated")

        logger.info(f"Successfully updated payment status for user: {request.email}")
        return {"message": "Purchase status updated successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in update_payment_status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))