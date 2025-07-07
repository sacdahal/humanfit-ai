"""
Extract and save garment image embeddings using MobileNetV2
"""
import os
import numpy as np
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing import image

mobilenet = MobileNetV2(weights='imagenet', include_top=False, pooling='avg')

def get_image_embedding(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)
    return mobilenet.predict(x)[0]

def extract_and_save_embeddings(image_dir, output_path):
    embeddings = {}
    for fname in os.listdir(image_dir):
        if fname.lower().endswith(('.jpg', '.png', '.jpeg')):
            img_path = os.path.join(image_dir, fname)
            emb = get_image_embedding(img_path)
            embeddings[fname] = emb
    np.save(output_path, embeddings)
    print(f"Saved embeddings to {output_path}")

if __name__ == "__main__":
    # Example usage: extract_and_save_embeddings('garment_images', 'garment_image_embeddings.npy')
    pass
