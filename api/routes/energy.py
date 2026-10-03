from fastapi import APIRouter, HTTPException
from api.schemas.energy import EnergyPredictRequest, AnomalyRequest
from api.services.energy_service import predict_energy, detect_anomaly

router = APIRouter()


@router.post("/predict")
def energy_predict(body: EnergyPredictRequest):
    try:
        result = predict_energy(body.model_dump())
        return {"status": "success", **result}
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=f"Model not loaded: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/anomaly")
def energy_anomaly(body: AnomalyRequest):
    try:
        result = detect_anomaly(body.model_dump())
        return {"status": "success", **result}
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=f"Model not loaded: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
