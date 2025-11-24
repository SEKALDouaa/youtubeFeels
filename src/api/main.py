from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np

from .shemas import CommentBatch, PredictionResponse
from src.api.model_loader import model, vectorizer

app = FastAPI(
    title="YouTube Sentiment API",
    version="1.0"
)

# CORS (allow Chrome extension)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # in production you can restrict it
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health")
def health_check():
    return {"status": "ok", "model": "loaded"}

@app.post("/predict_batch", response_model=PredictionResponse)
def predict_batch(payload: CommentBatch):

    comments = payload.comments
    if not comments:
        return {"sentiments": [], "confidences": []}

    X = vectorizer.transform(comments)

    predictions = model.predict(X)
    probabilities = model.predict_proba(X)
    confidences = np.max(probabilities, axis=1)

    return PredictionResponse(
        sentiments=predictions.tolist(),
        confidences=confidences.tolist()
    )
