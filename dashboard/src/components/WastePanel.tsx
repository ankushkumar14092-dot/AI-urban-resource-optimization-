import { Trash2, MapPin, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'

interface WasteBin {
    bin_id: string
    bin_name: string
    fill_level_pct: number
    status: 'OK' | 'MODERATE' | 'HIGH' | 'CRITICAL'
    hours_to_full: number
    recommendation: string
    needs_collection: boolean
    capacity_liters: number
}

const STATUS_COLOR: Record<string, string> = {
    OK: '#10b981',
    MODERATE: '#3b82f6',
    HIGH: '#f97316',
    CRITICAL: '#ef4444',
}

export default function WastePanel({ bins }: { bins: WasteBin[] }) {
    const needCollection = bins.filter(b => b.needs_collection).length
    const critical = bins.filter(b => b.status === 'CRITICAL').length
    const avgFill = bins.length ? Math.round(bins.reduce((s, b) => s + b.fill_level_pct, 0) / bins.length) : 0

    const chartData = bins.map(b => ({ name: b.bin_name.split(' ')[0], fill: b.fill_level_pct, status: b.status }))

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trash2 size={14} color="var(--orange)" />
                    <p className="section-label">Waste Bin Tracking</p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {critical > 0 && (
                        <span style={{
                            padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700,
                            background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)',
                        }}>{critical} critical</span>
                    )}
                    <span style={{
                        padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700,
                        background: 'rgba(249,115,22,0.12)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.2)',
                    }}>{needCollection} to collect</span>
                </div>
            </div>

            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {[
                    { label: 'Avg Fill', value: `${avgFill}%`, color: avgFill > 70 ? '#f97316' : '#10b981' },
                    { label: 'Need Collect', value: needCollection.toString(), color: '#f97316' },
                    { label: 'Total Bins', value: bins.length.toString(), color: '#3b82f6' },
                ].map(s => (
                    <div key={s.label} style={{
                        background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 10, padding: '0.6rem 0.75rem',
                    }}>
                        <p style={{ fontSize: '0.6rem', color: 'var(--muted)', marginBottom: 3 }}>{s.label}</p>
                        <p style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Bar chart fill levels */}
            <div>
                <p className="section-label" style={{ marginBottom: '0.5rem' }}>Fill Levels Overview</p>
                <ResponsiveContainer width="100%" height={90}>
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ background: 'rgba(4,8,18,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                            formatter={(v: any) => [`${v}%`, 'Fill']}
                        />
                        <Bar dataKey="fill" radius={[3, 3, 0, 0]}>
                            {chartData.map((entry, i) => (
                                <Cell key={i} fill={STATUS_COLOR[entry.status]} fillOpacity={0.85} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Bin list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {bins.map(b => {
                    const c = STATUS_COLOR[b.status]
                    return (
                        <div key={b.bin_id} style={{
                            display: 'flex', alignItems: 'center', gap: '0.7rem',
                            padding: '0.6rem 0.75rem',
                            background: b.needs_collection ? `${c}08` : 'rgba(0,0,0,0.15)',
                            border: `1px solid ${b.needs_collection ? c + '25' : 'rgba(255,255,255,0.05)'}`,
                            borderRadius: 10,
                        }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                background: `${c}15`, border: `1px solid ${c}25`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Trash2 size={13} color={c} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <div>
                                        <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>{b.bin_name}</span>
                                        <span style={{ fontSize: '0.62rem', color: 'var(--muted)', marginLeft: 6 }}>{b.bin_id}</span>
                                    </div>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: c }}>{b.fill_level_pct}%</span>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 4 }}>
                                    <div style={{
                                        width: `${b.fill_level_pct}%`, height: '100%', borderRadius: 4,
                                        background: `linear-gradient(90deg, ${c}cc, ${c})`,
                                        transition: 'width 0.6s ease',
                                    }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 4 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                        <Clock size={9} color="var(--muted)" />
                                        <span style={{ fontSize: '0.62rem', color: 'var(--muted)' }}>
                                            {b.hours_to_full < 99 ? `Full in ~${b.hours_to_full}h` : 'Not filling fast'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                        <MapPin size={9} color="var(--muted)" />
                                        <span style={{ fontSize: '0.62rem', color: 'var(--muted)' }}>{b.capacity_liters}L cap</span>
                                    </div>
                                </div>
                            </div>
                            {b.needs_collection && (
                                <span style={{
                                    padding: '3px 8px', borderRadius: 6, fontSize: '0.62rem', fontWeight: 800, flexShrink: 0,
                                    background: `${c}18`, color: c, border: `1px solid ${c}30`,
                                    textTransform: 'uppercase', letterSpacing: '0.04em',
                                }}>
                                    {b.status === 'CRITICAL' ? '🔴 Now' : '🟠 Soon'}
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
