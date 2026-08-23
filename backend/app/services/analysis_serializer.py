import json


def serialize_analysis(
    analysis
):

    transit_data = []

    if analysis.transit_data:

        try:

            transit_data = json.loads(
                analysis.transit_data
            )

        except json.JSONDecodeError:

            transit_data = []

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
                analysis.cleaned_points
        },

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
                analysis.periodicity_score
        },

        "ml_prediction": {

            "prediction":
                analysis.prediction,

            "confidence":
                analysis.confidence,

            "candidate_probability":
                analysis.candidate_probability,

            "non_candidate_probability":
                analysis.non_candidate_probability
        },

        "transit_times":
            transit_data
    }