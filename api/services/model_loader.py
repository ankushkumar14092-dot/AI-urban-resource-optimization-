"""
Centralized model loader — loads all .pkl artifacts once at startup.
"""

import os
import joblib
from pathlib import Path

MODELS_DIR = Path(__file__).resolve().parents[2] / "AI_Urban_Resource_Optimization" / "models"


def _load(name: str):
    path = MODELS_DIR / name
    if not path.exists():
        raise FileNotFoundError(f"Model artifact not found: {path}")
    return joblib.load(path)


class ModelStore:
    """Lazy singleton — loads models on first access."""

    _traffic_model = None
    _traffic_features = None
    _traffic_encoders = None

    _energy_model = None
    _energy_features = None

    _anomaly_model = None

    _weather_model = None
    _weather_features = None

    @classmethod
    def traffic_model(cls):
        if cls._traffic_model is None:
            cls._traffic_model = _load("traffic_forecasting_model.pkl")
        return cls._traffic_model

    @classmethod
    def traffic_features(cls):
        if cls._traffic_features is None:
            cls._traffic_features = _load("traffic_features.pkl")
        return cls._traffic_features

    @classmethod
    def traffic_encoders(cls):
        if cls._traffic_encoders is None:
            cls._traffic_encoders = _load("traffic_encoders.pkl")
        return cls._traffic_encoders

    @classmethod
    def energy_model(cls):
        if cls._energy_model is None:
            cls._energy_model = _load("energy_forecasting_model.pkl")
        return cls._energy_model

    @classmethod
    def energy_features(cls):
        if cls._energy_features is None:
            cls._energy_features = _load("energy_features.pkl")
        return cls._energy_features

    @classmethod
    def anomaly_model(cls):
        if cls._anomaly_model is None:
            cls._anomaly_model = _load("anomaly_detector.pkl")
        return cls._anomaly_model

    @classmethod
    def weather_model(cls):
        if cls._weather_model is None:
            cls._weather_model = _load("weather_forecasting_model.pkl")
        return cls._weather_model

    @classmethod
    def weather_features(cls):
        if cls._weather_features is None:
            cls._weather_features = _load("weather_features.pkl")
        return cls._weather_features
