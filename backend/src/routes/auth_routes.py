from fastapi import APIRouter, Depends, HTTPException
from src.schemas.user_schema import (
    UserResponseModel,
    RegisterModel,
    LoginModel,
    LoginResponse,
    PasswordReset,
    AuthCode,
    updatePassword,
    UpdatedPassword,
    RegisterSeller,
    UserDetails,
    UpdateUserDetails,
)
from src.services.auth_services import (
    create_user,
    validate_login,
    generate_auth_code,
    update_user_password,
    create_seller,
    getUserDetails,
    updateDetails,
    get_current_user,
    get_user_profile,
    create_admin,
    get_all_users_service,
    update_user_role_service,
    create_first_admin,
    get_user_stats,
    search_users
)
from src.config.auth_middleware import (
    check_roles,
    admin_only,
    seller_only,
    buyer_only,
    check_resource_owner,
)

router = APIRouter()


# Public routes (no authentication required)
@router.post("/register", response_model=UserResponseModel)
async def register_user(register: RegisterModel):
    return await create_user(register)


@router.post("/login", response_model=LoginResponse)
async def check_login(login: LoginModel):
    return await validate_login(login)


@router.post("/forgot-password", response_model=AuthCode)
async def reset_password(password: PasswordReset):
    return await generate_auth_code(password)


@router.post("/reset-password", response_model=UpdatedPassword)
async def update_password(password: updatePassword):
    return await update_user_password(password)


# Seller registration (public route)
@router.post("/seller_register", response_model=UserResponseModel)
async def register_seller(register: RegisterSeller):
    return await create_seller(register)


# Protected routes (require authentication)
@router.get("/user/me")
async def get_current_user_details(current_user: dict = Depends(get_current_user)):
    return await get_user_profile(current_user)


# Admin-only routes


@router.post("/admin/register", response_model=UserResponseModel)
async def register_admin(register: RegisterModel):
    """Register the first admin user or additional admin users if authorized"""
    return await create_first_admin(register)


@router.post(
    "/admin/create",
    response_model=UserResponseModel,
    dependencies=[Depends(admin_only)],
)
async def create_admin_user(register: RegisterModel):
    return await create_admin(register)


@router.get("/admin/dashboard", dependencies=[Depends(admin_only)])
async def get_admin_dashboard():
    """Get admin dashboard data"""
    return {
        "user_stats": await get_user_stats(),
        "recent_users": await search_users(""),  # Get recent users
    }


@router.get("/admin/users", dependencies=[Depends(admin_only)])
async def get_all_users():
    # Implement get all users functionality in auth_services
    return await get_all_users_service()


# User details routes with ownership checking
@router.get("/get-user-details", response_model=UserDetails)
async def get_user_details(email: str, current_user: dict = Depends(get_current_user)):
    # Check if user is requesting their own details or is an admin
    if not await check_resource_owner(
        current_user["email"], email, allowed_roles=["admin"]
    ):
        raise HTTPException(
            status_code=403, detail="You can only view your own details"
        )
    return await getUserDetails(email)


@router.post("/update-user-details")
async def update_details(
    details: UpdateUserDetails, current_user: dict = Depends(get_current_user)
):
    # Check if user is updating their own details or is an admin
    if not await check_resource_owner(
        current_user["email"], details.email, allowed_roles=["admin"]
    ):
        raise HTTPException(
            status_code=403, detail="You can only update your own details"
        )
    return await updateDetails(details)


# Optional: Add routes for role management (admin only)
@router.put("/admin/user/{user_id}/role", dependencies=[Depends(admin_only)])
async def update_user_role(user_id: str, new_role: str):
    # Implement update role functionality in auth_services
    return await update_user_role_service(user_id, new_role)
