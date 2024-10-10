
from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware 
origins=['http://localhost:3000']




from src.routes import auth_routes

app = FastAPI()

# CORS settings
origins = ["*"]  # Define your allowed origins here

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Register the routes
app.include_router(auth_routes.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

