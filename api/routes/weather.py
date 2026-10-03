from fastapi import APIRouter, HTTPException, Query
from api.services.weather_service import get_live_weather

router = APIRouter()


@router.get("/live")
def weather_live(
    lat: float = Query(default=44.98, description="Latitude"),
    lon: float = Query(default=-93.27, description="Longitude"),
):
    try:
        result = get_live_weather(lat=lat, lon=lon)
        return {"status": "success", **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
