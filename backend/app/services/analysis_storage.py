import json

from sqlalchemy.orm import Session

from app.database.models import Analysis


def save_analysis(
    db: Session,
    filename,
    processed,
    features,
    candidate_score,
    prediction,
    light_curve=None,
    detected_transits=None,
    phase_folded_curve=None,
):

    # ==========================================
    # STORE ANALYSIS + VISUALIZATION DATA
    # ==========================================

    stored_feature_data = {
        key: value
        for key, value in features.items()
        if isinstance(
            value,
            (
                int,
                float,
                str,
                type(None),
            ),
        )
    }

    # Visualization data is stored in the existing
    # feature_data JSON column.
    stored_feature_data["light_curve"] = (
        light_curve or []
    )

    stored_feature_data["detected_transits"] = (
        detected_transits or []
    )

    stored_feature_data["phase_folded_curve"] = (
        phase_folded_curve or []
    )

    feature_data = json.dumps(
        stored_feature_data
    )

    analysis = Analysis(

        filename=filename,

        original_points=(
            processed[
                "original_points"
            ]
        ),

        cleaned_points=(
            processed[
                "cleaned_points"
            ]
        ),

        period_days=(
            features[
                "estimated_period"
            ]
        ),

        transit_duration_days=(
            features[
                "transit_duration"
            ]
        ),

        transit_depth=(
            features[
                "transit_depth"
            ]
        ),

        bls_power=(
            features[
                "bls_power"
            ]
        ),

        bls_snr=(
            features[
                "bls_depth_snr"
            ]
        ),

        number_of_transits=(
            features[
                "number_of_transits"
            ]
        ),

        odd_even_difference=(
            features[
                "odd_even_difference"
            ]
        ),

        periodicity_score=(
            features[
                "periodicity_score"
            ]
        ),

        candidate_score=(
            candidate_score
        ),

        prediction=(
            prediction.get(
                "prediction"
            )
        ),

        confidence=(
            prediction.get(
                "confidence"
            )
        ),

        candidate_probability=(
            prediction.get(
                "candidate_probability"
            )
        ),

        non_candidate_probability=(
            prediction.get(
                "non_candidate_probability"
            )
        ),

        # Existing transit storage remains unchanged.
        transit_data=json.dumps(
            features.get(
                "transit_times",
                []
            )
        ),

        # NEW:
        # Store complete visualization payload.
        feature_data=feature_data,
    )

    db.add(
        analysis
    )

    db.commit()

    db.refresh(
        analysis
    )

    return analysis