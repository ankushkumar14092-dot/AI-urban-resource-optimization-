"""
Weather forecasting service — local model + optional Open-Meteo live feed.
"""

import httpx
import pandas as pd
from api.services.model_loader import ModelStore

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def predict_weather(input_data: dict) -> dict:
    model = ModelStore.weather_model()
    features = ModelStore.weather_features()

    row = pd.DataFrame([input_data])[features]
    predicted_k = float(model.predict(row)[0])
    predicted_c = round(predicted_k - 273.15, 1)

    return {
        "predicted_temperature_k": round(predicted_k, 2),
        "predicted_temperature_c": predicted_c,
        "model": "weather_forecasting_model",
    }


def get_live_weather(lat: float = 44.98, lon: float = -93.27) -> dict:
    """
    Fetch current weather from Open-Meteo (free, no API key needed).
    Default coords: Minneapolis (where Metro Interstate dataset is from).
    """
    try:
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,precipitation,windspeed_10m,cloudcover,weathercode",
            "hourly": "temperature_2m",
            "forecast_days": 1,
            "timezone": "auto",
        }
        response = httpx.get(OPEN_METEO_URL, params=params, timeout=5.0)
        response.raise_for_status()
        data = response.json()
        current = data.get("current", {})

        temp_c = current.get("temperature_2m", 0)
        rain_mm = current.get("precipitation", 0)
        wind_ms = current.get("windspeed_10m", 0)
        clouds = current.get("cloudcover", 0)
        code = current.get("weathercode", 0)

        # Simple flood risk logic
        if rain_mm > 20:
            flood_risk = "HIGH"
        elif rain_mm > 8:
            flood_risk = "MEDIUM"
        else:
            flood_risk = "LOW"

        return {
            "temperature_c": temp_c,
            "temperature_k": round(temp_c + 273.15, 2),
            "rain_mm": rain_mm,
            "wind_ms": wind_ms,
            "cloudcover_pct": clouds,
            "weather_code": code,
            "flood_risk": flood_risk,
            "source": "open-meteo",
        }
    except Exception as exc:
        return {
            "temperature_c": 22.0,
            "temperature_k": 295.15,
            "rain_mm": 0,
            "wind_ms": 3.0,
            "cloudcover_pct": 20,
            "weather_code": 0,
            "flood_risk": "LOW",
            "source": "fallback",
            "error": str(exc),
        }
