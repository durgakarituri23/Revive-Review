from fastapi import HTTPException
from src.config.database import orders, product_collection
from src.models.order import OrderModel, TrackingHistory
from src.schemas.order_schema import OrderCreateSchema, OrderUpdateSchema
from datetime import datetime, timedelta
import logging
from typing import List
import asyncio

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

STATUS_DESCRIPTIONS = {
    "placed": "Order has been placed successfully",
    "shipped": "Order has been shipped",
    "in_transit": "Order is in transit",
    "delivered": "Order has been delivered",
    "cancelled": "Order has been cancelled",
    "return_requested": "Return has been requested",
    "returned": "Order has been returned",
}


async def create_order(order_data: OrderCreateSchema) -> OrderModel:
    """Create a new order with initial tracking status"""
    try:
        initial_tracking = TrackingHistory(
            status="placed",
            timestamp=datetime.now().isoformat(),
            description=STATUS_DESCRIPTIONS["placed"],
        )

        order = OrderModel(
            buyer_email=order_data.buyer_email,
            items=order_data.items,
            total_amount=order_data.total_amount,
            shipping_address=order_data.shipping_address,
            payment_method=order_data.payment_method,
            tracking_history=[initial_tracking],
            status="placed",
            can_cancel=True,
            can_return=False,
        )

        result = await orders.insert_one(order.dict(by_alias=True))
        if result.inserted_id:
            created_order = await orders.find_one({"_id": str(result.inserted_id)})
            return OrderModel(**created_order)

        raise HTTPException(status_code=500, detail="Failed to create order")

    except Exception as e:
        logger.error(f"Error in create_order: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


async def update_order_status_based_on_time(order: OrderModel) -> str:
    order_date = datetime.fromisoformat(order.order_date)
    current_time = datetime.now()
    time_diff = (current_time - order_date).total_seconds() / 60  # difference in minutes

    if time_diff < 1:
        return "placed"
    elif time_diff < 2:
        return "shipped"
    elif time_diff < 3:
        return "in_transit"
    elif time_diff < 4:
        return "delivered"
    
    return order.status


async def update_order_status(order_id: str, status: str) -> OrderModel:
    """Update order status and tracking history"""
    try:
        order = await get_order_by_id(order_id)
        
        # If not a manual status change (cancel/return), calculate status based on time
        if status not in ['cancelled', 'return_requested', 'returned']:
            status = await update_order_status_based_on_time(order)
        
        # Create new tracking entry only if status has changed
        if status != order.status:
            new_tracking = TrackingHistory(
                status=status,
                timestamp=datetime.now().isoformat(),
                description=STATUS_DESCRIPTIONS.get(status, f"Status updated to {status}")
            )

            # Determine can_cancel and can_return based on status
            can_cancel = status in ["placed", "shipped"]
            can_return = status == "delivered"

            # Update order
            result = await orders.update_one(
                {"_id": order_id},
                {
                    "$set": {
                        "status": status,
                        "can_cancel": can_cancel,
                        "can_return": can_return
                    },
                    "$push": {"tracking_history": new_tracking.dict()}
                }
            )

            if result.modified_count == 0:
                raise HTTPException(status_code=404, detail="Order not found")

        return await get_order_by_id(order_id)

    except Exception as e:
        logger.error(f"Error updating order status: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


async def restore_cancelled_products(order: OrderModel):
    """Restore products to available state when order is cancelled"""
    for item in order.items:
        await product_collection.update_one(
            {"_id": item.product_id},
            {"$set": {"status": "approved", "buyer_email": None, "sold_at": None}},
        )


def is_valid_status_transition(current_status: str, new_status: str) -> bool:
    """Validate status transitions"""
    valid_transitions = {
        "placed": ["shipped", "cancelled"],
        "shipped": ["in_transit", "cancelled"],
        "in_transit": ["delivered"],
        "delivered": ["return_requested"],
        "return_requested": ["returned"],
    }

    return new_status in valid_transitions.get(current_status, [])


# Existing functions remain the same
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
