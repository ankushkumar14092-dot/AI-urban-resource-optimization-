"""
Simulated waste bin IoT service.
Predicts collection time and recommends pickup routes.
"""

import random
import math
from datetime import datetime, timezone, timedelta


BINS = [
    {"id": "BIN-A12", "name": "Market Street",    "lat": 44.983, "lon": -93.273, "capacity_l": 240},
    {"id": "BIN-B07", "name": "Park Avenue",       "lat": 44.978, "lon": -93.260, "capacity_l": 120},
    {"id": "BIN-C03", "name": "Central Station",   "lat": 44.972, "lon": -93.282, "capacity_l": 360},
    {"id": "BIN-D15", "name": "University Gate",   "lat": 44.968, "lon": -93.268, "capacity_l": 240},
    {"id": "BIN-E22", "name": "Industrial Zone",   "lat": 44.963, "lon": -93.275, "capacity_l": 480},
    {"id": "BIN-F09", "name": "Residential North", "lat": 44.990, "lon": -93.262, "capacity_l": 120},
]

FILL_RATE_LPH = {240: 4.2, 120: 3.1, 360: 6.5, 480: 8.0}  # liters per hour by capacity


def _simulate_bin(bin_cfg: dict, seed_offset: int = 0) -> dict:
    random.seed(int(datetime.now().timestamp() / 300) + seed_offset)
    fill_level = random.randint(20, 95)

    capacity = bin_cfg["capacity_l"]
    fill_rate = FILL_RATE_LPH.get(capacity, 4.0)
    remaining_capacity = capacity * (1 - fill_level / 100)
    hours_to_full = remaining_capacity / fill_rate if fill_rate > 0 else 999

    full_by = datetime.now(timezone.utc) + timedelta(hours=hours_to_full)

    if fill_level >= 85:
        status = "CRITICAL"
        recommendation = f"Collect immediately — {fill_level}% full"
    elif fill_level >= 65:
        status = "HIGH"
        recommendation = f"Schedule collection before {full_by.strftime('%H:%M')} today"
    elif fill_level >= 40:
        status = "MODERATE"
        recommendation = "Include in next scheduled route"
    else:
        status = "OK"
        recommendation = "No action needed"

    return {
        "bin_id": bin_cfg["id"],
        "bin_name": bin_cfg["name"],
        "lat": bin_cfg["lat"],
        "lon": bin_cfg["lon"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "fill_level_pct": fill_level,
        "capacity_liters": capacity,
        "fill_rate_lph": fill_rate,
        "hours_to_full": round(hours_to_full, 1),
        "predicted_full_at": full_by.isoformat(),
        "status": status,
        "recommendation": recommendation,
        "needs_collection": fill_level >= 65,
    }


def get_all_bins() -> list:
    return [_simulate_bin(b, i * 53) for i, b in enumerate(BINS)]


def get_optimized_route() -> dict:
    bins = get_all_bins()
    priority_bins = [b for b in bins if b["needs_collection"]]
    priority_bins.sort(key=lambda x: -x["fill_level_pct"])

    total_waste_l = sum(b["capacity_liters"] * b["fill_level_pct"] / 100 for b in priority_bins)

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "priority_bins": priority_bins,
        "total_bins_to_collect": len(priority_bins),
        "estimated_waste_liters": round(total_waste_l),
        "estimated_route_km": round(len(priority_bins) * 2.3, 1),
        "recommended_start_time": "Before 07:00 for minimum traffic impact",
    }
