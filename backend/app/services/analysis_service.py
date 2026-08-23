import numpy as np

from app.services.preprocessing import (
    preprocess_light_curve
)

from app.services.feature_extraction import (
    extract_features
)

from app.services.candidate_score import (
    calculate_candidate_score
)

from app.services.predictor import (
    predict
)

from app.services.visualization import (
    create_light_curve_data,
    create_transit_data
)

from app.services.phase_folding import (
    phase_fold
)


def analyze_light_curve(file_bytes: bytes):
    """
    Complete exoplanet light-curve analysis pipeline.

    Returns all information required by the API
    and frontend.
    """

    # ==========================================
    # 1. PREPROCESSING
    # ==========================================

    processed = preprocess_light_curve(
        file_bytes
    )

    df = processed["data"]

    # ==========================================
    # 2. FEATURE EXTRACTION
    # ==========================================

    features = extract_features(
        df
    )

    # ==========================================
    # 3. CANDIDATE SCORE
    # ==========================================

    candidate_score = (
        calculate_candidate_score(
            features
        )
    )

    # ==========================================
    # 4. ML PREDICTION
    # ==========================================

    ml_prediction = predict(
        features
    )

    # ==========================================
    # 5. LIGHT CURVE DATA
    # ==========================================

    light_curve = (
        create_light_curve_data(
            df
        )
    )

    # ==========================================
    # 6. TRANSIT DATA
    # ==========================================

    detected_transits = (
        create_transit_data(
            features
        )
    )

    # ==========================================
    # 7. PHASE FOLDING
    # ==========================================

    phase, folded_flux = phase_fold(

        df["time"].to_numpy(),

        df["detrended_flux"].to_numpy(),

        features["estimated_period"],

        features["transit_time"]
    )

    phase_folded_curve = [

        {
            "phase": float(p),

            "flux": float(f)
        }

        for p, f in zip(
            phase,
            folded_flux
        )
    ]

    # ==========================================
    # 8. VISUALIZATION DATA
    # ==========================================

    MAX_VIS_POINTS = 1200


    def extract_transit_time(transit):
        """
        Extract the transit center from the structure
        returned by create_transit_data().
        """

        if isinstance(transit, (int, float)):
            return float(transit)

        if not isinstance(transit, dict):
            return None

        possible_keys = [
            "time",
            "transit_time",
            "center_time",
            "mid_time",
            "center",
            "epoch",
            "t0",
        ]

        for key in possible_keys:

            value = transit.get(key)

            if value is not None:

                try:
                    return float(value)

                except (
                    TypeError,
                    ValueError,
                ):
                    continue

        return None


    def transit_aware_downsample(
        df,
        detected_transits,
        max_points,
        transit_duration=None,
    ):
        """
        Downsample a light curve for visualization while
        preserving observations around detected transits.

        IMPORTANT:
        This is visualization-only.

        BLS, feature extraction and ML continue using
        the complete cleaned dataframe.
        """

        if len(df) <= max_points:
            return df

        # ------------------------------------------
        # Extract transit centers
        # ------------------------------------------

        transit_times = []

        for transit in detected_transits:

            time = extract_transit_time(
                transit
            )

            if time is not None:
                transit_times.append(time)

        # ------------------------------------------
        # Fall back to uniform sampling if the
        # transit structure doesn't expose a time.
        # ------------------------------------------

        if not transit_times:

            indices = (
                
                np.linspace(
                    0,
                    len(df) - 1,
                    max_points,
                    dtype=int,
                )
            )

            return df.iloc[indices]

        # ------------------------------------------
        # Determine preservation window
        # ------------------------------------------

        times = df["time"].to_numpy()

        if transit_duration is not None:

            try:
                transit_duration = float(
                    transit_duration
                )
            except (
                TypeError,
                ValueError,
            ):
                transit_duration = None

        # Use the measured transit duration when
        # available. Otherwise estimate from cadence.

        if (
            transit_duration is not None
            and transit_duration > 0
        ):

            preservation_window = (
                transit_duration * 1.5
            )

        else:

            if len(times) > 1:

                cadence = (
                    times[1:] - times[:-1]
                )

                cadence = cadence[
                    cadence > 0
                ]

                if len(cadence):

                    preservation_window = (
                        float(
                            cadence.mean()
                        ) * 8
                    )

                else:

                    preservation_window = 0.01

            else:

                preservation_window = 0.01

        # ------------------------------------------
        # Identify important transit observations
        # ------------------------------------------

        transit_mask = __import__('numpy').zeros(
            len(df),
            dtype=bool)

        for transit_time in transit_times:

            transit_mask |= (
                abs(times - transit_time)
                <= preservation_window
            )

        transit_indices = (
            
            np.flatnonzero(
                transit_mask
            )
        )

        normal_indices = (
            
            np.flatnonzero(
                ~transit_mask
            )
        )

        # ------------------------------------------
        # Give transits up to 40% of the available
        # visualization budget.
        # ------------------------------------------

        transit_budget = min(
            len(transit_indices),
            max(
                1,
                int(
                    max_points * 0.4
                ),
            ),
        )

        normal_budget = (
            max_points -
            transit_budget
        )

        # ------------------------------------------
        # Sample transit points
        # ------------------------------------------

        if (
            len(transit_indices)
            <= transit_budget
        ):

            selected_transits = (
                transit_indices
            )

        else:

            selected_transits = (
                
                np.linspace(
                    0,
                    len(transit_indices) - 1,
                    transit_budget,
                    dtype=int,
                )
            )

            selected_transits = (
                transit_indices[
                    selected_transits
                ]
            )

        # ------------------------------------------
        # Sample normal points
        # ------------------------------------------

        if (
            len(normal_indices)
            <= normal_budget
        ):

            selected_normal = (
                normal_indices
            )

        else:

            selected_normal = (
                
                np.linspace(
                    0,
                    len(normal_indices) - 1,
                    normal_budget,
                    dtype=int,
                )
            )

            selected_normal = (
                normal_indices[
                    selected_normal
                ]
            )

        # ------------------------------------------
        # Combine and restore chronological order
        # ------------------------------------------

        selected_indices = sorted(
            set(
                selected_transits.tolist()
                +
                selected_normal.tolist()
            )
        )

        # Protect against rounding producing
        # slightly more points than requested.

        selected_indices = (
            selected_indices[:max_points]
        )

        return df.iloc[
            selected_indices
        ]


    # ------------------------------------------
    # Create transit-aware light curve
    # ------------------------------------------

    df_vis = transit_aware_downsample(
        df=df,
        detected_transits=detected_transits,
        max_points=MAX_VIS_POINTS,
        transit_duration=features.get(
            "transit_duration"
        ),
    )

    light_curve = create_light_curve_data(
        df_vis
    )


    # ------------------------------------------
    # Phase-folded visualization
    # ------------------------------------------

    phase_vis = phase
    folded_flux_vis = folded_flux

    if len(phase) > MAX_VIS_POINTS:

        # Phase zero corresponds to the transit
        # center, so preserve more observations
        # around phase = 0.

        

        phase = np.asarray(phase)
        folded_flux = np.asarray(
            folded_flux
        )

        transit_region = (
            np.abs(phase) <= 0.08
        )

        transit_indices = np.flatnonzero(
            transit_region
        )

        normal_indices = np.flatnonzero(
            ~transit_region
        )

        phase_transit_budget = min(
            len(transit_indices),
            int(
                MAX_VIS_POINTS * 0.4
            ),
        )

        phase_normal_budget = (
            MAX_VIS_POINTS
            - phase_transit_budget
        )

        if (
            len(transit_indices)
            <= phase_transit_budget
        ):

            selected_transits = (
                transit_indices
            )

        else:

            selected_transits = (
                np.linspace(
                    0,
                    len(transit_indices) - 1,
                    phase_transit_budget,
                    dtype=int,
                )
            )

            selected_transits = (
                transit_indices[
                    selected_transits
                ]
            )

        if (
            len(normal_indices)
            <= phase_normal_budget
        ):

            selected_normal = (
                normal_indices
            )

        else:

            selected_normal = (
                np.linspace(
                    0,
                    len(normal_indices) - 1,
                    phase_normal_budget,
                    dtype=int,
                )
            )

            selected_normal = (
                normal_indices[
                    selected_normal
                ]
            )

        selected_indices = sorted(
            set(
                selected_transits.tolist()
                +
                selected_normal.tolist()
            )
        )

        selected_indices = (
            selected_indices[:MAX_VIS_POINTS]
        )

        phase_vis = phase[
            selected_indices
        ]

        folded_flux_vis = folded_flux[
            selected_indices
        ]


    phase_folded_curve = [
        {
            "phase": float(p),
            "flux": float(f),
        }
        for p, f in zip(
            phase_vis,
            folded_flux_vis,
        )
    ]
    # ==========================================
    # 9. RETURN ANALYSIS
    # ==========================================

    return {

        "processed": processed,

        "features": features,

        "candidate_score":
            candidate_score,

        "ml_prediction":
            ml_prediction,

        "light_curve":
            light_curve,

        "detected_transits":
            detected_transits,

        "phase_folded_curve":
            phase_folded_curve

    }