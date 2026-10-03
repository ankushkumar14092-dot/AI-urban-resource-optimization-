import { useState, useEffect, useCallback } from 'react'
import { Car, Zap, Cloud, Droplets, Trash2, Activity } from 'lucide-react'

import Header from './components/Header'
import StatCard from './components/StatCard'
import AlertPanel from './components/AlertPanel'
import DecisionPanel from './components/DecisionPanel'
import CityMap from './components/CityMap'
import WaterPanel from './components/WaterPanel'
import WastePanel from './components/WastePanel'
import WhatIfSimulator from './components/WhatIfSimulator'
import TrafficChart from './components/TrafficChart'

import type { Alert } from './components/AlertPanel'
import type { MapPoint } from './components/CityMap'

import {
    fetchTrafficPredict, fetchEnergyPredict, fetchEnergyAnomaly,
    fetchLiveWeather, fetchDecision, fetchWaterStatus, fetchWasteStatus,
} from './api/client'

// ── Helpers ─────────────────────────────────────────────────────────────────
const now = () => new Date().toLocaleTimeString()

function buildAlerts(traffic: any, energy: any, anomaly: any, weather: any): Alert[] {
    const alerts: Alert[] = []
    if (traffic?.congestion_level === 'CRITICAL') {
        alerts.push({
            id: 'tr-crit', type: 'HIGH', title: 'Critical Traffic', time: now(),
            message: `Corridor A12 at ${Math.round((traffic.congestion_ratio || 0) * 100)}% capacity — activate alternate routes`
        })
    } else if (traffic?.congestion_level === 'HIGH') {
        alerts.push({
            id: 'tr-high', type: 'MODERATE', title: 'High Traffic Load', time: now(),
            message: `Predicted volume: ${traffic.predicted_volume?.toLocaleString()} — extend signal green phase`
        })
    }
    if (anomaly?.anomaly) {
        alerts.push({
            id: 'en-anom', type: 'HIGH', title: 'Energy Anomaly Detected', time: now(),
            message: `Isolation score: ${anomaly.isolation_score} — inspect high-consumption equipment`
        })
    }
    if (weather?.flood_risk === 'HIGH') {
        alerts.push({
            id: 'wx-flood', type: 'HIGH', title: 'Flood Risk HIGH', time: now(),
            message: `${weather.rain_mm}mm rain — activate flood monitoring in low-lying zones`
        })
    } else if (weather?.flood_risk === 'MEDIUM') {
        alerts.push({
            id: 'wx-rain', type: 'MODERATE', title: 'Heavy Rain Advisory', time: now(),
            message: `${weather.rain_mm}mm rain — activate wet-road speed signs`
        })
    }
    if (alerts.length === 0) {
        alerts.push({
            id: 'ok', type: 'OK', title: 'All Systems Normal', time: now(),
            message: 'Traffic, energy, and weather within expected parameters'
        })
    }
    return alerts
}

function buildMapPoints(water: any[], waste: any[]): MapPoint[] {
    const pts: MapPoint[] = [
        {
            id: 'tr-a12', name: 'Corridor A12', lat: 44.983, lon: -93.270,
            type: 'traffic', status: 'WARNING', detail: 'Traffic forecasting active'
        },
        {
            id: 'tr-b07', name: 'Route B07', lat: 44.976, lon: -93.258,
            type: 'traffic', status: 'OK', detail: 'Normal flow'
        },
    ]
    water.forEach(z => {
        pts.push({
            id: z.zone_id, name: z.zone_name, lat: z.lat, lon: z.lon,
            type: 'water', status: z.anomaly ? 'CRITICAL' : 'OK', detail: z.recommendation
        })
    })
    waste.forEach(b => {
        pts.push({
            id: b.bin_id, name: b.bin_name, lat: b.lat, lon: b.lon,
            type: 'waste', status: b.status === 'CRITICAL' ? 'CRITICAL' : b.needs_collection ? 'WARNING' : 'OK',
            detail: `Fill: ${b.fill_level_pct}%`
        })
    })
    return pts
}

// Synthetic traffic history for chart (last 6 predictions)
const SAMPLE_LAGS = [3010, 3080, 3160, 3250, 3300, 3400]
const HOURS = [2, 4, 6, 8, 10, 12]

// ── App ─────────────────────────────────────────────────────────────────────
export default function App() {
    const [trafficData, setTrafficData] = useState<any>(null)
    const [energyData, setEnergyData] = useState<any>(null)
    const [anomalyData, setAnomalyData] = useState<any>(null)
    const [weatherData, setWeatherData] = useState<any>(null)
    const [decisionData, setDecisionData] = useState<any>(null)
    const [waterData, setWaterData] = useState<any[]>([])
    const [wasteData, setWasteData] = useState<any[]>([])
    const [lastUpdated, setLastUpdated] = useState('—')
    const [activeTab, setActiveTab] = useState<'overview' | 'water' | 'waste' | 'simulator'>('overview')

    const loadAll = useCallback(async () => {
        const h = new Date().getHours()
        const dow = new Date().getDay()
        const mo = new Date().getMonth() + 1
        const weekend = dow === 0 || dow === 6 ? 1 : 0

        const trafficInput = {
            segment_id: 'A12', hour: h, day_of_week: dow, month: mo, weekend,
            holiday_enc: 0, temp: 297.0, rain_1h: 0, snow_1h: 0, clouds_all: 20,
            weather_main_enc: 3, weather_desc_enc: 7,
            traffic_lag_1: 3400, traffic_lag_2: 3300, traffic_lag_3: 3250,
            traffic_lag_6: 3160, traffic_lag_12: 3080, traffic_lag_24: 3010,
            rolling_mean_3: 3317, rolling_mean_6: 3245, rolling_mean_12: 3120, rolling_std_6: 90,
            road_capacity: 6000,
        }

        const energyInput = {
            hour: h, day_of_week: dow, month: mo, weekend,
            T1: 21.4, RH_1: 54, T2: 20.9, RH_2: 56, T_out: 18.1, RH_out: 67,
            Press_mm_hg: 1013, Windspeed: 5.2, Visibility: 55, Tdewpoint: 11.9,
            app_lag_1: 420, app_lag_2: 410, app_lag_3: 405, app_lag_6: 398,
            app_roll_mean_6: 412, app_roll_std_6: 14,
        }

        const anomalyInput = {
            Global_active_power: 1.8, roll_mean_24: 1.6, roll_std_24: 0.3,
            hour: h, day_of_week: dow,
        }

        const [tr, en, an, wx, wa, ws] = await Promise.allSettled([
            fetchTrafficPredict(trafficInput),
            fetchEnergyPredict(energyInput),
            fetchEnergyAnomaly(anomalyInput),
            fetchLiveWeather(),
            fetchWaterStatus(),
            fetchWasteStatus(),
        ])

        const trData = tr.status === 'fulfilled' ? tr.value : null
        const enData = en.status === 'fulfilled' ? en.value : null
        const anData = an.status === 'fulfilled' ? an.value : null
        const wxData = wx.status === 'fulfilled' ? wx.value : null
        const waData = wa.status === 'fulfilled' ? wa.value?.zones ?? [] : []
        const wsData = ws.status === 'fulfilled' ? ws.value?.bins ?? [] : []

        setTrafficData(trData)
        setEnergyData(enData)
        setAnomalyData(anData)
        setWeatherData(wxData)
        setWaterData(waData)
        setWasteData(wsData)

        // Decision engine call
        if (trData && enData) {
            fetchDecision({
                segment_id: 'A12',
                predicted_volume: trData.predicted_volume,
                road_capacity: 6000,
                predicted_energy_wh: enData.predicted_energy_wh,
                energy_anomaly: anData?.anomaly ?? false,
                rain_mm: wxData?.rain_mm ?? 0,
                temperature_c: wxData?.temperature_c ?? 20,
            }).then(setDecisionData).catch(console.error)
        }

        setLastUpdated(new Date().toLocaleTimeString())
    }, [])

    useEffect(() => {
        loadAll()
        const timer = setInterval(loadAll, 30000)
        return () => clearInterval(timer)
    }, [loadAll])

    // Build chart data from lag history
    const chartData = SAMPLE_LAGS.map((lag, i) => ({
        time: `${HOURS[i]}:00`, predicted: lag, capacity: 6000,
    }))
    if (trafficData?.predicted_volume) {
        chartData.push({ time: 'Now+1h', predicted: trafficData.predicted_volume, capacity: 6000 })
    }

    const alerts = buildAlerts(trafficData, energyData, anomalyData, weatherData)
    const mapPoints = buildMapPoints(waterData, wasteData)

    const congestionBadge: string = trafficData?.congestion_level ?? '—'
    const congestionColorMap: Record<string, string> = { CRITICAL: 'red', HIGH: 'orange', MODERATE: 'yellow', LOW: 'green' }
    const congestionColor = congestionColorMap[congestionBadge] ?? 'blue'

    const floodBadge: string = weatherData?.flood_risk ?? '—'
    const floodColorMap: Record<string, string> = { HIGH: 'red', MEDIUM: 'orange', LOW: 'green' }
    const floodColor = floodColorMap[floodBadge] ?? 'blue'

    const TABS = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'water', label: '💧 Water' },
        { id: 'waste', label: '🗑️ Waste' },
        { id: 'simulator', label: '🧪 Simulator' },
    ] as const

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <Header lastUpdated={lastUpdated} />

            {/* Tab nav */}
            <div style={{
                display: 'flex', gap: '0.25rem', padding: '0.75rem 1.5rem',
                borderBottom: '1px solid #1e2d45', background: '#0a0e1a',
            }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
                        style={{
                            padding: '0.4rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.8rem',
                            border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                            background: activeTab === t.id ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : '#111827',
                            color: activeTab === t.id ? 'white' : '#64748b',
                        }}
                    >{t.label}</button>
                ))}
            </div>

            <div style={{ padding: '1.25rem 1.5rem', maxWidth: 1400, margin: '0 auto' }}>

                {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
                {activeTab === 'overview' && (
                    <>
                        {/* KPI row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                            <StatCard
                                label="Traffic Volume" icon={<Car size={22} />} color="#3b82f6"
                                value={trafficData ? `${trafficData.predicted_volume?.toLocaleString()}` : '—'}
                                sub="Predicted next hour"
                                badge={congestionBadge} badgeColor={congestionColor}
                            />
                            <StatCard
                                label="Energy Usage" icon={<Zap size={22} />} color="#f59e0b"
                                value={energyData ? `${energyData.predicted_energy_wh} Wh` : '—'}
                                sub="Predicted consumption"
                                badge={anomalyData?.anomaly ? 'Anomaly' : 'Normal'}
                                badgeColor={anomalyData?.anomaly ? 'red' : 'green'}
                            />
                            <StatCard
                                label="Temperature" icon={<Cloud size={22} />} color="#6366f1"
                                value={weatherData ? `${weatherData.temperature_c}°C` : '—'}
                                sub={weatherData ? `Rain: ${weatherData.rain_mm}mm | Wind: ${weatherData.wind_ms}m/s` : ''}
                                badge={floodBadge + ' RISK'} badgeColor={floodColor}
                            />
                            <StatCard
                                label="Active Alerts" icon={<Activity size={22} />} color="#ef4444"
                                value={`${alerts.filter(a => a.type === 'HIGH').length}`}
                                sub={`${alerts.length} total events`}
                                badge={alerts.some(a => a.type === 'HIGH') ? 'Action Required' : 'All Clear'}
                                badgeColor={alerts.some(a => a.type === 'HIGH') ? 'red' : 'green'}
                            />
                        </div>

                        {/* Chart + Alert row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                            <TrafficChart data={chartData} />
                            <AlertPanel alerts={alerts} />
                        </div>

                        {/* Map + Decision row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1rem' }}>
                            <CityMap points={mapPoints} />
                            <DecisionPanel decision={decisionData} />
                        </div>
                    </>
                )}

                {/* ── WATER TAB ───────────────────────────────────────────────── */}
                {activeTab === 'water' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <WaterPanel zones={waterData} />
                        <div>
                            <CityMap points={mapPoints.filter(p => p.type === 'water')} />
                            <div style={{ marginTop: '1rem' }}>
                                <div className="card">
                                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.75rem' }}>
                                        💧 WATER SUMMARY
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                                        <div style={{ background: '#0a0e1a', borderRadius: 8, padding: '0.6rem' }}>
                                            <p style={{ color: '#64748b', marginBottom: 4 }}>Anomalous Zones</p>
                                            <p style={{ fontWeight: 700, fontSize: '1.4rem', color: '#ef4444' }}>
                                                {waterData.filter((z: any) => z.anomaly).length}
                                            </p>
                                        </div>
                                        <div style={{ background: '#0a0e1a', borderRadius: 8, padding: '0.6rem' }}>
                                            <p style={{ color: '#64748b', marginBottom: 4 }}>Active Zones</p>
                                            <p style={{ fontWeight: 700, fontSize: '1.4rem', color: '#10b981' }}>
                                                {waterData.filter((z: any) => z.pump_status === 'ON').length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── WASTE TAB ───────────────────────────────────────────────── */}
                {activeTab === 'waste' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <WastePanel bins={wasteData} />
                        <div>
                            <CityMap points={mapPoints.filter(p => p.type === 'waste')} />
                            <div style={{ marginTop: '1rem' }}>
                                <div className="card">
                                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.75rem' }}>
                                        🗑️ COLLECTION SUMMARY
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                                        <div style={{ background: '#0a0e1a', borderRadius: 8, padding: '0.6rem' }}>
                                            <p style={{ color: '#64748b', marginBottom: 4 }}>Need Collection</p>
                                            <p style={{ fontWeight: 700, fontSize: '1.4rem', color: '#f97316' }}>
                                                {wasteData.filter((b: any) => b.needs_collection).length}
                                            </p>
                                        </div>
                                        <div style={{ background: '#0a0e1a', borderRadius: 8, padding: '0.6rem' }}>
                                            <p style={{ color: '#64748b', marginBottom: 4 }}>Critical Bins</p>
                                            <p style={{ fontWeight: 700, fontSize: '1.4rem', color: '#ef4444' }}>
                                                {wasteData.filter((b: any) => b.status === 'CRITICAL').length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── SIMULATOR TAB ───────────────────────────────────────────── */}
                {activeTab === 'simulator' && (
                    <div style={{ maxWidth: 900, margin: '0 auto' }}>
                        <WhatIfSimulator />
                        <div className="card" style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.7 }}>
                            <p style={{ fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>ℹ️ About the Simulator</p>
                            <p>Adjust the operational parameters above and click <strong>Run Simulation</strong> to see estimated impact on city metrics.
                                The model computes directional effect changes (↑ increase / ↓ decrease) based on current traffic load and
                                system baselines. This is designed to help operators make quick "what-if" decisions before deploying changes.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
