# Backend (FastAPI)

This directory contains the FastAPI backend for HumanFit AI.

- `app/main.py`: FastAPI app entrypoint.
- `app/api/endpoints.py`: All API endpoints.
- `requirements.txt`: Python dependencies.
- `Dockerfile`: Containerization.

## Endpoints
- `/users`, `/avatars`, `/garments`, `/recommend`, `/tryon`, `/feedback`

## Running
```
$env:PYTHONPATH = "C:\humanfit-ai\backend"
uvicorn app.main:app --reload
```

## Feedback
Feedback is stored in `feedback.jsonl` for model retraining.
