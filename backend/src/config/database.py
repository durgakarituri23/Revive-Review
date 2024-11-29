import motor.motor_asyncio
from src.models.user import User

client=motor.motor_asyncio.AsyncIOMotorClient('mongodb://localhost:27017/')
database =client.RandR 
users = database.Users

upload_product = database.ProductDetails
cart = database.Cart
payment_methods = database.Cards
category = database.Categories
