# Recommender System

This directory contains classic and deep learning recommenders for HumanFit AI.

- `model.py`: Main recommender logic (auto-selects deep model if available).
- `train.py`: Classic recommender training.
- `train_deep.py`: Deep learning recommender training (TensorFlow/Keras).
- `image_features.py`: Utility for extracting garment image embeddings.

## Training
1. Extract garment image embeddings: `python image_features.py`
2. Train deep model: `python train_deep.py`
3. Retrain with feedback: `python retrain_from_feedback.py` (to be created)

## Usage
The backend will use the deep model if present, otherwise fallback to classic logic.
