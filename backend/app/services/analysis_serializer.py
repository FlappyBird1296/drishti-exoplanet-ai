import json


def serialize_analysis(
    analysis
):

    # ==========================================
    # TRANSIT TIMES
    # ==========================================

    transit_data = []

    if analysis.transit_data:

        try:

            transit_data = json.loads(
                analysis.transit_data
            )

        except (
            json.JSONDecodeError,
            TypeError,
        ):

            transit_data = []


    # ==========================================
    # STORED VISUALIZATION DATA
    # ==========================================

    feature_data = {}

    if analysis.feature_data:

        try:

            feature_data = json.loads(
                analysis.feature_data
            )

        except (
            json.JSONDecodeError,
            TypeError,
        ):

            feature_data = {}


    light_curve = (
        feature_data.get(
            "light_curve",
            []
        )
    )

    detected_transits = (
        feature_data.get(
            "detected_transits",
            []
        )
    )

    phase_folded_curve = (
        feature_data.get(
            "phase_folded_curve",
            []
        )
    )


    # ==========================================
    # SERIALIZED RESPONSE
    # ==========================================

    return {

        "id":
            analysis.id,

        "filename":
            analysis.filename,

        "created_at":
            analysis.created_at.isoformat()
            if analysis.created_at
            else None,

        "data": {

            "original_points":
                analysis.original_points,

            "cleaned_points":
                analysis.cleaned_points,

            "visualization_points":
                len(light_curve),
        },

        # ======================================
        # GRAPHICAL ANALYSIS DATA
        # ======================================

        "light_curve":
            light_curve,

        "detected_transits":
            detected_transits,

        "phase_folded_curve":
            phase_folded_curve,

        # ======================================
        # SCIENTIFIC FEATURES
        # ======================================

        "candidate_analysis": {

            "candidate_score":
                analysis.candidate_score,

            "period_days":
                analysis.period_days,

            "transit_duration_days":
                analysis.transit_duration_days,

            "transit_depth":
                analysis.transit_depth,

            "bls_power":
                analysis.bls_power,

            "bls_snr":
                analysis.bls_snr,

            "number_of_transits":
                analysis.number_of_transits,

            "odd_even_difference":
                analysis.odd_even_difference,

            "periodicity_score":
                analysis.periodicity_score,
        },

        # ======================================
        # ML PREDICTION
        # ======================================

        "ml_prediction": {

            "prediction":
                analysis.prediction,

            "confidence":
                analysis.confidence,

            "candidate_probability":
                analysis.candidate_probability,

            "non_candidate_probability":
                analysis.non_candidate_probability,
        },

        # ======================================
        # TRANSIT TIMES
        # ======================================

        "transit_times":
            transit_data,
    }