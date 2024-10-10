from fastapi import APIRouter
from src.schemas.user_schema import UserResponseModel, RegisterModel # Assuming you have Pydantic schemas for Register and Login
from src.services.auth_services import create_user
router = APIRouter()  # Create an APIRouter instance

# Route for user registration
@router.post("/register", response_model=UserResponseModel)
async def register_user(register: RegisterModel):
    return await create_user(register)

# # Route for user login
# @router.post("/login")
# async def check_login(login: Login):
#     return await validate_login(login)
