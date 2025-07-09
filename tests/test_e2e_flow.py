import requests

BASE_URL = "http://127.0.0.1:8000"

# 1. Create a user
user = {"id": 102, "name": "Jamie Lee", "email": "jamie.lee@example.com"}
r1 = requests.post(f"{BASE_URL}/users/", json=user)
assert r1.status_code == 200, r1.text

# 2. Create an avatar
avatar = {
    "id": 2,
    "user_id": 102,
    "mesh_url": "https://cdn.humanfit.ai/avatars/102/mesh.obj",
    "texture_url": "https://cdn.humanfit.ai/avatars/102/texture.png"
}
r2 = requests.post(f"{BASE_URL}/avatars/", json=avatar)
assert r2.status_code == 200, r2.text

# 3. Add a garment
garment = {
    "id": 502,
    "name": "Classic T-Shirt",
    "category": "Tops",
    "image_url": "https://cdn.humanfit.ai/garments/502/image.jpg",
    "model_url": "https://cdn.humanfit.ai/garments/502/model.obj",
    "asset_url": "https://cdn.humanfit.ai/garments/502/asset.glb"
}
r3 = requests.post(f"{BASE_URL}/garments/", json=garment)
assert r3.status_code == 200, r3.text

# 4. Get recommendations
recommend_payload = {
    "user_profile": {
        "user_id": 102,
        "preferences": ["casual", "t-shirt"]
    },
    "garment_catalog": [garment]
}
r4 = requests.post(f"{BASE_URL}/recommend", json=recommend_payload)
assert r4.status_code == 200, r4.text
print("Recommendations:", r4.json())

# 5. Try virtual try-on
tryon = {"user_id": 102, "avatar_id": 2, "garment_id": 502}
r5 = requests.post(f"{BASE_URL}/tryon", json=tryon)
assert r5.status_code == 200, r5.text
print("Try-on result:", r5.json())
