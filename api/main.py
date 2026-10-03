"""
AI Urban Resource Optimization — FastAPI Backend
Serves predictions from trained .pkl model artifacts.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import traffic, energy, weather, decision, water, waste, simulate

app = FastAPI(
    title="AI Urban Resource Optimization API",
    description="City-scale resource optimization powered by ML models",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(traffic.router, prefix="/traffic", tags=["Traffic"])
app.include_router(energy.router, prefix="/energy", tags=["Energy"])
app.include_router(weather.router, prefix="/weather", tags=["Weather"])
app.include_router(decision.router, prefix="/decision", tags=["Decision"])
app.include_router(water.router, prefix="/water", tags=["Water"])
app.include_router(waste.router, prefix="/waste", tags=["Waste"])
app.include_router(simulate.router, prefix="/simulate", tags=["Simulator"])


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "system": "AI Urban Resource Optimization",
        "version": "1.0.0",
        "endpoints": [
            "/traffic/predict",
            "/energy/predict",
            "/weather/predict",
            "/decision/recommend",
            "/water/status",
            "/waste/status",
            "/simulate/whatif",
        ],
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
