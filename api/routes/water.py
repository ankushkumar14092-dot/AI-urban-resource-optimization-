from fastapi import APIRouter, HTTPException
from api.services.water_service import get_all_zones, get_zone

router = APIRouter()


@router.get("/status")
def water_status():
    return {"status": "success", "zones": get_all_zones()}


@router.get("/status/{zone_id}")
def water_zone(zone_id: str):
    zone = get_zone(zone_id)
    if zone is None:
        raise HTTPException(status_code=404, detail=f"Zone {zone_id} not found")
    return {"status": "success", **zone}
