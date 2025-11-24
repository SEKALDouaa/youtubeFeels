import joblib
import pandas as pd
from sklearn.metrics import classification_report, accuracy_score

model = joblib.load("models/sentiment_model.joblib")
vectorizer = joblib.load("models/tfidf.joblib")

example_comments = [
    "",
    "😂😂😂😂",
    "This video is absolutely amazing!",
    "Worst thing ever, I'm disappointed",
    "Good job, but could be improved…",
    "bhjfjdsjhfjds",  
    "It's so gentil de make;:d!"
]

X_examples = vectorizer.transform(example_comments)
example_preds = model.predict(X_examples)

print("Individual test predictions:")
for text, pred in zip(example_comments, example_preds):
    print(f"[{pred}] {text}")

test_df = pd.read_csv(r"C:\Users\LENOVO\Desktop\INDIA\S5\Cloud computing\TPs\TP3\sentiment-youtube\data\processed\test.csv")  

test_texts = test_df["text"].tolist()
test_labels = test_df["label"].tolist()

X_test = vectorizer.transform(test_texts)
y_pred = model.predict(X_test)

print("\nTest set predictions (first 10 examples):")
for text, pred in zip(test_texts[:10], y_pred[:10]):
    print(f"[{pred}] {text}")

print("\nTest set evaluation:")
print("Accuracy:", accuracy_score(test_labels, y_pred))
print(classification_report(test_labels, y_pred))
