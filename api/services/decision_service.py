"""
Decision engine — mirrors the logic from notebook 05_decision_engine.ipynb
and adds urgency scoring + impact metrics.
"""

from datetime import datetime, timezone


def recommend(
    predicted_volume: int,
    road_capacity: int,
    predicted_energy_wh: float,
    energy_anomaly: bool,
    rain_mm: float = 0.0,
    temperature_c: float = 20.0,
    segment_id: str = "A12",
) -> dict:

    actions = []
    reasons = []
    urgency = "NORMAL"

    congestion_ratio = predicted_volume / road_capacity if road_capacity > 0 else 0

    # --- Traffic rules ---
    if congestion_ratio >= 0.85:
        actions.append("Activate alternate route guidance")
        actions.append("Deploy dynamic message signs on main corridor")
        reasons.append(f"Traffic at {round(congestion_ratio * 100)}% of road capacity — critical threshold")
        urgency = "HIGH"
    elif congestion_ratio >= 0.65:
        actions.append("Extend green signal phase on main corridor by 20 sec")
        reasons.append(f"Traffic at {round(congestion_ratio * 100)}% of road capacity — high load")

    # --- Energy rules ---
    if energy_anomaly:
        actions.append("Send energy inspection alert to Zone operations team")
        reasons.append("Abnormal energy consumption detected by anomaly model")
        urgency = "HIGH"

    normal_baseline_wh = 300.0
    if predicted_energy_wh > normal_baseline_wh * 1.5:
        actions.append(f"Flag high energy forecast ({round(predicted_energy_wh)} Wh) for demand response")
        reasons.append("Predicted energy exceeds 1.5× normal baseline")

    # --- Weather rules ---
    if rain_mm > 20:
        actions.append("Activate flood monitoring for low-lying zones")
        actions.append("Reduce speed limits on wet roads to 60 km/h")
        reasons.append(f"Heavy rain: {rain_mm} mm — flood risk HIGH")
        urgency = "HIGH"
    elif rain_mm > 5:
        actions.append("Activate wet-road speed advisory signs")
        reasons.append(f"Rain detected: {rain_mm} mm")

    if temperature_c < 0:
        actions.append("Deploy road salting crews on main corridors")
        reasons.append(f"Sub-zero temperature: {temperature_c}°C — ice risk")

    if not actions:
        actions.append("All systems nominal — no intervention required")
        reasons.append("Traffic, energy, and weather within expected ranges")

    # --- Confidence/priority scoring ---
    traffic_priority = min(congestion_ratio, 1.0)
    energy_priority = 0.85 if energy_anomaly else min(predicted_energy_wh / (normal_baseline_wh * 2), 1.0)
    weather_risk = min(rain_mm / 25.0, 1.0)

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "segment_id": segment_id,
        "recommended_actions": actions,
        "reasons": reasons,
        "urgency": urgency,
        "scores": {
            "traffic_priority": round(traffic_priority, 2),
            "energy_priority": round(energy_priority, 2),
            "weather_risk": round(weather_risk, 2),
        },
        "model": "decision_engine_v1",
    }
