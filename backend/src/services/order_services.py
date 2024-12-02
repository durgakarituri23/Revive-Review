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
    "placed": "Order has been placed",
    "shipped": "Your order has been shipped from our warehouse",
    "in_transit": "Your order is on its way to you",
    "delivered": "Your order has been delivered",
    "cancelled": "Order has been cancelled",
    "return_requested": "Return request has been initiated",
    "return_pickup_scheduled": "Return pickup has been scheduled",
    "return_picked": "Product has been picked up for return",
    "return_in_transit": "Product is in transit back to seller",
    "returned": "Product has been returned to seller",
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
    time_diff = (current_time - order_date).total_seconds()  # difference in seconds

    # More realistic timing for testing
    if order.status == "placed" and time_diff >= 30:  # 30 seconds after placed
        return "shipped"
    elif order.status == "shipped" and time_diff >= 60:  # 1 minute after placed
        return "in_transit"
    elif order.status == "in_transit" and time_diff >= 90:  # 1.5 minutes after placed
        return "delivered"

    return order.status


async def handle_return_status_updates(order: OrderModel) -> str:
    print("Starting return status update flow")
    return_date = None

    for history in reversed(order.tracking_history):
        if history.status == "return_requested":
            return_date = datetime.fromisoformat(history.timestamp)
            print(f"Found return request date: {return_date}")
            break

    if not return_date:
        print("No return date found")
        return order.status

    time_diff = (datetime.now() - return_date).total_seconds() / 60
    print(f"Time difference in minutes: {time_diff}")

    # Return next status based on time difference, regardless of current status
    if time_diff > 4:  # More than 4 minutes
        try:
            # Update product status when return is complete
            for item in order.items:
                await product_collection.update_one(
                    {"_id": item.product_id},
                    {
                        "$set": {
                            "status": "approved",
                            "buyer_email": None,
                            "sold_at": None,
                        }
                    },
                )
            print("Products marked as available")
            return "returned"
        except Exception as e:
            print(f"Error updating product status: {e}")
            return order.status
    elif time_diff > 3:  # Between 3-4 minutes
        return "return_in_transit"
    elif time_diff > 2:  # Between 2-3 minutes
        return "return_picked"
    elif time_diff > 1:  # Between 1-2 minutes
        return "return_pickup_scheduled"
    else:  # Less than 1 minute
        return "return_requested"


async def update_order_status(order_id: str, status: str) -> OrderModel:
    try:
        print(f"Updating order {order_id} to status: {status}")
        order = await get_order_by_id(order_id)
        print(f"Current order status: {order.status}")

        # Check if we should auto-update based on time
        if order.status == "placed":
            new_status = await update_order_status_based_on_time(order)
            print(f"Time-based status update: {new_status}")
        # Handle initial return request
        elif status == "return_requested" and order.status == "delivered":
            print("Handling initial return request")
            new_status = "return_requested"
        # Handle return flow updates
        elif order.status.startswith("return_"):
            print("Entering return flow")
            new_status = await handle_return_status_updates(order)
            print(f"Status after return flow: {new_status}")
        else:
            new_status = status

        print(f"New status to be set: {new_status}")

        # Only update if status has changed
        if new_status != order.status:
            new_tracking = TrackingHistory(
                status=new_status,
                timestamp=datetime.now().isoformat(),
                description=STATUS_DESCRIPTIONS.get(new_status),
            )

            result = await orders.update_one(
                {"_id": order_id},
                {
                    "$set": {
                        "status": new_status,
                        "can_cancel": False
                        if new_status.startswith("return_")
                        else new_status in ["placed", "shipped"],
                        "can_return": new_status == "delivered",
                    },
                    "$push": {"tracking_history": new_tracking.dict()},
                },
            )

            if result.modified_count == 0:
                raise HTTPException(status_code=404, detail="Order not found")

        # After update, check if we need to move to next status
        updated_order = await get_order_by_id(order_id)
        if updated_order.status == new_status:
            next_status = await update_order_status_based_on_time(updated_order)
            if next_status != new_status:
                return await update_order_status(order_id, next_status)

        print(f"Returning order with final status: {updated_order.status}")
        return updated_order

    except Exception as e:
        print(f"Error in update_order_status: {str(e)}")
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
