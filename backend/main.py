
from fastapi import FastAPI ,Request,status
from fastapi.staticfiles import StaticFiles

from fastapi.middleware.cors import CORSMiddleware 
origins=['http://localhost:3000']
from fastapi.encoders import jsonable_encoder

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


from src.routes import auth_routes,product_routes

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
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({"detail": exc.errors(), "body": exc.body}),
    )

app.mount("/upload_images", StaticFiles(directory="uploaded_images"), name="upload_images")
app.include_router(auth_routes.router)
app.include_router(product_routes.router)



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


# app= FastAPI() 

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=['*'],
#     allow_headers=['*'],

# )

# @app.post("/register")
# async def register_user(register: Register):
#     return await create_register(register)


# @app.post("/login")
# async def check_login(login:Login):
#     return await validate_login(login)
    

    

