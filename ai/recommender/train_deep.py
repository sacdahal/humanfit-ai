"""
Train a deep learning hybrid recommender for HumanFit AI
- Uses user, garment, image, and interaction data
- Saves model as deep_model.h5
- To tune: adjust embedding_dim, layers, epochs, batch_size, optimizer, etc.
- To add: garment image embeddings, user feedback integration
"""
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import os

# Dummy data for demonstration (replace with real data loading)
num_users = 100
num_garments = 200
embedding_dim = 32  # Tune this value
image_embedding_dim = 1280  # MobileNetV2 output size

# Simulated user IDs, garment IDs, and interactions (ratings or clicks)
user_ids = np.random.randint(0, num_users, size=1000)
garment_ids = np.random.randint(0, num_garments, size=1000)
interactions = np.random.randint(0, 2, size=1000)  # 0/1 for like/dislike

# --- Garment image embeddings integration ---
# Load precomputed image embeddings (use image_features.py to generate this file)
image_embeddings = np.zeros((num_garments, image_embedding_dim))
if os.path.exists("garment_image_embeddings.npy"):
    loaded = np.load("garment_image_embeddings.npy", allow_pickle=True).item()
    for i in range(num_garments):
        fname = f"{i}.jpg"  # Or your actual mapping
        if fname in loaded:
            image_embeddings[i] = loaded[fname]

# --- User feedback integration ---
def add_feedback(user_id, garment_id, feedback):
    # feedback: 1 for like, 0 for dislike
    global user_ids, garment_ids, interactions
    user_ids = np.append(user_ids, user_id)
    garment_ids = np.append(garment_ids, garment_id)
    interactions = np.append(interactions, feedback)
    print(f"Added feedback: user {user_id}, garment {garment_id}, feedback {feedback}")

# Model definition: neural collaborative filtering + image features
user_input = keras.Input(shape=(1,), name="user_id")
garment_input = keras.Input(shape=(1,), name="garment_id")
image_input = keras.Input(shape=(image_embedding_dim,), name="image_emb")

user_emb = layers.Embedding(num_users, embedding_dim)(user_input)
garment_emb = layers.Embedding(num_garments, embedding_dim)(garment_input)

x = layers.Concatenate()([user_emb, garment_emb, image_input])
x = layers.Flatten()(x)
x = layers.Dense(64, activation="relu")(x)
x = layers.Dense(16, activation="relu")(x)
out = layers.Dense(1, activation="sigmoid")(x)

model = keras.Model([user_input, garment_input, image_input], out)
model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])

# Prepare image embedding batch for training
garment_image_batch = image_embeddings[garment_ids]

# Train
model.fit([user_ids, garment_ids, garment_image_batch], interactions, epochs=10, batch_size=64)

# Save
model.save("deep_model.h5")
print("Model saved as deep_model.h5")
