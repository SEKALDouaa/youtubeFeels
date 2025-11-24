import pandas as pd
from sklearn.model_selection import train_test_split

PROCESSED_PATH = "data/processed/reddit_clean.csv"

def prepare_data():
    df = pd.read_csv(PROCESSED_PATH)

    print("\n=== EDA ===")
    print("Number of rows:", len(df))

    # Rename columns to standardized names
    df = df.rename(columns={
        "clean_comment": "text",
        "category": "label"
    })

    print("\nLabel distribution:")
    print(df["label"].value_counts())

    # Drop rows with missing or empty text
    df = df.dropna(subset=["text"])
    df = df[df["text"].str.strip() != ""]

    # Compute text length safely
    df["length"] = df["text"].apply(len)
    print("\nText length stats:")
    print(df["length"].describe())

    # Train-test split (reproducible)
    train_df, test_df = train_test_split(
        df, test_size=0.2, random_state=42, stratify=df["label"]
    )

    train_df.to_csv("data/processed/train.csv", index=False)
    test_df.to_csv("data/processed/test.csv", index=False)

    print("\n[INFO] Train/test split completed.")
    print("Train size:", len(train_df))
    print("Test size:", len(test_df))

if __name__ == "__main__":
    prepare_data()
