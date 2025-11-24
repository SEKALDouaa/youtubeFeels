from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import joblib

# Load model & vectorizer
MODEL_PATH = "models/sentiment_model.joblib"
VECTORIZER_PATH = "models/tfidf.joblib"

print("[INFO] Loading model...")
model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)
print("[INFO] Model loaded.")

app = FastAPI(
    title="YouTube Sentiment API",
    version="1.0"
)

# CORS for Chrome Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health")
def health():
    return {"status": "ok", "model": "loaded"}

@app.post("/predict_batch")
async def predict_batch(payload: dict):
    comments = payload.get("comments", [])
    if not comments:
        return {"sentiments": [], "confidences": []}

    X = vectorizer.transform(comments)
    preds = model.predict(X)
    probs = model.predict_proba(X)
    conf = np.max(probs, axis=1)

    return {
        "sentiments": preds.tolist(),
        "confidences": conf.tolist()
    }
