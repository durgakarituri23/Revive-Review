from src.config.database import cart
from src.config.database import collection,upload_product,payment_methods
from fastapi import  HTTPException
from src.models.cart import Cart 
from src.schemas.user_schema import update_cart,PaymentMethodrequest
from fastapi.encoders import jsonable_encoder

async def addTocart(request:Cart):

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
            "products": [item.dict() for item in request.products]
        }
        await cart.insert_one(new_cart)

    return {"message": "Products added to cart successfully"}

async def fetch_cart_items(email):
    user_cart = await cart.find_one({"email": email})
    if not user_cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    product_ids = [item["productId"] for item in user_cart["products"]]

    # Step 3: Fetch product details from the `upload_product` collection
    products = await upload_product.find({"_id": {"$in": product_ids}}).to_list(length=len(product_ids))
    o=0

    for product in user_cart['products']:
        products[o]['quantity']=product['quantity']
        o+=1 



    return jsonable_encoder(products)

async def update_quantity(quantity:update_cart):
    user_cart = await cart.find_one({"email": quantity.email})
    if not user_cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    # Step 2: Check if the product already exists in the user's cart
    product_found = False
    for item in user_cart["products"]:
        if item["productId"] == quantity.id:
            # Update quantity for the existing product
            item["quantity"] = quantity.quantity
            product_found = True
            break

    # Step 3: If the product is not found, add it to the cart with the specified quantity
    if not product_found:
        user_cart["id"].append({"productId": quantity.productId, "quantity": quantity.quantity})

    # Step 4: Update the user's cart in the database with the modified products array
    await cart.update_one(
        {"email": quantity.email},
        {"$set": {"products": user_cart["products"]}}
    )

    # Step 5: Fetch the updated product details from the `upload_product` collection
    product = await upload_product.find_one({"_id": quantity.id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Step 6: Add the updated quantity to the product info before returning
    product["quantity"] = quantity.quantity

    # Step 7: Return the updated product with quantity
    return {"message": "Quantity updated successfully", "product": product}

async def deleteCartProduct(delete):
    user_cart = await cart.find_one({"email": delete.email})
    if not user_cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    # Convert productId to ObjectId
    product_id = delete.productId

    # Remove the product with the given productId from the cart
    updated_cart = [
        item for item in user_cart["products"]
        if item["productId"] != str(product_id)
    ]

    # Update the cart in the database
    result = await cart.update_one(
        {"email": delete.email},
        {"$set": {"products": updated_cart}}
    )

    # Check if the update was successful
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to remove product from cart")

    return {"message": "Product removed from cart successfully"}  

async def addPaymentMethod(request: PaymentMethodrequest):
    email = request.email
    new_method = request.paymentMethod.dict()

    user_payment_methods = await payment_methods.find_one({"email": email})

    if user_payment_methods:
        # Update the existing user document by appending to the payment methods list
        await payment_methods.update_one(
            {"email": email},
            {"$push": {"methods": new_method}}
        )
    else:
        # If user doesn't exist, create a new document with email and payment methods
        new_user = {
            "email": email,
            "methods": [new_method]
        }
        await payment_methods.insert_one(new_user)

    # Return a success response
    return {"message": "Payment method added successfully."}

async def getCardDetails(email):
    methods1 = await payment_methods.find({"email": email}).to_list(None)
    for method in methods1:
            if "_id" in method:
                method["_id"] = str(method["_id"])  # Convert ObjectId to string
   # print(methods1[0]['methods'])
    return {'methods':methods1[0]['methods']}