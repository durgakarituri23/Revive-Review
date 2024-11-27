
from fastapi import HTTPException
from src.models.user import User  # Assuming you have a models.py with your Register model
from src.config.database import collection,seller  # Assuming you're using pymongo and have configured your collection
from smtp import Smtp  
from src.schemas.user_schema import UserResponseModel,LoginResponse,AuthCode,UpdatedPassword

async def create_user(register: User):
    existing_user = await collection.find_one({"email": register.email})
    
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    register_data = register.dict()  
    await collection.insert_one(register_data)  

    Smtp.send_registration_email(register.email, register.first_name,"Welcome to Our Platform",f"Hello {register.first_name},\n\nThank you for registering. We are excited to have you on board!")    

    response_data = {
        "first_name": register.first_name,
        "last_name": register.last_name,
        "phone": register.phone,
        "email": register.email
    }


    return UserResponseModel(**response_data)

async def validate_login(login):
    user = await collection.find_one({"email": login.email})
    user1= await seller.find_one({"email":login.email})
    
    if not user:
        user=user1
    
    if not user or user["password"] != login.password:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    response_data={
        'email':login.email,
        'password':login.password
    }
    
    return LoginResponse(**response_data)

async def generate_aut_code(password):
    user=await collection.find_one({"email":password.email})

    if not user or user['email']!=password.email:
        raise HTTPException(status_code=400, detail="Invalid Email")
    import random

    random_number= str(random.randint(1000, 9999))
    response_data={
        'code': random_number
    }
    

    Smtp.send_auth_code(password.email, "Hello user ",f"Here is you auth code {random_number}")
    return AuthCode(**response_data)

async def update_user_password(password):
    user =await collection.find_one({'email':password.email})
    if not user or user['email']!=password.email:
        raise HTTPException(status_code=400, detail="Invalid Email")
    
    newPassword=password.password
    
    update_result = await collection.update_one(
        {'email': password.email},  # Find the user by email
        {'$set': {'password': newPassword}}  # Update the password field
    )
    
   

    response_data={
        'email':password.email,
        'password':password.password
    }
    return UpdatedPassword(**response_data)
    
async def create_seller(register):
    existing_user = await seller.find_one({"email": register.email})
    
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    register_data = register.dict()  
    await seller.insert_one(register_data)  

    Smtp.send_registration_email(register.email, register.first_name,"Welcome to Our Platform",f"Hello {register.first_name},\n\nThank you for registering. We are excited to have you on board!")    

    response_data = {
        "first_name": register.first_name,
        "last_name": register.last_name,
        "phone": register.phone,
        "email": register.email
    }


    return UserResponseModel(**response_data)

async def getUserDetails(email):# Query the database to find the user by email
    user = await collection.find_one({"email": email})
    
    # If user not found, raise a 404 exception
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Return user details
    return {
        "first_name": user['first_name'],
        "last_name": user['last_name'],
        "phone": user['phone'],
        "address": user.get('address'),  # Optional field
        "postal_code": user.get("postal_code")  # Optional field
    }

async def updateDetails(details):
    user =await collection.find_one({'email':details.email})
    if not user or user['email']!=details.email:
        raise HTTPException(status_code=400, detail="Invalid Email")
    
    
    update_result = await collection.update_one(
        {'email': details.email},  # Find the user by email
        {'$set': {'password': details.address,
       'postal_code': details.postal_code}}  # Update the password field
    )
    
