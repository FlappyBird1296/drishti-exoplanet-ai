def calculate_candidate_score(features):

    score = 0.0

    # Repeated transits
    if features["number_of_transits"] >= 3:
        score += 20

    elif features["number_of_transits"] == 2:
        score += 10

    # Signal strength
    snr = features["bls_depth_snr"]

    if snr >= 10:
        score += 25

    elif snr >= 7:
        score += 18

    elif snr >= 5:
        score += 10

    # Periodicity
    score += (
        features["periodicity_score"] * 20
    )

    # Odd/even consistency
    odd_even = (
        features["odd_even_difference"]
    )

    if odd_even < 0.05:
        score += 15

    elif odd_even < 0.10:
        score += 8

    # Reasonable transit depth
    depth = abs(
        features["transit_depth"]
    )

    if 0.0001 <= depth <= 0.05:
        score += 10

    return min(
        round(score, 2),
        100.0
    )