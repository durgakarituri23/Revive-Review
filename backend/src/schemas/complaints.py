from pydantic import BaseModel, EmailStr
from typing import Optional

class ComplaintBase(BaseModel):
    buyer_id: int
    issue_type: str
    details: str
    email: Optional[EmailStr]

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintResponse(ComplaintBase):
    id: int

    class Config:
        orm_mode = True
