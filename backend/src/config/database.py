import motor.motor_asyncio
from src.models.user import User

client=motor.motor_asyncio.AsyncIOMotorClient('mongodb://localhost:27017/')
database =client.RandR 
users = database.Users

product_collection = database.ProductDetails
cart = database.Cart
payment_methods = database.PaymentDetails
category = database.Categories
complaint_collection = database.Complaints
orders = database.Orders

