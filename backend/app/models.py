from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    avatars = relationship("Avatar", back_populates="user")

class Avatar(Base):
    __tablename__ = "avatars"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    mesh_url = Column(String)
    texture_url = Column(String)
    gender = Column(String)
    height_cm = Column(Float)
    chest_cm = Column(Float)
    waist_cm = Column(Float)
    hips_cm = Column(Float)
    user = relationship("User", back_populates="avatars")

class Garment(Base):
    __tablename__ = "garments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    category = Column(String)
    asset_url = Column(String)
    model_url = Column(String)
    image_url = Column(String)

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    garment_id = Column(Integer)
    feedback = Column(Integer)  # 1 for like, 0 for dislike
