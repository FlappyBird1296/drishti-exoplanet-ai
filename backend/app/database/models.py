from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Text
)

from app.database.database import Base



class Analysis(Base):

    __tablename__ = "analyses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    filename = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    feature_data = Column(
        Text,
        nullable=True
    )

    # Dataset information

    original_points = Column(
        Integer
    )

    cleaned_points = Column(
        Integer
    )

    # BLS

    period_days = Column(
        Float,
        nullable=True
    )

    transit_duration_days = Column(
        Float,
        nullable=True
    )

    transit_depth = Column(
        Float,
        nullable=True
    )

    bls_power = Column(
        Float,
        nullable=True
    )

    bls_snr = Column(
        Float,
        nullable=True
    )

    number_of_transits = Column(
        Integer,
        nullable=True
    )

    odd_even_difference = Column(
        Float,
        nullable=True
    )

    periodicity_score = Column(
        Float,
        nullable=True
    )

    # Candidate scoring

    candidate_score = Column(
        Float,
        nullable=True
    )

    # ML

    prediction = Column(
        String,
        nullable=True
    )

    confidence = Column(
        Float,
        nullable=True
    )

    candidate_probability = Column(
        Float,
        nullable=True
    )

    non_candidate_probability = Column(
        Float,
        nullable=True
    )

    # Store transit information as JSON text

    transit_data = Column(
        Text,
        nullable=True
    )

   