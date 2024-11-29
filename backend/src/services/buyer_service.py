from fastapi import HTTPException
from src.config.database import cart, users, upload_product, payment_methods
from src.models.cart import Cart 
from src.schemas.user_schema import update_cart, PaymentMethodrequest, UpdatePaymentStatus
from fastapi.encoders import jsonable_encoder
from bson import ObjectId

async def verify_buyer(email: str):
    """Verify if the user is a buyer"""
    user = await users.find_one({"email": email})
    if not user or user["role"] != "buyer":
        raise HTTPException(status_code=403, detail="Only buyers can perform this action")
    return user

async def addTocart(request: Cart):
    # Verify the user is a buyer
    await verify_buyer(request.email)
    
    existing_cart = await cart.find_one({"email": request.email})

    if existing_cart:
        # Loop through the products in the request
        for item in request.products:
            product_found = False
            # Check if the product already exists in the cart
            for cart_item in existing_cart["products"]:
                if cart_item["productId"] == item.productId:
                    # Update the quantity of the existing product
                    cart_item["quantity"] += item.quantity
                    product_found = True
                    break
            
            # If the product wasn't found in the cart, add it as a new product
            if not product_found:
                existing_cart["products"].append(item.dict())

        # Update the cart with modified products array
        await cart.update_one(
            {"email": request.email},
            {"$set": {"products": existing_cart["products"]}}
        )
    else:
        # If no existing cart, insert a new one
        new_cart = {
            "email": request.email,
            "products": [item.dict() for item in request.products],
            "buyed": False  # Add default status
        }
        await cart.insert_one(new_cart)

    return {"message": "Products added to cart successfully"}

async def fetch_cart_items(email: str):
    # Verify the user is a buyer
    await verify_buyer(email)
    
    user_cart = await cart.find_one({"email": email})
    if not user_cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    product_ids = [ObjectId(item["productId"]) for item in user_cart["products"]]
    
    # Fetch product details from the `upload_product` collection
    products = await upload_product.find({"_id": {"$in": product_ids}}).to_list(length=len(product_ids))
    
    # Add quantities from cart to products
    product_dict = {str(product["_id"]): product for product in products}
    final_products = []
    
    for cart_item in user_cart["products"]:
        if cart_item["productId"] in product_dict:
            product = product_dict[cart_item["productId"]].copy()
            product["quantity"] = cart_item["quantity"]
            final_products.append(product)

    return jsonable_encoder(final_products)

async def update_quantity(quantity: update_cart):
    # Verify the user is a buyer
    await verify_buyer(quantity.email)
    
    user_cart = await cart.find_one({"email": quantity.email})
    if not user_cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    # Check if the product exists in the user's cart
    product_found = False
    for item in user_cart["products"]:
        if item["productId"] == quantity.id:
            # Update quantity for the existing product
            item["quantity"] = quantity.quantity
            product_found = True
            break

    if not product_found:
        raise HTTPException(status_code=404, detail="Product not found in cart")

    # Update the cart in database
    await cart.update_one(
        {"email": quantity.email},
        {"$set": {"products": user_cart["products"]}}
    )

    # Fetch the updated product details
    product = await upload_product.find_one({"_id": ObjectId(quantity.id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product["quantity"] = quantity.quantity
    return {"message": "Quantity updated successfully", "product": jsonable_encoder(product)}

async def deleteCartProduct(delete):
    # Verify the user is a buyer
    await verify_buyer(delete.email)
    
    user_cart = await cart.find_one({"email": delete.email})
    if not user_cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    # Remove the product with the given productId from the cart
    updated_cart = [
        item for item in user_cart["products"]
        if item["productId"] != str(delete.productId)
    ]

    # Update the cart in the database
    result = await cart.update_one(
        {"email": delete.email},
        {"$set": {"products": updated_cart}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to remove product from cart")

    return {"message": "Product removed from cart successfully"}

async def get_user_address(email: str):
    # Verify the user is a buyer
    user = await verify_buyer(email)
    
    if 'address' in user and user['address']:
        return {
            'name': f"{user['first_name']} {user['last_name']}",
            'phone': user['phone'],
            'address': user['address'],
            "postal_code": user.get('postal_code', "")
        }
    return {
        'name': f"{user['first_name']} {user['last_name']}",
        'phone': user['phone'],
        'address': "",
        "postal_code": ""
    }

async def addPaymentMethod(request: PaymentMethodrequest):
    # Verify the user is a buyer
    await verify_buyer(request.email)
    
    new_method = request.paymentMethod.dict()
    user_payment_methods = await payment_methods.find_one({"email": request.email})

    if user_payment_methods:
        # Update existing payment methods
        await payment_methods.update_one(
            {"email": request.email},
            {"$push": {"methods": new_method}}
        )
    else:
        # Create new payment methods document
        new_user = {
            "email": request.email,
            "methods": [new_method]
        }
        await payment_methods.insert_one(new_user)

    return {"message": "Payment method added successfully"}

async def getCardDetails(email: str):
    # Verify the user is a buyer
    await verify_buyer(email)
    
    methods = await payment_methods.find({"email": email}).to_list(None)
    if not methods:
        return {'methods': []}
    
    methods = jsonable_encoder(methods)
    return {'methods': methods[0]['methods']}

async def updatebuyedStatus(product: UpdatePaymentStatus):
    # Verify the user is a buyer
    await verify_buyer(product.email)
    
    result = await cart.update_one(
        {"email": product.email},
        {"$set": {"buyed": product.buyed}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Cart not found or status not updated")

    return {"message": "Purchase status updated successfully"}

# New helper functions for buyers

async def get_buyer_orders(email: str):
    """Get all orders for a buyer"""
    await verify_buyer(email)
    
    user_cart = await cart.find(
        {"email": email, "buyed": True}
    ).to_list(None)
    return jsonable_encoder(user_cart)

async def get_cart_total(email: str):
    """Calculate total price of items in cart"""
    cart_items = await fetch_cart_items(email)
    total = sum(item["price"] * item["quantity"] for item in cart_items)
    return {"total": total}

async def clear_cart(email: str):
    """Clear all items from cart"""
    await verify_buyer(email)
    
    result = await cart.update_one(
        {"email": email},
        {"$set": {"products": []}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Cart not found")
        
    return {"message": "Cart cleared successfully"}

