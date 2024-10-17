import motor.motor_asyncio
from src.models.user import User

client=motor.motor_asyncio.AsyncIOMotorClient('mongodb://localhost:27017/')
database =client.RandR 
collection =database.User

admin=database.Admin
seller=database.Seller
