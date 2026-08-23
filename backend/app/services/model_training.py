from pathlib import Path

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)
from sklearn.model_selection import GroupShuffleSplit


BASE_DIR = Path(__file__).resolve().parent.parent.parent

DATA_PATH = (
    BASE_DIR
    / "ml_data"
    / "training_data.csv"
)

MODEL_PATH = (
    BASE_DIR
    / "app"
    / "models"
    / "exoplanet_model.joblib"
)

FEATURE_IMPORTANCE_PATH = (
    BASE_DIR
    / "ml_data"
    / "feature_importance.csv"
)


FEATURES = [
    "estimated_period",
    "transit_duration",
    "transit_depth",
    "bls_power",
    "bls_depth_snr",
    "number_of_transits",
    "odd_transit_depth",
    "even_transit_depth",
    "odd_even_difference",
    "harmonic_amplitude",
    "harmonic_delta_log_likelihood",
    "signal_to_noise",
    "baseline_variability",
    "observation_duration",
    "periodicity_score"
]

TARGET = "label"

GROUP = "tic_id"


def load_dataset():

    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found:\n{DATA_PATH}\n\n"
            "Run build_dataset.py first."
        )

    df = pd.read_csv(DATA_PATH)

    print(
        f"Loaded {len(df)} samples."
    )

    required_columns = (
        FEATURES
        + [TARGET, GROUP]
    )

    missing = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing:
        raise ValueError(
            "Dataset is missing columns:\n"
            + "\n".join(missing)
        )

    return df


def clean_dataset(df):

    df = df.copy()

    # Convert features to numeric
    for feature in FEATURES:

        df[feature] = pd.to_numeric(
            df[feature],
            errors="coerce"
        )

    df[TARGET] = pd.to_numeric(
        df[TARGET],
        errors="coerce"
    )

    # Remove rows with invalid labels
    df = df.dropna(
        subset=[TARGET]
    )

    # Replace infinite feature values
    df[FEATURES] = (
        df[FEATURES]
        .replace(
            [float("inf"), float("-inf")],
            float("nan")
        )
    )

    # Median imputation
    for feature in FEATURES:

        median = df[feature].median()

        if pd.isna(median):
            median = 0.0

        df[feature] = (
            df[feature]
            .fillna(median)
        )

    df[TARGET] = (
        df[TARGET]
        .astype(int)
    )

    return df


def print_dataset_statistics(df):

    print("\nDATASET STATISTICS")
    print("-------------------------")

    print(
        f"Total samples: {len(df)}"
    )

    print(
        f"Unique TICs: "
        f"{df[GROUP].nunique()}"
    )

    print("\nClass distribution:")

    counts = (
        df[TARGET]
        .value_counts()
        .sort_index()
    )

    for label, count in counts.items():

        name = (
            "Non-candidate"
            if label == 0
            else "Planetary candidate"
        )

        percentage = (
            count / len(df) * 100
        )

        print(
            f"{name}: "
            f"{count} "
            f"({percentage:.2f}%)"
        )


def split_dataset(df):

    splitter = GroupShuffleSplit(
        n_splits=1,
        test_size=0.20,
        random_state=42
    )

    train_indices, test_indices = next(
        splitter.split(
            df,
            df[TARGET],
            groups=df[GROUP]
        )
    )

    train_df = df.iloc[
        train_indices
    ].copy()

    test_df = df.iloc[
        test_indices
    ].copy()

    return train_df, test_df


def train_model(
    X_train,
    y_train
):

    model = RandomForestClassifier(

        n_estimators=500,

        max_depth=12,

        min_samples_leaf=2,

        class_weight="balanced",

        random_state=42,

        n_jobs=-1
    )

    print(
        "\nTraining Random Forest..."
    )

    model.fit(
        X_train,
        y_train
    )

    return model


def evaluate_model(
    model,
    X_test,
    y_test
):

    predictions = model.predict(
        X_test
    )

    probabilities = (
        model.predict_proba(
            X_test
        )[:, 1]
    )

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        y_test,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0
    )

    try:

        roc_auc = roc_auc_score(
            y_test,
            probabilities
        )

    except ValueError:

        roc_auc = 0.0

    matrix = confusion_matrix(
        y_test,
        predictions
    )

    print("\nMODEL PERFORMANCE")
    print("=========================")

    print(
        f"Accuracy : {accuracy:.4f}"
    )

    print(
        f"Precision: {precision:.4f}"
    )

    print(
        f"Recall   : {recall:.4f}"
    )

    print(
        f"F1 Score : {f1:.4f}"
    )

    print(
        f"ROC-AUC  : {roc_auc:.4f}"
    )

    print("\nConfusion Matrix:")

    print(matrix)

    print(
        "\nClassification Report:"
    )

    print(
        classification_report(
            y_test,
            predictions,
            target_names=[
                "Non-candidate",
                "Candidate"
            ],
            zero_division=0
        )
    )

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "roc_auc": roc_auc
    }


def save_feature_importance(
    model
):

    importance_df = pd.DataFrame({

        "feature": FEATURES,

        "importance":
            model.feature_importances_

    })

    importance_df = (
        importance_df
        .sort_values(
            "importance",
            ascending=False
        )
        .reset_index(drop=True)
    )

    importance_df.to_csv(
        FEATURE_IMPORTANCE_PATH,
        index=False
    )

    print(
        "\nFEATURE IMPORTANCE"
    )

    print(
        importance_df.to_string(
            index=False
        )
    )

    return importance_df


def save_model(model):

    MODEL_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    joblib.dump(
        model,
        MODEL_PATH
    )

    print(
        f"\nModel saved to:\n"
        f"{MODEL_PATH}"
    )


def main():

    df = load_dataset()

    df = clean_dataset(df)

    print_dataset_statistics(
        df
    )

    # Need both classes
    if df[TARGET].nunique() < 2:

        raise ValueError(
            "Dataset must contain both "
            "positive and negative samples."
        )

    train_df, test_df = (
        split_dataset(df)
    )

    print(
        "\nDATA SPLIT"
    )

    print(
        f"Training samples: "
        f"{len(train_df)}"
    )

    print(
        f"Testing samples: "
        f"{len(test_df)}"
    )

    print(
        f"Training TICs: "
        f"{train_df[GROUP].nunique()}"
    )

    print(
        f"Testing TICs: "
        f"{test_df[GROUP].nunique()}"
    )

    X_train = train_df[
        FEATURES
    ]

    y_train = train_df[
        TARGET
    ]

    X_test = test_df[
        FEATURES
    ]

    y_test = test_df[
        TARGET
    ]

    model = train_model(
        X_train,
        y_train
    )

    metrics = evaluate_model(
        model,
        X_test,
        y_test
    )

    save_feature_importance(
        model
    )

    save_model(
        model
    )

    print(
        "\n=============================="
    )

    print(
        "TRAINING COMPLETE"
    )

    print(
        "=============================="
    )


if __name__ == "__main__":
    main()