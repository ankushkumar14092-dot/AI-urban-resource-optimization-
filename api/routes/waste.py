from fastapi import APIRouter
from api.services.waste_service import get_all_bins, get_optimized_route

router = APIRouter()


@router.get("/status")
def waste_status():
    return {"status": "success", "bins": get_all_bins()}


@router.get("/route")
def waste_route():
    return {"status": "success", **get_optimized_route()}
