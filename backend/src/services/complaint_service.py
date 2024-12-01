import asyncio
from concurrent.futures import ThreadPoolExecutor
from src.config.database import complaint_collection, users
from src.schemas.complaint import ComplaintCreate
from fastapi import HTTPException, BackgroundTasks
from smtp import Smtp  # Import your email sending logic


# Async wrapper for sending emails
async def send_email_async(to_email, subject, body):
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as pool:
        await loop.run_in_executor(pool, lambda: Smtp.send_email(to_email, subject, body))


async def create_complaint(complaint_data: dict, background_tasks: BackgroundTasks):
    """
    Creates a complaint in the database and optionally sends email notifications to admins.
    """
    try:
        # Check if the issue type is 'Product Return' and an order ID is provided
        if complaint_data["issue_type"] == "Product Return" and complaint_data.get("orderID"):
            # Query the database to check for existing complaints with the same order ID and status 'In review'
            existing_complaint = await complaint_collection.find_one(
                {"orderID": complaint_data["orderID"], "status": "In review"}
            )
            if existing_complaint:
                return {
                    "success": False,
                    "message": f"A complaint for Order ID {complaint_data['orderID']} is already in review. Please wait for it to be resolved."
                }

        # Add default fields
        complaint_data["status"] = "In review"  # Default status
        complaint_data["resolution"] = None  # Default resolution

        # Insert the complaint into the database
        result = await complaint_collection.insert_one(complaint_data)
        if not result.inserted_id:
            return {
                "success": False,
                "message": "Failed to create complaint. Please try again later."
            }

        # Fetch admin users
        admin_users = await users.find({"role": "admin"}).to_list(100)
        if not admin_users:
            return {
                "success": True,
                "message": "Complaint created successfully, but no admin users to notify.",
                "complaint_id": str(result.inserted_id),
            }

        # Prepare email content
        subject = "New Complaint Created"
        body = f"""
        Complaint ID: {str(result.inserted_id)}
        Issue Type: {complaint_data['issue_type']}
        Details: {complaint_data['details']}
        Order ID: {complaint_data['orderID'] or 'N/A'}
        Status: {complaint_data['status']}
        
        Please review the complaint in the admin panel.
        """

        # Notify all admin users
        for admin in admin_users:
            email = admin.get("email")
            if email:
                background_tasks.add_task(send_email_async, email, subject, body)

        return {
            "success": True,
            "message": "Complaint created successfully.",
            "complaint_id": str(result.inserted_id),
        }

    except Exception as e:
        return {"success": False, "message": str(e)}

# Function to fetch all complaints
async def get_all_complaints():
    """
    Fetches all complaints from the database
    """
    try:
        complaints = []
        async for complaint in complaint_collection.find():
            complaints.append(complaint)
        return complaints
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
