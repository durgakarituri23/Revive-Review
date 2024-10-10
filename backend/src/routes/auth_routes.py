from fastapi import APIRouter
from src.schemas.user_schema import UserResponseModel, RegisterModel,LoginModel,LoginResponse,PasswordReset,AuthCode,updatePassword,UpdatedPassword # Assuming you have Pydantic schemas for Register and Login
from src.services.auth_services import create_user,validate_login,generate_aut_code,update_user_password
router = APIRouter()  # Create an APIRouter instance

# Route for user registration
@router.post("/register", response_model=UserResponseModel)
async def register_user(register: RegisterModel):
    return await create_user(register)

# # Route for user login
@router.post("/login",response_model=LoginResponse)
async def check_login(login: LoginModel):
    return await validate_login(login)

@router.post("/forgot-password" ,response_model=AuthCode)
async def reset_password(password: PasswordReset):
    return await generate_aut_code(password)


@router.post("/reset-password",response_model=UpdatedPassword)
async def update_password(password: updatePassword):
    return await update_user_password(password)
