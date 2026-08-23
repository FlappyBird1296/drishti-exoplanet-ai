import numpy as np
from astropy.timeseries import BoxLeastSquares


def run_bls(
    df,
    min_period=0.5,
    max_period=None
):
    """
    Run a Box Least Squares search on a processed
    stellar light curve.

    Parameters
    ----------
    df : pandas.DataFrame
        Must contain:
            time
            detrended_flux

    min_period : float
        Minimum orbital period in days.

    max_period : float or None
        Maximum orbital period in days.
    """

    time = df["time"].to_numpy(dtype=float)
    flux = df["detrended_flux"].to_numpy(dtype=float)

    # Remove invalid observations
    valid = (
        np.isfinite(time)
        & np.isfinite(flux)
    )

    time = time[valid]
    flux = flux[valid]

    if len(time) < 50:
        raise ValueError(
            "At least 50 observations are required for BLS."
        )

    observation_duration = (
        np.max(time) - np.min(time)
    )

    # We want at least three possible transits
    # in the observation window.
    if max_period is None:

        max_period = observation_duration / 3.0

    max_period = max(
        min_period * 2,
        max_period
    )

    # Don't search beyond the actual observation span.
    max_period = min(
        max_period,
        observation_duration / 2
    )

    if max_period <= min_period:
        raise ValueError(
            "Observation window is too short "
            "for the requested period range."
        )

    model = BoxLeastSquares(
        time,
        flux
    )

    # Typical transit durations in days.
    durations = np.array([
        0.02,
        0.05,
        0.10,
        0.20,
        0.30,
        0.50
    ])

    durations = durations[
        durations < min_period
    ]

    if len(durations) == 0:
        durations = np.array([
            min_period / 4
        ])

    # Search using SNR as the optimization objective.
    periodogram = model.autopower(
        durations,
        objective="snr",
        minimum_period=min_period,
        maximum_period=max_period,
        oversample=5
    )

    best_index = np.argmax(
        periodogram.power
    )

    best_period = float(
        periodogram.period[best_index]
    )

    best_duration = float(
        periodogram.duration[best_index]
    )

    best_depth = float(
        periodogram.depth[best_index]
    )

    best_transit_time = float(
        periodogram.transit_time[best_index]
    )

    best_power = float(
        periodogram.power[best_index]
    )

    depth_snr = float(
        periodogram.depth_snr[best_index]
    )

    return {
        "period": best_period,
        "duration": best_duration,
        "depth": best_depth,
        "transit_time": best_transit_time,
        "power": best_power,
        "depth_snr": depth_snr,
        "observation_duration":
            float(observation_duration)
    }

def calculate_bls_statistics(
    df,
    bls_result
):
    """
    Calculate additional transit-vetting statistics
    using the best BLS solution.
    """

    time = df["time"].to_numpy(dtype=float)
    flux = df["detrended_flux"].to_numpy(dtype=float)

    model = BoxLeastSquares(
        time,
        flux
    )

    stats = model.compute_stats(
        bls_result["period"],
        bls_result["duration"],
        bls_result["transit_time"]
    )

    depth_odd = stats["depth_odd"][0]
    depth_even = stats["depth_even"][0]

    depth = stats["depth"][0]

    if depth != 0:

        odd_even_difference = (
            abs(depth_odd - depth_even)
            / abs(depth)
        )

    else:

        odd_even_difference = 0.0

    transit_counts = stats[
        "per_transit_count"
    ]

    return {
        "depth": float(depth),

        "depth_error":
            float(stats["depth"][1]),

        "odd_depth":
            float(depth_odd),

        "even_depth":
            float(depth_even),

        "odd_even_difference":
            float(odd_even_difference),

        "harmonic_amplitude":
            float(
                stats["harmonic_amplitude"]
            ),

        "harmonic_delta_log_likelihood":
            float(
                stats[
                    "harmonic_delta_log_likelihood"
                ]
            ),

        "number_of_transits":
            int(len(transit_counts))
    }

def generate_transit_times(
    transit_time,
    period,
    observation_start,
    observation_end
):
    """
    Generate expected transit centers using
    the BLS period and transit epoch.
    """

    if period is None or period <= 0:
        return []

    if observation_end <= observation_start:
        return []

    # Move the reference epoch backward
    # until it is near the observation window.
    first_index = int(
        np.floor(
            (
                observation_start
                - transit_time
            ) / period
        )
    )

    first_time = (
        transit_time
        + first_index * period
    )

    transit_times = []

    current = first_time

    # Safety limit
    max_transits = 1000

    count = 0

    while (
        current <= observation_end
        and count < max_transits
    ):

        if current >= observation_start:

            transit_times.append(
                float(current)
            )

        current += period

        count += 1

    return transit_times