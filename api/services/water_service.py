"""
Simulated IoT water sensor service.
Generates realistic zone-level water data with anomaly detection.
"""

import random
import math
from datetime import datetime, timezone


ZONES = [
    {"id": "W-A1", "name": "Sector Alpha", "lat": 44.985, "lon": -93.270, "capacity_liters": 50000},
    {"id": "W-B2", "name": "Sector Beta",  "lat": 44.975, "lon": -93.255, "capacity_liters": 40000},
    {"id": "W-C3", "name": "Sector Gamma", "lat": 44.970, "lon": -93.280, "capacity_liters": 45000},
    {"id": "W-D4", "name": "Sector Delta", "lat": 44.965, "lon": -93.265, "capacity_liters": 35000},
]


def _simulate_zone(zone: dict, seed_offset: int = 0) -> dict:
    """Deterministic-ish simulation driven by current hour + small noise."""
    hour = datetime.now().hour
    base_flow = 55 + 30 * math.sin((hour - 6) * math.pi / 12)  # peak around noon

    random.seed(int(datetime.now().timestamp() / 60) + seed_offset)
    noise = random.uniform(-8, 8)
    flow_rate = max(0, round(base_flow + noise, 1))

    # Pressure inversely correlated with flow (simplified)
    pressure = round(2.8 - (flow_rate / 200), 2)
    tank_level = random.randint(45, 92)
    pump_on = flow_rate > 30
    valve_open = tank_level > 20

    # Anomaly: low pressure + high flow = possible leak
    leak_probability = 0.0
    anomaly = False
    anomaly_type = None

    if pressure < 1.2 and flow_rate > 80:
        leak_probability = min(0.95, (flow_rate - 80) / 50 + (1.2 - pressure) / 1.2)
        anomaly = leak_probability > 0.5
        anomaly_type = "POSSIBLE_LEAK" if anomaly else None

    if tank_level < 20:
        anomaly = True
        anomaly_type = "LOW_TANK_LEVEL"

    return {
        "zone_id": zone["id"],
        "zone_name": zone["name"],
        "lat": zone["lat"],
        "lon": zone["lon"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "flow_rate_lpm": flow_rate,
        "pressure_bar": pressure,
        "tank_level_pct": tank_level,
        "pump_status": "ON" if pump_on else "OFF",
        "valve_status": "OPEN" if valve_open else "CLOSED",
        "anomaly": anomaly,
        "anomaly_type": anomaly_type,
        "leak_probability": round(leak_probability, 3),
        "recommendation": (
            f"🚨 Inspect {zone['name']} for {anomaly_type}" if anomaly
            else "✅ Operating normally"
        ),
    }


def get_all_zones() -> list:
    return [_simulate_zone(z, i * 37) for i, z in enumerate(ZONES)]


def get_zone(zone_id: str) -> dict | None:
    for i, z in enumerate(ZONES):
        if z["id"] == zone_id:
            return _simulate_zone(z, i * 37)
    return None
