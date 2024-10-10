
from fastapi import HTTPException
from src.models.user import User  # Assuming you have a models.py with your Register model
from src.config.database import collection  # Assuming you're using pymongo and have configured your collection
from smtp import Smtp  
from src.schemas.user_schema import UserResponseModel,LoginResponse

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
    
    if not user or user["password"] != login.password:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    response_data={
        'email':login.email,
        'password':login.password
    }
    
    return LoginResponse(**response_data)
