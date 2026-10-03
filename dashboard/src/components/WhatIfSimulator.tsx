import { useState } from 'react'
import { fetchWhatIf } from '../api/client'
import { Sliders } from 'lucide-react'

interface Impact {
    traffic_delay_change_pct: number
    fuel_consumption_change_pct: number
    energy_usage_change_pct: number
    co2_emissions_change_pct: number
}

interface SimResult {
    formatted: Record<string, string>
    expected_impact: Impact
    recommendation: string
}

const SliderRow = ({
    label, value, min, max, unit, onChange,
}: {
    label: string; value: number; min: number; max: number; unit: string
    onChange: (v: number) => void
}) => (
    <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
            <span style={{ color: '#94a3b8' }}>{label}</span>
            <span style={{ fontWeight: 700, color: '#3b82f6' }}>{value}{unit}</span>
        </div>
        <input
            type="range" min={min} max={max} value={value} step={1}
            onChange={e => onChange(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
        />
    </div>
)

export default function WhatIfSimulator() {
    const [params, setParams] = useState({
        signal_green_time_sec: 30,
        water_pump_speed_pct: 80,
        street_light_intensity_pct: 100,
        current_traffic_volume: 4000,
        road_capacity: 6000,
        current_energy_wh: 500,
    })
    const [result, setResult] = useState<SimResult | null>(null)
    const [loading, setLoading] = useState(false)

    const run = async () => {
        setLoading(true)
        try {
            const data = await fetchWhatIf(params)
            setResult(data)
        } finally {
            setLoading(false)
        }
    }

    const ImpactRow = ({ label, value }: { label: string; value: string }) => {
        const down = value.startsWith('↓')
        const color = down ? '#10b981' : '#ef4444'
        return (
            <div style={{
                display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.6rem',
                background: down ? 'rgba(16,185,129,.06)' : 'rgba(239,68,68,.06)',
                borderRadius: 6, marginBottom: 4, fontSize: '0.78rem',
            }}>
                <span style={{ color: '#94a3b8' }}>{label}</span>
                <span style={{ fontWeight: 800, color }}>{value}</span>
            </div>
        )
    }

    return (
        <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Sliders size={16} color="#6366f1" />
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>AI SCENARIO SIMULATOR</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                    <SliderRow label="Signal Green Time" value={params.signal_green_time_sec} min={10} max={120} unit="s"
                        onChange={v => setParams(p => ({ ...p, signal_green_time_sec: v }))} />
                    <SliderRow label="Water Pump Speed" value={params.water_pump_speed_pct} min={0} max={100} unit="%"
                        onChange={v => setParams(p => ({ ...p, water_pump_speed_pct: v }))} />
                    <SliderRow label="Street Light Intensity" value={params.street_light_intensity_pct} min={0} max={100} unit="%"
                        onChange={v => setParams(p => ({ ...p, street_light_intensity_pct: v }))} />
                    <SliderRow label="Current Traffic Volume" value={params.current_traffic_volume} min={500} max={6000} unit=""
                        onChange={v => setParams(p => ({ ...p, current_traffic_volume: v }))} />

                    <button
                        onClick={run}
                        disabled={loading}
                        style={{
                            width: '100%', padding: '0.6rem', marginTop: '0.5rem',
                            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                            color: 'white', fontWeight: 700, fontSize: '0.85rem',
                            border: 'none', borderRadius: 8, cursor: 'pointer',
                            opacity: loading ? 0.6 : 1,
                        }}
                    >
                        {loading ? 'Simulating...' : '▶ Run Simulation'}
                    </button>
                </div>

                <div>
                    {result ? (
                        <>
                            <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 600 }}>EXPECTED IMPACT</p>
                            {Object.entries(result.formatted).map(([k, v]) => (
                                <ImpactRow key={k} label={k} value={v as string} />
                            ))}
                            <div style={{
                                marginTop: '0.75rem', padding: '0.6rem', borderRadius: 8,
                                background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.3)',
                                fontSize: '0.75rem', color: '#a5b4fc',
                            }}>
                                💡 {result.recommendation}
                            </div>
                        </>
                    ) : (
                        <div style={{
                            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#64748b', fontSize: '0.8rem', textAlign: 'center', lineHeight: 1.6,
                        }}>
                            Adjust parameters and run<br />the simulation to see<br />expected impact
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
