from fastapi import HTTPException
from src.config.database import orders
from src.models.order import OrderModel
from src.schemas.order_schema import OrderCreateSchema, OrderUpdateSchema
import logging
from typing import List

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def create_order(order_data: OrderCreateSchema) -> OrderModel:
    """Create a new order from cart items"""
    try:
        # Create order
        order = OrderModel(
            buyer_email=order_data.buyer_email,
            items=order_data.items,
            total_amount=order_data.total_amount,
            shipping_address=order_data.shipping_address,
            payment_method=order_data.payment_method,
        )

        # Insert into database
        result = await orders.insert_one(order.dict(by_alias=True))

        if result.inserted_id:
            # Return created order
            created_order = await orders.find_one({"_id": str(result.inserted_id)})
            return OrderModel(**created_order)

        raise HTTPException(status_code=500, detail="Failed to create order")

    except Exception as e:
        logger.error(f"Error in create_order: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


async def get_user_orders(buyer_email: str) -> List[OrderModel]:
    """Get all orders for a specific user"""
    try:
        user_orders = []
        async for order in orders.find({"buyer_email": buyer_email}):
            user_orders.append(OrderModel(**order))
        return user_orders
    except Exception as e:
        logger.error(f"Error fetching user orders: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


async def get_order_by_id(order_id: str) -> OrderModel:
    """Get a specific order by ID"""
    try:
        order = await orders.find_one({"_id": order_id})
        if order:
            return OrderModel(**order)
        raise HTTPException(status_code=404, detail="Order not found")
    except Exception as e:
        logger.error(f"Error fetching order: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
