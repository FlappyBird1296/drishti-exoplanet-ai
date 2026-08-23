import numpy as np


def phase_fold(
    time,
    flux,
    period,
    transit_time
):
    """
    Fold a light curve around a candidate period.

    Returns phase and flux arrays sorted by phase.
    """

    if period is None or period <= 0:

        return [], []

    time = np.asarray(
        time,
        dtype=float
    )

    flux = np.asarray(
        flux,
        dtype=float
    )

    phase = (
        (
            time - transit_time
        ) / period
    )

    phase = (
        phase + 0.5
    ) % 1.0 - 0.5

    order = np.argsort(
        phase
    )

    return (
        phase[order].tolist(),
        flux[order].tolist()
    )