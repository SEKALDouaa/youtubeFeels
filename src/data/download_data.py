import os
import pandas as pd
import requests

DATA_URL = "https://raw.githubusercontent.com/Himanshu-1703/reddit-sentiment-analysis/refs/heads/main/data/reddit.csv"
RAW_PATH = "data/raw/reddit.csv"

def download_dataset():
    os.makedirs("data/raw", exist_ok=True)
    print("[INFO] Downloading dataset...")

    response = requests.get(DATA_URL)
    response.raise_for_status()

    with open(RAW_PATH, "wb") as f:
        f.write(response.content)

    print(f"[INFO] Saved dataset to {RAW_PATH}")

    df = pd.read_csv(RAW_PATH)
    print("\n=== Dataset Statistics ===")
    print("Number of rows:", len(df))
    print("Label distribution:")
    print(df["category"].value_counts())

if __name__ == "__main__":
    download_dataset()
