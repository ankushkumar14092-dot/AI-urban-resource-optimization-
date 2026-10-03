"""
Energy forecasting + anomaly detection service.
"""

import pandas as pd
from api.services.model_loader import ModelStore


def predict_energy(input_data: dict) -> dict:
    model = ModelStore.energy_model()
    features = ModelStore.energy_features()

    row = pd.DataFrame([input_data])[features]
    predicted = float(model.predict(row)[0])

    return {
        "predicted_energy_wh": round(predicted, 1),
        "model": "energy_forecasting_model",
    }


def detect_anomaly(input_data: dict) -> dict:
    """
    Anomaly detection using IsolationForest.
    input_data must contain: Global_active_power, roll_mean_24, roll_std_24, hour, day_of_week
    """
    model = ModelStore.anomaly_model()
    features = ["Global_active_power", "roll_mean_24", "roll_std_24", "hour", "day_of_week"]

    row = pd.DataFrame([input_data])[features]
    result = int(model.predict(row)[0])  # 1 = Normal, -1 = Anomaly

    is_anomaly = result == -1
    score = float(model.score_samples(row)[0])  # lower = more anomalous

    return {
        "anomaly": is_anomaly,
        "anomaly_label": "Anomaly" if is_anomaly else "Normal",
        "isolation_score": round(score, 4),
        "model": "anomaly_detector",
    }
