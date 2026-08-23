from fastapi import FastAPI

from app.api.routes import router

from app.database.database import (
    Base,
    engine
)

from app.database import models

from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(
    bind=engine
)


app = FastAPI(

    title="Drishti - AI Exoplanet Detection API",

    description=(
        "AI-powered backend for detecting "
        "potential exoplanet candidates "
        "from stellar light curves."
    ),

    version="2.0.0"
)


app.include_router(
    router,
    prefix="/api"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://drishti-exoplanet-ai.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():

    return {
        "name": "Drishti",

        "description":
            "AI-powered exoplanet detection system",

        "version": "2.0.0",

        "status": "running"
    }