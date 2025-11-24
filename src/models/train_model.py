import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix, classification_report
from sklearn.model_selection import GridSearchCV

TRAIN_PATH = "data/processed/train.csv"
TEST_PATH = "data/processed/test.csv"

MODEL_PATH = "models/sentiment_model.joblib"
VECTORIZER_PATH = "models/tfidf.joblib"

def load_data():
    print("[INFO] Loading data...")
    train_df = pd.read_csv(TRAIN_PATH)
    test_df = pd.read_csv(TEST_PATH)
    return train_df, test_df

def build_vectorizer():
    print("[INFO] Creating TF-IDF vectorizer...")
    return TfidfVectorizer(
        max_features=10_000,
        ngram_range=(1, 2),
        sublinear_tf=True,
        stop_words="english"
    )

def train_and_evaluate():
    train_df, test_df = load_data()
    
    X_train, y_train = train_df["text"], train_df["label"]
    X_test, y_test = test_df["text"], test_df["label"]

    vectorizer = build_vectorizer()
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    print("[INFO] Training Logistic Regression...")

    param_grid = {
        "C": [0.5, 1.0, 2.0],
        "max_iter": [200, 300]
    }

    model = GridSearchCV(
        LogisticRegression(),
        param_grid,
        cv=3,
        scoring="f1_macro",
        n_jobs=-1,
        verbose=1
    )

    model.fit(X_train_vec, y_train)

    print("[INFO] Best parameters:", model.best_params_)
    best_model = model.best_estimator_

    # Evaluation
    preds = best_model.predict(X_test_vec)

    print("\n=== RESULTS ===")
    print("Accuracy:", accuracy_score(y_test, preds))
    print("\nF1-score:", f1_score(y_test, preds, average="macro"))
    print("\nConfusion Matrix:\n", confusion_matrix(y_test, preds))
    print("\nClassification Report:\n", classification_report(y_test, preds))

    # Save artifacts
    joblib.dump(best_model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)

    print(f"\n[INFO] Model saved to {MODEL_PATH}")
    print(f"[INFO] Vectorizer saved to {VECTORIZER_PATH}")

if __name__ == "__main__":
    train_and_evaluate()
