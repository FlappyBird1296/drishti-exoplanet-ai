from pathlib import Path
import time

import numpy as np
import pandas as pd

from astroquery.ipac.nexsci.nasa_exoplanet_archive import (
    NasaExoplanetArchive
)
import lightkurve as lk

from app.services.preprocessing import (
    preprocess_light_curve
)

from app.services.feature_extraction import (
    extract_features
)


BASE_DIR = Path(__file__).resolve().parent

DATA_DIR = BASE_DIR / "ml_data"

TESS_DIR = DATA_DIR / "tess"

METADATA_DIR = DATA_DIR / "metadata"

OUTPUT_FILE = DATA_DIR / "training_data.csv"


POSITIVE_DISPOSITIONS = {
    "PC",
    "CP",
    "KP"
}

NEGATIVE_DISPOSITIONS = {
    "FP",
    "FA"
}


FEATURE_COLUMNS = [

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


def create_directories():

    TESS_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    METADATA_DIR.mkdir(
        parents=True,
        exist_ok=True
    )


def get_toi_catalog(limit=100):

    print(
        "Querying NASA Exoplanet Archive..."
    )

    query = """
        tfopwg_disp IN ('PC', 'CP', 'KP', 'FP', 'FA')
    """

    table = NasaExoplanetArchive.query_criteria(
        table="toi",
        select=(
            "tid,"          # Changed from 'tic_id' to 'tid'
            "toi,"
            "tfopwg_disp,"
            "ra,"
            "dec"
        ),
        where=query
    )

    df = table.to_pandas()

    df.columns = [
        column.lower()
        for column in df.columns
    ]

    # Rename 'tid' to 'tic_id' for consistency in your script
    if "tid" in df.columns:
        df = df.rename(columns={"tid": "tic_id"})

    # Remove missing TIC IDs
    df = df.dropna(
        subset=["tic_id"]
    )

    # Convert TIC IDs into integers
    df["tic_id"] = (
        pd.to_numeric(
            df["tic_id"],
            errors="coerce"
        )
    )

    df = df.dropna(
        subset=["tic_id"]
    )

    df["tic_id"] = (
        df["tic_id"]
        .astype("int64")
    )

    # Remove duplicate TIC targets.
    df = (
        df.sort_values("toi")
        .drop_duplicates(
            subset=["tic_id"],
            keep="first"
        )
    )

    # Balance positive/negative classes
    positives = df[
        df["tfopwg_disp"].isin(
            POSITIVE_DISPOSITIONS
        )
    ]

    negatives = df[
        df["tfopwg_disp"].isin(
            NEGATIVE_DISPOSITIONS
        )
    ]

    n = min(
        len(positives),
        len(negatives),
        limit // 2
    )

    positives = positives.head(n)
    negatives = negatives.head(n)

    result = pd.concat(
        [positives, negatives],
        ignore_index=True
    )

    result = result.sample(
        frac=1,
        random_state=42
    ).reset_index(drop=True)

    return result

def download_tess_lightcurve(tic_id):

    target = f"TIC {tic_id}"

    print(
        f"Searching TESS data: {target}"
    )

    search_result = lk.search_lightcurve(
        target,
        mission="TESS"
    )

    if len(search_result) == 0:

        raise RuntimeError(
            f"No TESS data found for {target}"
        )

    # Prefer SPOC products.
    try:

        spoc = search_result[
            search_result.table["author"]
            == "SPOC"
        ]

        if len(spoc) > 0:
            search_result = spoc

    except Exception:
        pass

    print(
        f"Found {len(search_result)} TESS products."
    )

    # For the first dataset version,
    # use one sector per target.
    #
    # This keeps the dataset generation
    # manageable and avoids complications
    # from stitching different sectors.

    product = search_result[0]

    lightcurve = product.download()

    if lightcurve is None:

        raise RuntimeError(
            "TESS light curve download failed."
        )

    return lightcurve


def save_raw_lightcurve(
    lightcurve,
    tic_id
):

    # Cast big-endian arrays to standard float64 native byte order
    time_values = np.array(
        lightcurve.time.value,
        dtype=np.float64
    )

    flux_values = np.array(
        lightcurve.flux.value,
        dtype=np.float64
    )

    df = pd.DataFrame({
        "time": time_values,
        "flux": flux_values
    })

    df = df.dropna()

    path = (
        TESS_DIR
        / f"TIC_{tic_id}.csv"
    )

    df.to_csv(
        path,
        index=False
    )

    return path

def process_target(
    tic_id,
    label
):

    raw_path = (
        TESS_DIR
        / f"TIC_{tic_id}.csv"
    )

    # Use cached data if already downloaded.
    if raw_path.exists():

        print(
            f"Using cached light curve: "
            f"TIC {tic_id}"
        )

        with open(
            raw_path,
            "rb"
        ) as file:

            file_bytes = file.read()

    else:

        lightcurve = (
            download_tess_lightcurve(
                tic_id
            )
        )

        raw_path = save_raw_lightcurve(
            lightcurve,
            tic_id
        )

        with open(
            raw_path,
            "rb"
        ) as file:

            file_bytes = file.read()

    # -------------------------
    # PREPROCESSING
    # -------------------------

    processed = (
        preprocess_light_curve(
            file_bytes
        )
    )

    df = processed["data"]

    # -------------------------
    # FEATURE EXTRACTION
    # -------------------------

    features = extract_features(
        df
    )

    # -------------------------
    # CREATE DATASET ROW
    # -------------------------

    row = {
        "tic_id": tic_id,

        "label": label,

        "original_points":
            processed[
                "original_points"
            ],

        "cleaned_points":
            processed[
                "cleaned_points"
            ]
    }

    for feature in FEATURE_COLUMNS:

        value = features.get(
            feature,
            0.0
        )

        if value is None:
            value = 0.0

        row[feature] = value

    return row


def main():
    start = time.time()

    create_directories()

    # Start small.
    #
    # Example:
    # 20 targets = 10 positive + 10 negative

    LIMIT = 10000

    toi_df = get_toi_catalog(
        limit=LIMIT
    )

    print(
        f"\nSelected {len(toi_df)} targets."
    )

    print(
        toi_df[
            [
                "tic_id",
                "toi",
                "tfopwg_disp"
            ]
        ]
    )

    # Save metadata for reproducibility.
    toi_df.to_csv(
        METADATA_DIR
        / "selected_toi_targets.csv",
        index=False
    )

    rows = []

    for index, target in toi_df.iterrows():

        tic_id = int(
            target["tic_id"]
        )

        disposition = (
            str(
                target["tfopwg_disp"]
            )
            .strip()
            .upper()
        )

        if disposition in POSITIVE_DISPOSITIONS:

            label = 1

        elif disposition in NEGATIVE_DISPOSITIONS:

            label = 0

        else:

            continue

        print(
            f"\n[{index + 1}/{len(toi_df)}]"
        )

        print(
            f"TIC: {tic_id}"
        )

        print(
            f"Disposition: {disposition}"
        )

        try:

            row = process_target(
                tic_id,
                label
            )

            rows.append(row)

            print(
                "✓ Successfully processed"
            )

        except Exception as error:

            print(
                f"✗ Failed: {error}"
            )

        # Avoid hammering remote services.
        time.sleep(1)

    if not rows:

        raise RuntimeError(
            "No targets were successfully processed."
        )

    dataset = pd.DataFrame(
        rows
    )

    dataset.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print(
        "\n=============================="
    )

    print(
        "DATASET GENERATION COMPLETE"
    )

    print(
        "=============================="
    )

    print(
        f"Samples: {len(dataset)}"
    )

    print(
        f"Positive: "
        f"{(dataset['label'] == 1).sum()}"
    )

    print(
        f"Negative: "
        f"{(dataset['label'] == 0).sum()}"
    )

    print(
        f"Saved to:\n{OUTPUT_FILE}"
    )

    end = time.time()
    print(
        f"Total time: {end - start:.2f} seconds"
    )


if __name__ == "__main__":
    main()