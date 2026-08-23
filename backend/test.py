from app.services.preprocessing import (
    preprocess_light_curve
)

from app.services.feature_extraction import (
    extract_features
)


with open(
    "ml_data/tess/TIC_388852438.csv",
    "rb"
) as f:

    contents = f.read()


processed = preprocess_light_curve(
    contents
)

features = extract_features(
    processed["data"]
)

print(features)