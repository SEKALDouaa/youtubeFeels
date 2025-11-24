import os
import re
import pandas as pd

RAW_PATH = "data/raw/reddit.csv"
PROCESSED_PATH = "data/processed/reddit_clean.csv"

def clean_text(text):
    text = str(text)
    text = re.sub(r"http\S+", " ", text)          # remove URLs
    text = re.sub(r"@\w+", " ", text)             # remove @mentions
    text = re.sub(r"[^A-Za-z0-9\s]", " ", text)   # remove emojis & special chars
    text = re.sub(r"\s+", " ", text).strip()
    return text

def clean_dataset():
    os.makedirs("data/processed", exist_ok=True)

    df = pd.read_csv(RAW_PATH)
    print("[INFO] Cleaning dataset...")

    # Apply text cleaning
    df["clean_comment"] = df["clean_comment"].apply(clean_text)

    # Drop rows where text is NaN or empty after cleaning
    df = df.dropna(subset=["clean_comment"])
    df = df[df["clean_comment"].str.strip() != ""]

    df.to_csv(PROCESSED_PATH, index=False)
    print(f"[INFO] Clean dataset saved to {PROCESSED_PATH}")


if __name__ == "__main__":
    clean_dataset()
