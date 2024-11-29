from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from src.models.user import User
from src.config.database import users  # Updated to use single collection
from smtp import Smtp
from src.schemas.user_schema import (
    UserResponseModel,
    AuthCode,
    UpdatedPassword,
    RegisterModel,
)
from datetime import datetime, timedelta
from jose import JWTError, jwt
from src.config.auth_config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
ADMIN_CODE = os.getenv("ADMIN_REGISTRATION_CODE")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await users.find_one({"email": email})
    if not user:
        raise credentials_exception

    return user


async def get_user_profile(current_user: dict):
    response_data = {
        "email": current_user["email"],
        "first_name": current_user["first_name"],
        "last_name": current_user["last_name"],
        "phone": current_user["phone"],
        "role": current_user["role"],
    }

    # Add role-specific data
    if current_user["role"] == "seller":
        response_data.update(
            {
                "business_name": current_user.get("business_name"),
                "address": current_user.get("address"),
                "tax_id": current_user.get("tax_id"),
            }
        )
    elif current_user["role"] == "buyer":
        response_data.update(
            {
                "address": current_user.get("address"),
                "postal_code": current_user.get("postal_code"),
            }
        )

    return response_data


async def create_user(register: User):
    existing_user = await users.find_one({"email": register.email})

    if existing_user:
        raise HTTPException(
            status_code=400, detail="User with this email already exists"
        )

    register_data = register.dict()
    register_data["role"] = "buyer"  # Set default role as buyer
    await users.insert_one(register_data)

    Smtp.send_registration_email(
        register.email,
        register.first_name,
        "Welcome to Our Platform",
        f"Hello {register.first_name},\n\nThank you for registering. We are excited to have you on board!",
    )

    response_data = {
        "first_name": register.first_name,
        "last_name": register.last_name,
        "phone": register.phone,
        "email": register.email,
        "role": "buyer",
    }

    return UserResponseModel(**response_data)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def validate_login(login):
    user = await users.find_one({"email": login.email})

    if not user or user["password"] != login.password:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Generate access token with role
    token_data = {"sub": user["email"], "role": user["role"]}
    access_token = create_access_token(token_data)

    response_data = {
        "email": login.email,
        "password": login.password,
        "access_token": access_token,
        "token_type": "bearer",
        "role": user["role"],
    }

    return response_data


async def generate_auth_code(password):
    user = await users.find_one({"email": password.email})

    if not user or user["email"] != password.email:
        raise HTTPException(status_code=400, detail="Invalid Email")

    import random

    random_number = str(random.randint(1000, 9999))
    response_data = {"code": random_number}

    Smtp.send_auth_code(
        password.email, "Hello user ", f"Here is your auth code {random_number}"
    )
    return AuthCode(**response_data)


async def update_user_password(password):
    user = await users.find_one({"email": password.email})
    if not user or user["email"] != password.email:
        raise HTTPException(status_code=400, detail="Invalid Email")

    newPassword = password.password

    update_result = await users.update_one(
        {"email": password.email},
        {"$set": {"password": newPassword}},
    )

    response_data = {"email": password.email, "password": password.password}
    return UpdatedPassword(**response_data)


async def create_seller(register):
    existing_user = await users.find_one({"email": register.email})

    if existing_user:
        raise HTTPException(
            status_code=400, detail="User with this email already exists"
        )

    register_data = register.dict()
    register_data["role"] = "seller"  # Set role as seller
    await users.insert_one(register_data)

    Smtp.send_registration_email(
        register.email,
        register.first_name,
        "Welcome to Our Platform",
        f"Hello {register.first_name},\n\nThank you for registering as a seller. We are excited to have you on board!",
    )

    response_data = {
        "first_name": register.first_name,
        "last_name": register.last_name,
        "phone": register.phone,
        "email": register.email,
        "role": "seller",
    }

    return UserResponseModel(**response_data)


async def getUserDetails(email):
    user = await users.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "first_name": user["first_name"],
        "last_name": user["last_name"],
        "phone": user["phone"],
        "address": user.get("address"),
        "postal_code": user.get("postal_code"),
        "role": user["role"],
        "business_name": user.get("business_name")
        if user["role"] == "seller"
        else None,
        "tax_id": user.get("tax_id") if user["role"] == "seller" else None,
    }


async def updateDetails(details):
    user = await users.find_one({"email": details.email})
    if not user or user["email"] != details.email:
        raise HTTPException(status_code=400, detail="Invalid Email")

    update_data = {"address": details.address, "postal_code": details.postal_code}

    # Include role-specific fields if user is a seller
    if user["role"] == "seller":
        update_data.update(
            {"business_name": details.business_name, "tax_id": details.tax_id}
        )

    update_result = await users.update_one(
        {"email": details.email}, {"$set": update_data}
    )

    return {"message": "Details updated successfully"}


# Add a function to create admin users (should be restricted)
async def create_admin(register: User):
    existing_user = await users.find_one({"email": register.email})

    if existing_user:
        raise HTTPException(
            status_code=400, detail="User with this email already exists"
        )

    register_data = register.dict()
    register_data["role"] = "admin"
    await users.insert_one(register_data)

    response_data = {
        "first_name": register.first_name,
        "last_name": register.last_name,
        "phone": register.phone,
        "email": register.email,
        "role": "admin",
    }

    return UserResponseModel(**response_data)


async def get_all_users_service():
    """Get all users (for admin use)"""
    all_users = await users.find().to_list(None)
    # Convert ObjectId to string for JSON serialization
    return jsonable_encoder(all_users)


async def get_users_by_role(role: str):
    """Get all users with a specific role"""
    role_users = await users.find({"role": role}).to_list(None)
    return jsonable_encoder(role_users)


async def update_user_role_service(user_id: str, new_role: str):
    """Update a user's role (admin only)"""
    if new_role not in ["buyer", "seller", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    update_result = await users.update_one(
        {"_id": ObjectId(user_id)}, {"$set": {"role": new_role}}
    )

    if update_result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": f"User role updated to {new_role}"}


async def delete_user_service(user_id: str):
    """Delete a user (admin only)"""
    delete_result = await users.delete_one({"_id": ObjectId(user_id)})

    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User deleted successfully"}


async def get_user_by_id(user_id: str):
    """Get user by ID"""
    user = await users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return jsonable_encoder(user)


async def check_user_exists(email: str) -> bool:
    """Check if a user exists by email"""
    user = await users.find_one({"email": email})
    return user is not None


async def check_admin_exists():
    """Check if any admin exists in the system"""
    admin = await users.find_one({"role": "admin"})
    return admin is not None


async def verify_admin_code(admin_code: str) -> bool:
    """Verify the admin registration code"""
    return admin_code == ADMIN_CODE


async def create_first_admin(register: RegisterModel):
    """Create the first admin user"""
    if not await verify_admin_code(register.admin_code):
        raise HTTPException(status_code=403, detail="Invalid admin registration code")

    existing_user = await users.find_one({"email": register.email})
    if existing_user:
        raise HTTPException(
            status_code=400, detail="User with this email already exists"
        )

    register_data = register.dict()
    register_data["role"] = "admin"
    await users.insert_one(register_data)

    return UserResponseModel(
        first_name=register.first_name,
        last_name=register.last_name,
        phone=register.phone,
        email=register.email,
        role="admin",
    )


async def verify_user_ownership(
    user_email: str, resource_owner_email: str, allowed_roles: list = None
):
    """Verify if a user owns a resource or has permission to access it"""
    # If user email matches resource owner, allow access
    if user_email == resource_owner_email:
        return True

    # If allowed_roles is specified, check if user has one of those roles
    if allowed_roles:
        user = await users.find_one({"email": user_email})
        if user and user["role"] in allowed_roles:
            return True

    return False


async def bulk_update_users(user_ids: list, update_data: dict):
    """Update multiple users at once (admin only)"""
    try:
        object_ids = [ObjectId(uid) for uid in user_ids]
        result = await users.update_many(
            {"_id": {"$in": object_ids}}, {"$set": update_data}
        )
        return {
            "modified_count": result.modified_count,
            "matched_count": result.matched_count,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


async def get_user_stats():
    """Get statistics about users (admin only)"""
    stats = {
        "total_users": await users.count_documents({}),
        "buyers": await users.count_documents({"role": "buyer"}),
        "sellers": await users.count_documents({"role": "seller"}),
        "admins": await users.count_documents({"role": "admin"}),
    }
    return stats


async def search_users(query: str):
    """Search users by name or email"""
    search_results = await users.find(
        {
            "$or": [
                {"first_name": {"$regex": query, "$options": "i"}},
                {"last_name": {"$regex": query, "$options": "i"}},
                {"email": {"$regex": query, "$options": "i"}},
            ]
        }
    ).to_list(None)
    return jsonable_encoder(search_results)
