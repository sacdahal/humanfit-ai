# Tests for backend endpoints

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_ping():
    response = client.get("/ping")
    assert response.status_code == 200
    assert response.json() == {"message": "pong"}

def test_create_and_get_user():
    user = {"id": 1, "name": "Alice", "email": "alice@example.com"}
    response = client.post("/users", json=user)
    assert response.status_code == 200
    assert response.json() == user
    response = client.get(f"/users/{user['id']}")
    assert response.status_code == 200
    assert response.json() == user

def test_create_and_get_avatar():
    avatar = {"id": 1, "user_id": 1, "mesh_url": "mesh.obj", "texture_url": "texture.png"}
    response = client.post("/avatars", json=avatar)
    assert response.status_code == 200
    assert response.json() == avatar
    response = client.get(f"/avatars/{avatar['id']}")
    assert response.status_code == 200
    assert response.json() == avatar

def test_create_and_list_garments():
    garment = {"id": 1, "name": "T-Shirt", "category": "top", "asset_url": "tshirt.obj"}
    response = client.post("/garments", json=garment)
    assert response.status_code == 200
    assert response.json() == garment
    response = client.get("/garments")
    assert response.status_code == 200
    assert garment in response.json()

def test_create_and_get_garment():
    garment = {"id": 2, "name": "Jeans", "category": "bottom", "asset_url": "jeans.obj"}
    response = client.post("/garments", json=garment)
    assert response.status_code == 200
    assert response.json() == garment
    response = client.get("/garments")
    assert response.status_code == 200
    assert garment in response.json()

def test_avatar_pipeline_stub():
    from ai.avatar_pipeline import AvatarPipeline
    pipeline = AvatarPipeline()
    result = pipeline.from_photo("user_photo.jpg")
    assert "avatar_mesh" in result
    assert "texture" in result
    result2 = pipeline.from_measurements({"height": 170, "chest": 90})
    assert "avatar_mesh" in result2

def test_recommender_model_stub():
    from ai.recommender.model import RecommenderModel
    recommender = RecommenderModel()
    recs = recommender.recommend({"user_id": 1}, ["shirt1", "shirt2"])
    assert isinstance(recs, list)
    assert "shirt1" in recs

def test_virtual_tryon_stub():
    from ai.virtual_tryon.render import render_tryon
    result = render_tryon("avatar.obj", "shirt.obj")
    assert "Rendered" in result
    assert "avatar.obj" in result
    assert "shirt.obj" in result

def test_recommend_endpoint():
    user_profile = {"user_id": 1, "preferred_category": "top"}
    garment_catalog = ["shirt1", "shirt2", "jeans1"]
    response = client.post("/recommend", json={"user_profile": user_profile, "garment_catalog": garment_catalog})
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert data["recommendations"][0] in garment_catalog
