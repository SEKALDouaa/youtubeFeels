import joblib

MODEL_PATH = "models/sentiment_model.joblib"
VECTORIZER_PATH = "models/tfidf.joblib"

print("[INFO] Loading model and vectorizer...")
model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)

print("[INFO] Model loaded successfully!")
