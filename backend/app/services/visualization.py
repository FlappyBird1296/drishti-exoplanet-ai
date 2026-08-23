import numpy as np


def create_light_curve_data(df):
    """
    Convert processed DataFrame into JSON-safe
    light curve points.
    """

    points = []

    for _, row in df.iterrows():

        time = float(row["time"])

        flux = float(
            row["detrended_flux"]
        )

        if (
            np.isfinite(time)
            and np.isfinite(flux)
        ):

            points.append({
                "time": time,
                "flux": flux
            })

    return points


def create_transit_data(features):
    """
    Convert detected transit information
    into JSON-safe objects.
    """

    times = features.get(
        "transit_times",
        []
    )

    depths = features.get(
        "transit_depths",
        []
    )

    result = []

    for time, depth in zip(
        times,
        depths
    ):

        if (
            np.isfinite(time)
            and np.isfinite(depth)
        ):

            result.append({
                "time": float(time),
                "depth": float(depth)
            })

    return result