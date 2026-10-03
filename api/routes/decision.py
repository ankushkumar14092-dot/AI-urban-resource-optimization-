from fastapi import APIRouter, HTTPException
from api.schemas.decision import DecisionRequest
from api.services.decision_service import recommend

router = APIRouter()


@router.post("/recommend")
def decision_recommend(body: DecisionRequest):
    try:
        result = recommend(
            predicted_volume=body.predicted_volume,
            road_capacity=body.road_capacity,
            predicted_energy_wh=body.predicted_energy_wh,
            energy_anomaly=body.energy_anomaly,
            rain_mm=body.rain_mm,
            temperature_c=body.temperature_c,
            segment_id=body.segment_id,
        )
        return {"status": "success", **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
