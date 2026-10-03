"""
What-If Simulator — lets users tweak operational parameters
and see estimated impact on city metrics.
"""


def run_whatif(
    signal_green_time_sec: float = 30.0,
    water_pump_speed_pct: float = 80.0,
    street_light_intensity_pct: float = 100.0,
    current_traffic_volume: int = 4000,
    road_capacity: int = 6000,
    current_energy_wh: float = 500.0,
) -> dict:
    """
    Simplified impact model. Not a physics simulation — meant to show
    directional "what-if" effects to help operators make decisions.
    """

    # --- Traffic delay impact ---
    # Extending green time by X sec reduces delay proportionally (up to a cap)
    baseline_green = 30.0
    green_delta = signal_green_time_sec - baseline_green
    congestion = current_traffic_volume / road_capacity
    traffic_delay_change_pct = round(-green_delta * 0.7 * congestion, 1)
    fuel_change_pct = round(traffic_delay_change_pct * 0.65, 1)  # correlated with idle time

    # --- Water energy impact ---
    baseline_pump = 80.0
    pump_delta_pct = water_pump_speed_pct - baseline_pump
    pump_energy_change_pct = round(pump_delta_pct * 0.9, 1)  # near-linear for pumps

    # --- Lighting energy impact ---
    baseline_light = 100.0
    light_delta_pct = street_light_intensity_pct - baseline_light
    light_energy_change_pct = round(light_delta_pct * 1.0, 1)

    total_energy_change_pct = round(
        (pump_energy_change_pct * 0.4 + light_energy_change_pct * 0.6), 1
    )
    co2_change_pct = round(total_energy_change_pct * 0.85, 1)

    def _fmt(val: float) -> str:
        arrow = "↓" if val < 0 else "↑"
        return f"{arrow} {abs(val)}%"

    return {
        "inputs": {
            "signal_green_time_sec": signal_green_time_sec,
            "water_pump_speed_pct": water_pump_speed_pct,
            "street_light_intensity_pct": street_light_intensity_pct,
            "current_traffic_volume": current_traffic_volume,
            "road_capacity": road_capacity,
            "current_energy_wh": current_energy_wh,
        },
        "expected_impact": {
            "traffic_delay_change_pct": traffic_delay_change_pct,
            "fuel_consumption_change_pct": fuel_change_pct,
            "energy_usage_change_pct": total_energy_change_pct,
            "co2_emissions_change_pct": co2_change_pct,
        },
        "formatted": {
            "Traffic Delay":    _fmt(traffic_delay_change_pct),
            "Fuel Consumption": _fmt(fuel_change_pct),
            "Energy Usage":     _fmt(total_energy_change_pct),
            "CO₂ Emissions":    _fmt(co2_change_pct),
        },
        "recommendation": (
            "Optimal settings — positive impact on all metrics"
            if all(v <= 0 for v in [traffic_delay_change_pct, total_energy_change_pct, co2_change_pct])
            else "Adjust parameters to improve city efficiency"
        ),
    }
