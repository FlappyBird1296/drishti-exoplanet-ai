import numpy as np
import pandas as pd
from scipy.signal import savgol_filter


def load_light_curve(file_bytes: bytes):
    """
    Load a CSV light curve from uploaded bytes.

    Expected columns:
        time
        flux
    """

    from io import BytesIO

    df = pd.read_csv(BytesIO(file_bytes))

    # Convert column names to lowercase
    df.columns = [col.strip().lower() for col in df.columns]

    if "time" not in df.columns:
        raise ValueError("CSV must contain a 'time' column.")

    if "flux" not in df.columns:
        raise ValueError("CSV must contain a 'flux' column.")

    df = df[["time", "flux"]].copy()

    # Convert values to numeric
    df["time"] = pd.to_numeric(df["time"], errors="coerce")
    df["flux"] = pd.to_numeric(df["flux"], errors="coerce")

    # Remove invalid values
    df = df.dropna()

    # Remove duplicate timestamps
    df = df.drop_duplicates(subset="time")

    # Sort chronologically
    df = df.sort_values("time")

    if len(df) < 20:
        raise ValueError(
            "Light curve must contain at least 20 valid observations."
        )

    return df


def remove_outliers(df, sigma=5):
    """
    Remove extreme flux outliers using sigma clipping.
    """

    flux = df["flux"]

    median = flux.median()
    std = flux.std()

    if std == 0 or np.isnan(std):
        return df.copy()

    lower = median - sigma * std
    upper = median + sigma * std

    cleaned = df[
        (df["flux"] >= lower) &
        (df["flux"] <= upper)
    ].copy()

    return cleaned


def normalize_flux(df):
    """
    Normalize flux around 1.0.
    """

    df = df.copy()

    median_flux = df["flux"].median()

    if median_flux == 0:
        raise ValueError("Invalid flux values.")

    df["normalized_flux"] = df["flux"] / median_flux

    return df


def detrend_flux(df, window=51, polyorder=2):
    """
    Remove long-term stellar brightness variations
    using a Savitzky-Golay filter.
    """

    df = df.copy()

    flux = df["normalized_flux"].values

    # Window must be odd and smaller than dataset
    if window >= len(flux):
        window = len(flux) - 1

    if window % 2 == 0:
        window -= 1

    if window <= polyorder:
        df["detrended_flux"] = flux
        return df

    trend = savgol_filter(
        flux,
        window_length=window,
        polyorder=polyorder
    )

    df["trend"] = trend

    # Divide out the long-term trend
    df["detrended_flux"] = flux / trend

    return df


def preprocess_light_curve(file_bytes: bytes):
    """
    Complete preprocessing pipeline.
    """

    df = load_light_curve(file_bytes)

    original_count = len(df)

    df = remove_outliers(df)

    after_outlier_removal = len(df)

    df = normalize_flux(df)

    df = detrend_flux(df)

    return {
        "data": df,
        "original_points": original_count,
        "cleaned_points": after_outlier_removal
    }