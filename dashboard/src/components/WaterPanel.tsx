import { Droplets, AlertTriangle, CheckCircle } from 'lucide-react'
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from 'recharts'

interface WaterZone {
    zone_id: string
    zone_name: string
    flow_rate_lpm: number
    pressure_bar: number
    tank_level_pct: number
    pump_status: string
    anomaly: boolean
    anomaly_type: string | null
    recommendation: string
    leak_probability: number
}

function CircularTank({ level, color }: { level: number; color: string }) {
    const r = 18, cx = 22, cy = 22, circ = 2 * Math.PI * r
    const dash = circ * (level / 100)
    return (
        <svg width={44} height={44}>
            <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth={4} stroke="rgba(255,255,255,0.06)" />
            <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth={4} stroke={color}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circ}`}
                strokeDashoffset={circ / 4}
                style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
            <text x={cx} y={cy + 3.5} textAnchor="middle" fill="white" fontSize={8} fontWeight={800} fontFamily="Inter">
                {level}%
            </text>
        </svg>
    )
}

export default function WaterPanel({ zones }: { zones: WaterZone[] }) {
    const anomalyCount = zones.filter(z => z.anomaly).length
    const activeCount = zones.filter(z => z.pump_status === 'ON').length

    // Radar data for zone comparison
    const radarData = zones.map(z => ({
        zone: z.zone_name.replace('Sector ', ''),
        Flow: Math.round((z.flow_rate_lpm / 120) * 100),
        Pressure: Math.round((z.pressure_bar / 3) * 100),
        Tank: z.tank_level_pct,
        Health: z.anomaly ? 20 : 85,
    }))

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Droplets size={15} color="var(--cyan)" />
                    <p className="section-label">Water IoT Monitoring</p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <span style={{
                        padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700,
                        background: anomalyCount > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                        color: anomalyCount > 0 ? '#f87171' : '#34d399',
                        border: `1px solid ${anomalyCount > 0 ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
                    }}>
                        {anomalyCount} anomalies
                    </span>
                    <span style={{
                        padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700,
                        background: 'rgba(6,182,212,0.12)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.2)',
                    }}>
                        {activeCount}/{zones.length} pumps ON
                    </span>
                </div>
            </div>

            {/* Zone cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                {zones.map(z => {
                    const tankColor = z.tank_level_pct < 25 ? '#ef4444' : z.tank_level_pct < 50 ? '#f97316' : '#06b6d4'
                    return (
                        <div key={z.zone_id} style={{
                            background: z.anomaly ? 'rgba(239,68,68,0.05)' : 'rgba(6,182,212,0.04)',
                            border: `1px solid ${z.anomaly ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: 12, padding: '0.85rem',
                            position: 'relative', overflow: 'hidden',
                        }}>
                            {/* Anomaly glow */}
                            {z.anomaly && (
                                <div style={{
                                    position: 'absolute', inset: 0, borderRadius: 12,
                                    background: 'radial-gradient(ellipse at top right, rgba(239,68,68,0.08), transparent)',
                                    pointerEvents: 'none',
                                }} />
                            )}

                            {/* Zone header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.78rem' }}>{z.zone_name}</p>
                                    <p style={{ fontSize: '0.62rem', color: 'var(--muted)', marginTop: 1 }}>{z.zone_id}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    {z.anomaly
                                        ? <AlertTriangle size={12} color="#ef4444" />
                                        : <CheckCircle size={12} color="#10b981" />}
                                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: z.anomaly ? '#f87171' : '#34d399' }}>
                                        {z.anomaly ? z.anomaly_type ?? 'ANOMALY' : 'OK'}
                                    </span>
                                </div>
                            </div>

                            {/* Tank ring + metrics */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <CircularTank level={z.tank_level_pct} color={tankColor} />
                                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                                    {[
                                        { label: 'Flow', value: `${z.flow_rate_lpm}L/m`, color: '#06b6d4' },
                                        { label: 'Press', value: `${z.pressure_bar}bar`, color: '#6366f1' },
                                        { label: 'Pump', value: z.pump_status, color: z.pump_status === 'ON' ? '#10b981' : '#475569' },
                                        { label: 'Valve', value: z.valve_status ?? 'OPEN', color: '#f59e0b' },
                                    ].map(m => (
                                        <div key={m.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '0.25rem 0.4rem' }}>
                                            <p style={{ fontSize: '0.58rem', color: 'var(--muted)' }}>{m.label}</p>
                                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: m.color }}>{m.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Leak probability bar */}
                            {z.leak_probability > 0 && (
                                <div style={{ marginTop: '0.6rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--muted)', marginBottom: 3 }}>
                                        <span>Leak probability</span>
                                        <span style={{ color: '#f87171', fontWeight: 700 }}>{Math.round(z.leak_probability * 100)}%</span>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 3 }}>
                                        <div style={{
                                            width: `${z.leak_probability * 100}%`, height: '100%', borderRadius: 4,
                                            background: 'linear-gradient(90deg, #f97316, #ef4444)',
                                            transition: 'width 0.8s ease',
                                        }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Radar comparison */}
            {radarData.length > 0 && (
                <div>
                    <p className="section-label" style={{ marginBottom: '0.5rem' }}>Zone Comparison (normalized)</p>
                    <ResponsiveContainer width="100%" height={160}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.06)" />
                            <PolarAngleAxis dataKey="zone" tick={{ fill: '#475569', fontSize: 10 }} />
                            <Radar name="Flow" dataKey="Flow" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.12} strokeWidth={1.5} />
                            <Radar name="Tank" dataKey="Tank" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={1.5} />
                            <Tooltip contentStyle={{ background: 'rgba(4,8,18,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}
