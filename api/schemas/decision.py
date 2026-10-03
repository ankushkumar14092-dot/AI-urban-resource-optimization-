from pydantic import BaseModel, Field


class DecisionRequest(BaseModel):
    segment_id: str = Field(default="A12")
    predicted_volume: int = Field(..., description="Predicted traffic volume")
    road_capacity: int = Field(default=6000)
    predicted_energy_wh: float = Field(..., description="Predicted energy consumption in Wh")
    energy_anomaly: bool = Field(default=False)
    rain_mm: float = Field(default=0.0)
    temperature_c: float = Field(default=20.0)

    model_config = {
        "json_schema_extra": {
            "example": {
                "segment_id": "A12",
                "predicted_volume": 4200,
                "road_capacity": 6000,
                "predicted_energy_wh": 760,
                "energy_anomaly": False,
                "rain_mm": 8.0,
                "temperature_c": 24.7,
            }
        }
    }


class WhatIfRequest(BaseModel):
    signal_green_time_sec: float = Field(default=30.0, ge=10, le=120)
    water_pump_speed_pct: float = Field(default=80.0, ge=0, le=100)
    street_light_intensity_pct: float = Field(default=100.0, ge=0, le=100)
    current_traffic_volume: int = Field(default=4000)
    road_capacity: int = Field(default=6000)
    current_energy_wh: float = Field(default=500.0)
