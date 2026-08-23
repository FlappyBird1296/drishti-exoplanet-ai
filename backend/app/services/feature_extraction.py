import numpy as np
from scipy.signal import find_peaks
from app.services.bls_detector import (
    run_bls,
    calculate_bls_statistics,
    generate_transit_times
)

def calculate_noise(flux):
    """Estimate noise using median absolute deviation."""

    flux = np.asarray(flux)

    median = np.median(flux)

    mad = np.median(
        np.abs(flux - median)
    )

    noise = 1.4826 * mad

    if noise == 0:
        noise = np.std(flux)

    return float(noise)


def detect_transits(df):
    """
    Detect significant brightness dips.
    """

    time = df["time"].to_numpy()
    flux = df["detrended_flux"].to_numpy()

    signal = 1.0 - flux

    noise = calculate_noise(flux)

    if noise <= 0:
        return {
            "indices": [],
            "times": [],
            "depths": [],
            "prominences": []
        }

    prominence = max(
        noise * 3,
        0.0005
    )

    # Prevent detections from clustering
    if len(time) > 100:
        distance = max(
            5,
            len(time) // 200
        )
    else:
        distance = 2

    peaks, properties = find_peaks(
        signal,
        prominence=prominence,
        distance=distance
    )

    return {
        "indices": peaks.tolist(),
        "times": time[peaks].tolist(),
        "depths": signal[peaks].tolist(),
        "prominences": properties[
            "prominences"
        ].tolist()
    }


def estimate_period(transit_times):
    """
    Estimate recurrence period from transit times.
    """

    if len(transit_times) < 2:
        return None

    times = np.sort(
        np.asarray(transit_times)
    )

    differences = np.diff(times)

    differences = differences[
        differences > 0
    ]

    if len(differences) == 0:
        return None

    return float(
        np.median(differences)
    )


def calculate_period_consistency(
    transit_times
):
    """
    Measures how consistently transit events
    repeat at the estimated period.

    Higher value = more periodic.
    """

    if len(transit_times) < 3:
        return 0.0

    times = np.sort(
        np.asarray(transit_times)
    )

    differences = np.diff(times)

    median_period = np.median(
        differences
    )

    if median_period <= 0:
        return 0.0

    variation = (
        np.std(differences)
        / median_period
    )

    consistency = 1.0 / (
        1.0 + variation
    )

    return float(consistency)


def estimate_transit_duration(
    time,
    flux,
    transit_index
):
    """
    Roughly estimate transit duration
    around a detected dip.
    """

    if transit_index <= 0:
        return 0.0

    if transit_index >= len(flux) - 1:
        return 0.0

    baseline = np.median(flux)

    depth = baseline - flux[transit_index]

    if depth <= 0:
        return 0.0

    threshold = (
        baseline - depth * 0.5
    )

    left = transit_index

    while (
        left > 0
        and flux[left] < threshold
    ):
        left -= 1

    right = transit_index

    while (
        right < len(flux) - 1
        and flux[right] < threshold
    ):
        right += 1

    duration = (
        time[right] - time[left]
    )

    return float(
        max(duration, 0)
    )


def calculate_snr(df):
    """
    Calculate approximate signal-to-noise ratio.
    """

    flux = df["detrended_flux"].to_numpy()

    baseline = np.median(flux)

    deviations = np.abs(
        flux - baseline
    )

    signal = np.max(deviations)

    noise = calculate_noise(flux)

    if noise <= 0:
        return 0.0

    return float(
        signal / noise
    )


def calculate_baseline_variability(df):
    """
    Measure overall stellar variability.
    """

    flux = df["detrended_flux"].to_numpy()

    return float(
        np.std(flux)
    )


def calculate_depth_consistency(
    depths
):
    """
    Compare detected transit depths.

    Higher value = more consistent depths.
    """

    if len(depths) < 2:
        return 0.0

    depths = np.asarray(depths)

    mean_depth = np.mean(depths)

    if mean_depth <= 0:
        return 0.0

    variation = (
        np.std(depths)
        / mean_depth
    )

    return float(
        1.0 / (1.0 + variation)
    )


def extract_features(df):
    """
    Extract scientific and ML features from
    a processed stellar light curve.
    """

    time = df["time"].to_numpy()
    flux = df["detrended_flux"].to_numpy()

    # --------------------------------
    # BLS SEARCH
    # --------------------------------

    bls = run_bls(df)

    bls_stats = calculate_bls_statistics(
        df,
        bls
    )

    # --------------------------------
    # BASIC SIGNAL INFORMATION
    # --------------------------------

    baseline = np.median(flux)

    noise = calculate_noise(flux)

    if noise > 0:

        signal_to_noise = (
            abs(bls["depth"]) / noise
        )

    else:

        signal_to_noise = 0.0

    baseline_variability = float(
        np.std(flux)
    )

    observation_duration = float(
        time[-1] - time[0]
    )

    # --------------------------------
    # TRANSIT CONSISTENCY
    # --------------------------------

    transit_count = (
        bls_stats["number_of_transits"]
    )

    if transit_count >= 3:
        periodicity_score = 1.0

    elif transit_count == 2:
        periodicity_score = 0.5

    else:
        periodicity_score = 0.0

    expected_transits = generate_transit_times(
        bls["transit_time"],
        bls["period"],
        time[0],
        time[-1]
    )


    # --------------------------------
    # RETURN FEATURES
    # --------------------------------

    return {

        # BLS
        "estimated_period":
            bls["period"],

        "transit_duration":
            bls["duration"],

        "transit_depth":
            bls["depth"],

        "transit_time":
            bls["transit_time"],

        "bls_power":
            bls["power"],

        "bls_depth_snr":
            bls["depth_snr"],

        # Transit statistics
        "number_of_transits":
            transit_count,

        "odd_transit_depth":
            bls_stats["odd_depth"],

        "even_transit_depth":
            bls_stats["even_depth"],

        "odd_even_difference":
            bls_stats["odd_even_difference"],

        "harmonic_amplitude":
            bls_stats["harmonic_amplitude"],

        "harmonic_delta_log_likelihood":
            bls_stats[
                "harmonic_delta_log_likelihood"
            ],

        # Signal statistics
        "signal_to_noise":
            float(signal_to_noise),

        "baseline_variability":
            baseline_variability,

        "observation_duration":
            observation_duration,

        "periodicity_score":
            periodicity_score,

        "transit_times": 
            expected_transits,

        "transit_depths": [
            float(bls["depth"])
        ]

        
    }