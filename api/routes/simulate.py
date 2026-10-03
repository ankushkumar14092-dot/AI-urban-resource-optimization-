from fastapi import APIRouter, HTTPException
from api.schemas.decision import WhatIfRequest
from api.services.simulate_service import run_whatif

router = APIRouter()


@router.post("/whatif")
def what_if_simulate(body: WhatIfRequest):
    try:
        result = run_whatif(**body.model_dump())
        return {"status": "success", **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
