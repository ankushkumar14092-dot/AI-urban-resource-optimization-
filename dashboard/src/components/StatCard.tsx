import type { ReactNode } from 'react'

interface Props {
    label: string
    value: string
    sub?: string
    icon: ReactNode
    color?: string
    badge?: string
    badgeColor?: string
    trend?: number       // positive = up, negative = down
    sparkline?: number[] // small array of values for mini chart
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
    if (data.length < 2) return null
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const w = 64, h = 28
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w
        const y = h - ((v - min) / range) * h
        return `${x},${y}`
    }).join(' ')
    return (
        <svg width={w} height={h} style={{ overflow: 'visible' }}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5}
                strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
            <circle cx={pts.split(' ').pop()?.split(',')[0]} cy={pts.split(' ').pop()?.split(',')[1]}
                r={2.5} fill={color} />
        </svg>
    )
}

export default function StatCard({ label, value, sub, icon, color = '#3b82f6', badge, badgeColor = 'blue', trend, sparkline }: Props) {
    return (
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Top color accent bar */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${color}, ${color}88)`,
                borderRadius: '16px 16px 0 0',
            }} />

            {/* Background glow */}
            <div style={{
                position: 'absolute', top: -30, right: -30,
                width: 120, height: 120,
                background: `radial-gradient(circle, ${color}0f 0%, transparent 70%)`,
                pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 6 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="section-label">{label}</p>
                    <p className="count-anim" style={{
                        fontSize: '1.75rem', fontWeight: 900, marginTop: 6,
                        letterSpacing: '-0.03em', lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums',
                    }}>{value}</p>

                    {/* Trend indicator */}
                    {trend !== undefined && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
                            <span style={{
                                fontSize: '0.72rem', fontWeight: 700,
                                color: trend >= 0 ? '#f87171' : '#34d399',
                            }}>
                                {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
                            </span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>vs last hour</span>
                        </div>
                    )}

                    {sub && !trend && (
                        <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4, lineHeight: 1.4 }}>{sub}</p>
                    )}

                    {badge && (
                        <span className={`badge badge-${badgeColor}`} style={{ marginTop: 8, display: 'inline-flex' }}>{badge}</span>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: 10,
                        background: `${color}15`,
                        border: `1px solid ${color}25`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: color,
                    }}>
                        {icon}
                    </div>
                    {sparkline && <Sparkline data={sparkline} color={color} />}
                </div>
            </div>
        </div>
    )
}
