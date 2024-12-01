from fastapi import HTTPException
from src.config.database import users, payment_methods
from src.schemas.user_schema import PaymentMethodrequest
from fastapi.encoders import jsonable_encoder

async def verify_buyer(email: str):
    """Verify if the user is a buyer"""
    user = await users.find_one({"email": email})
    
    if not user or user["role"] != "buyer":
        raise HTTPException(status_code=403, detail="Only buyers can perform this action")
    return user

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