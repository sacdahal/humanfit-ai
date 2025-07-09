"""
Hybrid Recommendation Engine
- Content-based + Collaborative Filtering
- Deep Learning (TensorFlow/Keras) if available
"""

import random
import os

class RecommenderModel:
    def __init__(self):
        self.deep_model = None
        self.use_deep = False
        try:
            from tensorflow import keras
            if os.path.exists(os.path.join(os.path.dirname(__file__), "deep_model.h5")):
                self.deep_model = keras.models.load_model(os.path.join(os.path.dirname(__file__), "deep_model.h5"))
                self.use_deep = True
        except ImportError:
            pass
        # Simulated user-item matrix and garment features
        self.user_item_matrix = {
            1: {"shirt1": 5, "shirt2": 3, "jeans1": 4},
            2: {"shirt1": 2, "jeans1": 5, "jacket1": 4},
        }
        self.garment_features = {
            "shirt1": {"category": "top", "color": "blue"},
            "shirt2": {"category": "top", "color": "red"},
            "jeans1": {"category": "bottom", "color": "blue"},
            "jacket1": {"category": "outerwear", "color": "black"},
        }

    def recommend(self, user_profile: dict, garment_catalog: list):
        if self.use_deep and self.deep_model:
            # Use deep model for recommendations
            user_id = user_profile.get("user_id", 0)
            garment_ids = [g.get("id", 0) for g in garment_catalog]
            import numpy as np
            user_ids = np.array([user_id] * len(garment_ids))
            garment_ids = np.array(garment_ids)
            preds = self.deep_model.predict([user_ids, garment_ids]).flatten()
            # Recommend top N garments (here N=1)
            top_idx = preds.argmax()
            return [garment_catalog[top_idx]] if garment_catalog else []
        # Classic fallback logic
        user_id = user_profile.get("user_id")
        user_ratings = self.user_item_matrix.get(user_id, {})
        if user_ratings:
            sorted_items = sorted(user_ratings.items(), key=lambda x: -x[1])
            for item, _ in sorted_items:
                if item in garment_catalog:
                    return [item]
        preferred_category = user_profile.get("preferred_category")
        if preferred_category:
            for g in garment_catalog:
                if self.garment_features.get(g, {}).get("category") == preferred_category:
                    return [g]
        return [random.choice(garment_catalog)] if garment_catalog else []

# Example usage
if __name__ == "__main__":
    recommender = RecommenderModel()
    print(recommender.recommend({"user_id": 1}, ["shirt1", "shirt2"]))
