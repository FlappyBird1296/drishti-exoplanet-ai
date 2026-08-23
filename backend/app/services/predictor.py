from pathlib import Path

import joblib
import numpy as np


MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "models"
    / "exoplanet_model.joblib"
)


FEATURE_NAMES = [

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


def load_model():

    if not MODEL_PATH.exists():
        return None

    return joblib.load(
        MODEL_PATH
    )


def prepare_features(features):

    values = []

    for name in FEATURE_NAMES:

        value = features.get(
            name,
            0.0
        )

        if value is None:
            value = 0.0

        if not np.isfinite(value):
            value = 0.0

        values.append(
            float(value)
        )

    return np.array([
        values
    ])


def predict(features):

    model = load_model()

    if model is None:

        return {
            "status": "model_not_trained",
            "prediction": None,
            "confidence": None
        }

    X = prepare_features(
        features
    )

    prediction = model.predict(
        X
    )[0]

    probabilities = (
        model.predict_proba(X)[0]
    )

    candidate_probability = float(
        probabilities[1]
    )

    if prediction == 1:

        label = (
            "planetary_candidate"
        )

    else:

        label = (
            "non_candidate"
        )

    return {

        "status":
            "prediction_complete",

        "prediction":
            label,

        "confidence":
            candidate_probability,

        "candidate_probability":
            candidate_probability,

        "non_candidate_probability":
            float(probabilities[0])
    }