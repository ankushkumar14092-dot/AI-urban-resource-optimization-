import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, ReferenceLine, Legend,
} from 'recharts'
import { TrendingUp } from 'lucide-react'

interface DataPoint {
    time: string
    predicted: number
    actual?: number
    capacity: number
}

interface Props {
    data: DataPoint[]
    peakHour?: string
    avgVolume?: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{
            background: 'rgba(4,8,18,0.95)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '0.75rem 1rem', minWidth: 160,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>{label}</p>
            {payload.map((p: any) => (
                <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 3 }}>
                    <span style={{ fontSize: '0.75rem', color: p.color }}>{p.name}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        {p.value?.toLocaleString()}
                    </span>
                </div>
            ))}
        </div>
    )
}

export default function TrafficChart({ data, peakHour, avgVolume }: Props) {
    const latest = data[data.length - 1]
    const prev = data[data.length - 2]
    const trendPct = prev ? Math.round(((latest.predicted - prev.predicted) / prev.predicted) * 100) : 0
    const trendUp = trendPct >= 0

    return (
        <div className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={15} color="var(--blue)" />
                        <p className="section-label">Traffic Volume — 24h Forecast</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 4 }}>
                        <span style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                            {latest?.predicted?.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>vehicles/hr</span>
                        <span style={{
                            fontSize: '0.72rem', fontWeight: 700,
                            color: trendUp ? '#f87171' : '#34d399',
                            marginLeft: 4,
                        }}>
                            {trendUp ? '▲' : '▼'} {Math.abs(trendPct)}%
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {peakHour && (
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>Peak Hour</p>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--yellow)' }}>{peakHour}</p>
                        </div>
                    )}
                    {avgVolume && (
                        <div style={{
                            textAlign: 'right', paddingLeft: '0.75rem',
                            borderLeft: '1px solid rgba(255,255,255,0.07)',
                        }}>
                            <p style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>Avg/hr</p>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{avgVolume.toLocaleString()}</p>
                        </div>
                    )}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                    <defs>
                        <linearGradient id="gTraffic" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }}
                        axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }}
                        axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '0.72rem', paddingTop: 8 }}
                        formatter={(v) => <span style={{ color: 'var(--muted2)' }}>{v}</span>} />
                    <ReferenceLine y={6000} stroke="rgba(239,68,68,0.4)" strokeDasharray="4 4"
                        label={{ value: 'Capacity', position: 'right', fill: '#f87171', fontSize: 10 }} />
                    {data.some(d => d.actual) && (
                        <Area type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2}
                            fill="url(#gActual)" name="Actual" dot={false} />
                    )}
                    <Area type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2.5}
                        fill="url(#gTraffic)" name="Predicted" dot={false}
                        activeDot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
