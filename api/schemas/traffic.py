from pydantic import BaseModel, Field


class TrafficPredictRequest(BaseModel):
    segment_id: str = Field(default="A12", description="Road segment identifier")
    hour: int = Field(..., ge=0, le=23)
    day_of_week: int = Field(..., ge=0, le=6)
    month: int = Field(..., ge=1, le=12)
    weekend: int = Field(..., ge=0, le=1)
    holiday_enc: int = Field(default=0)
    temp: float = Field(..., description="Temperature in Kelvin")
    rain_1h: float = Field(default=0.0)
    snow_1h: float = Field(default=0.0)
    clouds_all: float = Field(default=0.0, ge=0, le=100)
    weather_main_enc: int = Field(default=3)
    weather_desc_enc: int = Field(default=7)
    traffic_lag_1: float = Field(default=3400)
    traffic_lag_2: float = Field(default=3300)
    traffic_lag_3: float = Field(default=3250)
    traffic_lag_6: float = Field(default=3160)
    traffic_lag_12: float = Field(default=3080)
    traffic_lag_24: float = Field(default=3010)
    rolling_mean_3: float = Field(default=3320)
    rolling_mean_6: float = Field(default=3245)
    rolling_mean_12: float = Field(default=3120)
    rolling_std_6: float = Field(default=90)
    road_capacity: int = Field(default=6000)

    model_config = {
        "json_schema_extra": {
            "example": {
                "segment_id": "A12",
                "hour": 8, "day_of_week": 1, "month": 10,
                "weekend": 0, "holiday_enc": 0, "temp": 298.15,
                "rain_1h": 1.5, "snow_1h": 0, "clouds_all": 30,
                "weather_main_enc": 3, "weather_desc_enc": 7,
                "traffic_lag_1": 3400, "traffic_lag_2": 3300,
                "traffic_lag_3": 3250, "traffic_lag_6": 3160,
                "traffic_lag_12": 3080, "traffic_lag_24": 3010,
                "rolling_mean_3": 3320, "rolling_mean_6": 3245,
                "rolling_mean_12": 3120, "rolling_std_6": 90,
                "road_capacity": 6000,
            }
        }
    }
