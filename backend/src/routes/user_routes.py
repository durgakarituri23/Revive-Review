from fastapi import APIRouter,Form,UploadFile,File
from src.models.cart import Cart 
from src.schemas.user_schema import update_cart,delete_cart_product,PaymentMethodrequest
from typing import List
from src.services.buyer_service import addTocart,fetch_cart_items,update_quantity,deleteCartProduct,addPaymentMethod,getCardDetails
router = APIRouter() 
from fastapi import Query

@router.post("/user/add-to-cart")
async def add_to_cart(request: Cart):
    return await addTocart(request)

@router.get("/user/cart")
async def get_user_cart(email: str = Query(...)):
   return await fetch_cart_items(email)

@router.put('/user/cart/update')
async def update_user_cart(update_cart:update_cart):
    return await update_quantity(update_cart)

@router.delete("/user/cart/delete")
async def delete_cart_product1(delete_cart: delete_cart_product):
    return await deleteCartProduct(delete_cart)

@router.post("/user/payment-methods")
async def add_payment_method(request: PaymentMethodrequest):
    return await addPaymentMethod(request)

@router.get("/user/payment-methods")
async def get_payment_methods(email):

   return await getCardDetails(email)
