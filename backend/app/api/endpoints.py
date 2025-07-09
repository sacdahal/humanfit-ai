from fastapi import APIRouter, HTTPException, Body, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from ai.recommender.model import RecommenderModel
from ai.virtual_tryon import render
from passlib.context import CryptContext
import jwt
import time
from app.db import get_db
from app import models

router = APIRouter()

SECRET_KEY = "your-secret-key"  # Change this in production
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic schemas for request/response
class UserSchema(BaseModel):
    id: int
    name: str
    email: str
    model_config = {"from_attributes": True}

class AvatarSchema(BaseModel):
    id: int
    user_id: int
    mesh_url: str
    texture_url: Optional[str] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    chest_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    hips_cm: Optional[float] = None
    model_config = {"from_attributes": True}

class GarmentSchema(BaseModel):
    id: int
    name: str
    category: str
    asset_url: str
    model_url: str
    image_url: Optional[str] = None
    model_config = {"from_attributes": True, 'protected_namespaces': ()}

class RecommendationRequest(BaseModel):
    user_profile: dict
    garment_catalog: list

class TryOnRequest(BaseModel):
    user_id: int
    avatar_id: int
    garment_id: int

class FeedbackSchema(BaseModel):
    user_id: int
    garment_id: int
    feedback: int  # 1 for like, 0 for dislike

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.get("/ping")
def ping():
    return {"message": "pong"}

# User endpoints
@router.post("/users", response_model=UserSchema)
def create_user(user: UserSchema, db: Session = Depends(get_db)):
    db_user = models.User(name=user.name, email=user.email, hashed_password="")
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/users/{user_id}", response_model=UserSchema)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Signup/Login endpoints
@router.post("/signup")
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == request.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = pwd_context.hash(request.password)
    db_user = models.User(name=request.name, email=request.email, hashed_password=hashed)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "Signup successful", "user_id": db_user.id}

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user or not pwd_context.verify(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = jwt.encode({"user_id": user.id, "exp": time.time() + 3600}, SECRET_KEY, algorithm="HS256")
    return {"access_token": token}

# Avatar endpoints
@router.post("/avatars", response_model=AvatarSchema)
def create_avatar(avatar: AvatarSchema, db: Session = Depends(get_db)):
    # Simulate mesh creation based on gender and measurements
    if avatar.gender and avatar.height_cm:
        mesh_url = f"https://cdn.humanfit.ai/avatars/{avatar.user_id}/mesh_{avatar.gender}_{int(avatar.height_cm)}.obj"
    else:
        mesh_url = avatar.mesh_url
    db_avatar = models.Avatar(
        user_id=avatar.user_id,
        mesh_url=mesh_url,
        texture_url=avatar.texture_url,
        gender=avatar.gender,
        height_cm=avatar.height_cm,
        chest_cm=avatar.chest_cm,
        waist_cm=avatar.waist_cm,
        hips_cm=avatar.hips_cm
    )
    db.add(db_avatar)
    db.commit()
    db.refresh(db_avatar)
    return db_avatar

@router.get("/avatars/{avatar_id}", response_model=AvatarSchema)
def get_avatar(avatar_id: int, db: Session = Depends(get_db)):
    avatar = db.query(models.Avatar).filter(models.Avatar.id == avatar_id).first()
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")
    return avatar

# Garment endpoints
@router.post("/garments", response_model=GarmentSchema)
def create_garment(garment: GarmentSchema, db: Session = Depends(get_db)):
    db_garment = models.Garment(
        name=garment.name,
        category=garment.category,
        asset_url=garment.asset_url,
        model_url=garment.model_url,
        image_url=garment.image_url
    )
    db.add(db_garment)
    db.commit()
    db.refresh(db_garment)
    return db_garment

@router.get("/garments", response_model=List[GarmentSchema])
def list_garments(db: Session = Depends(get_db)):
    return db.query(models.Garment).all()

# Recommendation endpoint (no DB change needed)
@router.post("/recommend")
def recommend(request: RecommendationRequest = Body(...)):
    recommender = RecommenderModel()
    recs = recommender.recommend(request.user_profile, request.garment_catalog)
    return {"recommendations": recs}

# Try-on endpoint (fetch avatar/garment from DB)
@router.post("/tryon")
def tryon(request: TryOnRequest, db: Session = Depends(get_db)):
    avatar = db.query(models.Avatar).filter(models.Avatar.id == request.avatar_id).first()
    garment = db.query(models.Garment).filter(models.Garment.id == request.garment_id).first()
    if not avatar or not garment:
        raise HTTPException(status_code=404, detail="Avatar or Garment not found")
    result = render.render_tryon(avatar.mesh_url, garment.model_url)
    return {"result": result}

# Feedback endpoint (store in DB)
@router.post("/feedback")
def collect_feedback(feedback: FeedbackSchema, db: Session = Depends(get_db)):
    db_feedback = models.Feedback(
        user_id=feedback.user_id,
        garment_id=feedback.garment_id,
        feedback=feedback.feedback
    )
    db.add(db_feedback)
    db.commit()
    return {"status": "success", "message": "Feedback recorded."}
