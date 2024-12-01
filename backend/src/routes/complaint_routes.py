from fastapi import APIRouter, HTTPException, BackgroundTasks
from src.config.database import complaint_collection
from src.schemas.complaint import ComplaintCreate, ComplaintResponse
from typing import List
from bson import ObjectId
from typing import Optional
from src.services.complaint_service import (create_complaint)

router = APIRouter()

@router.post("/", status_code=201)
async def create_complaint_endpoint(complaint: ComplaintCreate, background_tasks: BackgroundTasks):
    try:
        # Pass the complaint as a dictionary to the service function
        response = await create_complaint(complaint.dict(), background_tasks)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def transform_complaint(complaint):
    """
    Transforms a MongoDB document into a response-friendly format.
    """
    complaint["id"] = str(complaint["_id"])  
    complaint.pop("_id") 
    complaint["status"] = complaint.get("status", "In review")  
    complaint["resolution"] = complaint.get("resolution", None)
    return complaint



@router.get("/", response_model=List[ComplaintResponse])
async def fetch_all_complaints(email: str):
    complaints = await complaint_collection.find({"email": email}).to_list(100)
    return [
        {
            "id": str(complaint["_id"]),
            "firstname": complaint["firstname"],
            "lastname": complaint["lastname"],
            "mobilenumber": complaint["mobilenumber"],
            "email": complaint["email"],
            "issue_type": complaint["issue_type"],
            "details": complaint["details"],
            "status": complaint.get("status", "In review"),
            "resolution": complaint.get("resolution"),
            "orderID": complaint.get("orderID", None),  # Include orderID if it exists
        }
        for complaint in complaints
    ]




@router.patch("/{complaint_id}", status_code=200)
async def update_complaint(complaint_id: str, status: str, resolution: Optional[str] = None):
    try:
        update_data = {"status": status}
        if resolution:
            update_data["resolution"] = resolution

        result = await complaint_collection.update_one(
            {"_id": ObjectId(complaint_id)},
            {"$set": update_data}
        )

        if result.modified_count == 1:
            updated_complaint = await complaint_collection.find_one({"_id": ObjectId(complaint_id)})
            if updated_complaint:
                updated_complaint["id"] = str(updated_complaint["_id"])
                updated_complaint.pop("_id")
                return updated_complaint

        raise HTTPException(status_code=404, detail="Complaint not found or not updated")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
