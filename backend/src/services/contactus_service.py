import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import HTTPException, BackgroundTasks
from src.config.database import users, complaint_collection
from smtp import Smtp


async def send_email_async(to_email, subject, body):
    """
    Async wrapper for sending emails using SMTP.
    """
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as pool:
        await loop.run_in_executor(pool, lambda: Smtp.trigger_email(to_email, subject, body))


async def handle_contact_us_service(query_data: dict, background_tasks: BackgroundTasks):
    """
    Handles the business logic for the 'Contact Us' feature.
    """
    try:
        # Validate input
        query_text = query_data.get("query")
        user_email = query_data.get("email")  # Email of the user creating the query
        if not query_text or len(query_text.strip()) < 5:
            raise HTTPException(status_code=400, detail="Query must be at least 5 characters long.")
        if not user_email:
            raise HTTPException(status_code=400, detail="User email is required.")

        # Log query in the complaints collection with a type of "General Inquiry"
        inquiry = {
            "email": user_email,
            "issue_type": "General Inquiry",
            "details": query_text,
            "status": "In review",  # Set the status to "In review"
        }

        # Insert into complaints collection
        result = await complaint_collection.insert_one(inquiry)

        # Prepare email content for the user
        user_subject = "Your Inquiry Has Been Submitted"
        user_email_body = f"""
        Dear User,

        Thank you for reaching out to us via the Contact Us page. Our support team has received your inquiry and will respond shortly.

        Inquiry Details:
        -----------------
        Query: {query_text}
        Status: In review

        Best regards,
        Support Team
        """

        # Send email to the user
        background_tasks.add_task(send_email_async, user_email, user_subject, user_email_body)

        # Notify admin users
        admin_users = await users.find({"role": "admin"}).to_list(100)
        if not admin_users:
            raise HTTPException(
                status_code=500, detail="No admin users available to notify."
            )

        admin_subject = "New Inquiry from Contact Us Page"
        admin_body = f"""
        A new inquiry has been submitted.

        Details:
        --------
        Email: {user_email}
        Query: {query_text}
        Status: In review

        Please follow up as soon as possible.
        """

        # Notify all admins
        for admin in admin_users:
            admin_email = admin.get("email")
            if admin_email:
                background_tasks.add_task(send_email_async, admin_email, admin_subject, admin_body)

        return {
            "success": True,
            "message": "Your inquiry has been submitted successfully.",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
