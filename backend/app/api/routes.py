from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends
)

from sqlalchemy.orm import Session

from app.database.database import (
    get_db
)

from app.database.models import (
    Analysis
)

from app.services.analysis_service import (
    analyze_light_curve
)

from app.services.analysis_storage import (
    save_analysis
)

from app.services.analysis_serializer import (
    serialize_analysis
)


router = APIRouter()


@router.get("/health")
def health_check():

    return {
        "status": "healthy",
        "service": "exoplanet-detection-api"
    }


@router.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Filename is missing."
        )

    if not file.filename.lower().endswith(
        ".csv"
    ):

        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported."
        )

    file_bytes = await file.read()

    if not file_bytes:

        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    try:

        result = analyze_light_curve(
            file_bytes
        )

        analysis = save_analysis(

            db=db,

            filename=file.filename,

            processed=result[
                "processed"
            ],

            features=result[
                "features"
            ],

            candidate_score=result[
                "candidate_score"
            ],

            prediction=result[
                "ml_prediction"
            ],

            # ======================================
            # STORE GRAPHICAL ANALYSIS
            # ======================================

            light_curve=result[
                "light_curve"
            ],

            detected_transits=result[
                "detected_transits"
            ],

            phase_folded_curve=result[
                "phase_folded_curve"
            ],
        )

        return {

            "analysis_id":
                analysis.id,

            "filename":
                file.filename,

            "data": {

                "original_points":
                    result[
                        "processed"
                    ][
                        "original_points"
                    ],

                "cleaned_points":
                    result[
                        "processed"
                    ][
                        "cleaned_points"
                    ],

                "visualization_points":
                    len(result["light_curve"])    
            },

            "light_curve":
                result[
                    "light_curve"
                ],

            "detected_transits":
                result[
                    "detected_transits"
                ],

            "phase_folded_curve":
                result[
                    "phase_folded_curve"
                ],

            "candidate_analysis": {

                "candidate_score":
                    result[
                        "candidate_score"
                    ],

                "period_days":
                    result[
                        "features"
                    ][
                        "estimated_period"
                    ],

                "transit_duration_days":
                    result[
                        "features"
                    ][
                        "transit_duration"
                    ],

                "transit_depth":
                    result[
                        "features"
                    ][
                        "transit_depth"
                    ],

                "bls_power":
                    result[
                        "features"
                    ][
                        "bls_power"
                    ],

                "bls_snr":
                    result[
                        "features"
                    ][
                        "bls_depth_snr"
                    ],

                "number_of_transits":
                    result[
                        "features"
                    ][
                        "number_of_transits"
                    ],

                "odd_even_difference":
                    result[
                        "features"
                    ][
                        "odd_even_difference"
                    ],

                "periodicity_score":
                    result[
                        "features"
                    ][
                        "periodicity_score"
                    ]
            },

            "ml_prediction":
                result[
                    "ml_prediction"
                ],

            "status":
                "analysis_complete"
        }
    finally:
        db.close()

@router.get("/analyses")
def get_analyses(
    db: Session = Depends(get_db)
):

    analyses = (
        db.query(Analysis)
        .order_by(
            Analysis.created_at.desc()
        )
        .all()
    )

    return {

        "count":
            len(analyses),

        "analyses": [
            serialize_analysis(
                analysis
            )

            for analysis in analyses
        ]
    }


@router.get("/analyses/{analysis_id}")
def get_analysis(
    analysis_id: int,

    db: Session = Depends(get_db)
):

    analysis = (
        db.query(Analysis)

        .filter(
            Analysis.id == analysis_id
        )

        .first()
    )

    if analysis is None:

        raise HTTPException(
            status_code=404,
            detail="Analysis not found."
        )

    return serialize_analysis(
        analysis
    )


@router.get("/candidates")
def get_candidates(
    db: Session = Depends(get_db)
):

    candidates = (
        db.query(Analysis)

        .filter(
            Analysis.prediction
            == "planetary_candidate"
        )

        .order_by(
            Analysis.candidate_probability.desc()
        )

        .all()
    )

    return {

        "count":
            len(candidates),

        "candidates": [

            serialize_analysis(
                analysis
            )

            for analysis in candidates
        ]
    }

@router.get("/dashboard")
def dashboard_statistics(
    db: Session = Depends(get_db)
):

    total = (
        db.query(Analysis)
        .count()
    )

    candidates = (
        db.query(Analysis)

        .filter(
            Analysis.prediction
            == "planetary_candidate"
        )

        .count()
    )

    high_confidence = (
        db.query(Analysis)

        .filter(
            Analysis.candidate_probability
            >= 0.80
        )

        .count()
    )

    scores = [
        analysis.candidate_score

        for analysis in (
            db.query(Analysis)
            .filter(
                Analysis.candidate_score
                != None
            )
            .all()
        )
    ]

    if scores:

        average_score = (
            sum(scores)
            / len(scores)
        )

    else:

        average_score = 0.0

    return {

        "total_analyses":
            total,

        "potential_candidates":
            candidates,

        "high_confidence_candidates":
            high_confidence,

        "average_candidate_score":
            round(
                average_score,
                2
            )
    }