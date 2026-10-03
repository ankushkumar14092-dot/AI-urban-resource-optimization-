from pydantic import BaseModel, Field


class EnergyPredictRequest(BaseModel):
    hour: int = Field(..., ge=0, le=23)
    day_of_week: int = Field(..., ge=0, le=6)
    month: int = Field(..., ge=1, le=12)
    weekend: int = Field(..., ge=0, le=1)
    T1: float = Field(default=21.4)
    RH_1: float = Field(default=54.0)
    T2: float = Field(default=20.9)
    RH_2: float = Field(default=56.0)
    T_out: float = Field(default=18.1)
    RH_out: float = Field(default=67.0)
    Press_mm_hg: float = Field(default=1013.0)
    Windspeed: float = Field(default=5.2)
    Visibility: float = Field(default=55.0)
    Tdewpoint: float = Field(default=11.9)
    app_lag_1: float = Field(default=420.0)
    app_lag_2: float = Field(default=410.0)
    app_lag_3: float = Field(default=405.0)
    app_lag_6: float = Field(default=398.0)
    app_roll_mean_6: float = Field(default=412.0)
    app_roll_std_6: float = Field(default=14.0)

    model_config = {
        "json_schema_extra": {
            "example": {
                "hour": 18, "day_of_week": 4, "month": 10, "weekend": 0,
                "T1": 21.4, "RH_1": 54, "T2": 20.9, "RH_2": 56,
                "T_out": 18.1, "RH_out": 67, "Press_mm_hg": 1013,
                "Windspeed": 5.2, "Visibility": 55, "Tdewpoint": 11.9,
                "app_lag_1": 420, "app_lag_2": 410, "app_lag_3": 405,
                "app_lag_6": 398, "app_roll_mean_6": 412, "app_roll_std_6": 14,
            }
        }
    }


class AnomalyRequest(BaseModel):
    Global_active_power: float = Field(..., description="Hourly avg global active power in kW")
    roll_mean_24: float = Field(..., description="24-hour rolling mean of power")
    roll_std_24: float = Field(..., description="24-hour rolling std of power")
    hour: int = Field(..., ge=0, le=23)
    day_of_week: int = Field(..., ge=0, le=6)
