from app.services.preprocessing import (
    preprocess_light_curve
)

from app.services.feature_extraction import (
    extract_features
)


FILE = (
    "ml_data/tess/"
    "TIC_388852438.csv"
)


with open(FILE, "rb") as f:

    file_bytes = f.read()


processed = preprocess_light_curve(
    file_bytes
)

features = extract_features(
    processed["data"]
)


print("\n========== BLS ANALYSIS ==========")

print(
    f"Period: "
    f"{features['estimated_period']:.5f} days"
)

print(
    f"Transit duration: "
    f"{features['transit_duration']:.5f} days"
)

print(
    f"Transit depth: "
    f"{features['transit_depth']:.6f}"
)

print(
    f"BLS power: "
    f"{features['bls_power']:.5f}"
)

print(
    f"BLS SNR: "
    f"{features['bls_depth_snr']:.3f}"
)

print(
    f"Number of transits: "
    f"{features['number_of_transits']}"
)

print(
    f"Odd/even difference: "
    f"{features['odd_even_difference']:.5f}"
)

print(
    f"Periodicity score: "
    f"{features['periodicity_score']:.2f}"
)