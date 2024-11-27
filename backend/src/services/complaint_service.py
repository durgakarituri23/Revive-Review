from sqlalchemy.orm import Session
from src.models.complaints import Complaint
from src.schemas.complaints import ComplaintCreate

def create_complaint(db: Session, complaint: ComplaintCreate):
    new_complaint = Complaint(**complaint.dict())
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    return new_complaint

def get_all_complaints(db: Session):
    return db.query(Complaint).all()
