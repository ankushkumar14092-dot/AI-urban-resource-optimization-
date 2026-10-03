from fastapi import APIRouter, HTTPException
from api.schemas.traffic import TrafficPredictRequest
from api.services.traffic_service import predict_traffic

router = APIRouter()


@router.post("/predict")
def traffic_predict(body: TrafficPredictRequest):
    try:
        result = predict_traffic(body.model_dump())
        return {"status": "success", **result}
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=f"Model not loaded: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
