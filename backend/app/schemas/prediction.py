from typing import List, Optional

from pydantic import BaseModel


class LightCurvePoint(BaseModel):
    time: float
    flux: float


class TransitPoint(BaseModel):
    time: float
    depth: float


class CandidateAnalysis(BaseModel):

    candidate_score: float

    period_days: Optional[float] = None

    transit_duration_days: float

    transit_depth: float

    bls_power: float

    bls_snr: float

    number_of_transits: int

    odd_even_difference: float

    periodicity_score: float


class MLPrediction(BaseModel):

    status: str

    prediction: Optional[str] = None

    confidence: Optional[float] = None

    candidate_probability: Optional[float] = None

    non_candidate_probability: Optional[float] = None


class AnalysisResponse(BaseModel):

    filename: str

    data: dict

    light_curve: List[LightCurvePoint]

    detected_transits: List[TransitPoint]

    candidate_analysis: CandidateAnalysis

    ml_prediction: MLPrediction

    status: str