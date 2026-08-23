from typing import Any


def get_transit_time(transit: Any):
    """
    Extract a transit center/time from the different
    possible structures returned by the detector.
    """

    if isinstance(transit, (int, float)):
        return float(transit)

    if not isinstance(transit, dict):
        return None

    possible_keys = [
        "time",
        "center",
        "center_time",
        "mid_time",
        "transit_time",
        "epoch",
        "t0",
    ]

    for key in possible_keys:
        value = transit.get(key)

        if value is not None:
            try:
                return float(value)
            except (TypeError, ValueError):
                pass

    return None


def downsample_light_curve(
    light_curve,
    detected_transits=None,
    max_points=1200,
):
    """
    Reduce the number of points used for visualization
    while preserving points around detected transits.

    IMPORTANT:
    This function is ONLY for visualization.
    Never use the returned data for BLS or ML.
    """

    if not light_curve:
        return []

    if len(light_curve) <= max_points:
        return light_curve

    detected_transits = detected_transits or []

    transit_times = []

    for transit in detected_transits:

        time = get_transit_time(transit)

        if time is not None:
            transit_times.append(time)

    # --------------------------------------------------
    # If no usable transit positions are available,
    # perform ordinary uniform downsampling.
    # --------------------------------------------------

    if not transit_times:

        step = len(light_curve) / max_points

        return [
            light_curve[
                min(
                    int(i * step),
                    len(light_curve) - 1,
                )
            ]
            for i in range(max_points)
        ]

    # --------------------------------------------------
    # Estimate a reasonable transit preservation window.
    # --------------------------------------------------

    times = [
        float(point["time"])
        for point in light_curve
        if isinstance(point, dict)
        and "time" in point
    ]

    if len(times) < 2:
        return light_curve[:max_points]

    time_span = max(times) - min(times)

    # Small window around each transit.
    # Adjust this if your transit duration is known.
    preservation_window = time_span * 0.002

    transit_points = []
    normal_points = []

    for point in light_curve:

        try:
            point_time = float(point["time"])
        except (KeyError, TypeError, ValueError):
            continue

        is_transit = any(
            abs(point_time - transit_time)
            <= preservation_window
            for transit_time in transit_times
        )

        if is_transit:
            transit_points.append(point)
        else:
            normal_points.append(point)

    # --------------------------------------------------
    # Reserve roughly 40% of visualization budget for
    # transit regions.
    # --------------------------------------------------

    transit_budget = min(
        len(transit_points),
        int(max_points * 0.4),
    )

    normal_budget = max_points - transit_budget

    # --------------------------------------------------
    # Uniformly sample normal regions.
    # --------------------------------------------------

    if len(normal_points) <= normal_budget:
        sampled_normal = normal_points
    else:

        step = (
            len(normal_points)
            / normal_budget
        )

        sampled_normal = [
            normal_points[
                min(
                    int(i * step),
                    len(normal_points) - 1,
                )
            ]
            for i in range(normal_budget)
        ]

    # --------------------------------------------------
    # Uniformly sample transit regions.
    # --------------------------------------------------

    if len(transit_points) <= transit_budget:
        sampled_transits = transit_points
    else:

        step = (
            len(transit_points)
            / transit_budget
        )

        sampled_transits = [
            transit_points[
                min(
                    int(i * step),
                    len(transit_points) - 1,
                )
            ]
            for i in range(transit_budget)
        ]

    # --------------------------------------------------
    # Combine and restore chronological order.
    # --------------------------------------------------

    result = (
        sampled_normal +
        sampled_transits
    )

    result.sort(
        key=lambda point:
        float(point["time"])
    )

    return result[:max_points]