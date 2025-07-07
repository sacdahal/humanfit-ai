from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints
from app.db import engine
from app import models

app = FastAPI(title="HumanFit AI Backend")

# Create tables
models.Base.metadata.create_all(bind=engine)

# Enable CORS for all origins to allow frontend (Flutter/web) to access backend APIs during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Include additional API endpoints
app.include_router(endpoints.router)
