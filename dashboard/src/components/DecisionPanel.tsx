import { Brain, CheckCircle2, AlertCircle } from 'lucide-react'

interface Decision {
    urgency: string
    recommended_actions: string[]
    reasons: string[]
    scores?: { traffic_priority: number; energy_priority: number; weather_risk: number }
}

function RingGauge({ value, color, label }: { value: number; color: string; label: string }) {
    const r = 22, cx = 28, cy = 28
    const circ = 2 * Math.PI * r
    const dash = circ * Math.min(value, 1)
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <svg width={56} height={56}>
                <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth={4}
                    stroke="rgba(255,255,255,0.06)" />
                <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth={4}
                    stroke={color} strokeLinecap="round"
                    strokeDasharray={`${dash} ${circ}`}
                    strokeDashoffset={circ / 4}
                    style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)' }}
                />
                <text x={cx} y={cy + 4} textAnchor="middle" fill="white"
                    fontSize={10} fontWeight={800} fontFamily="Inter">
                    {Math.round(value * 100)}
                </text>
            </svg>
            <span style={{ fontSize: '0.6rem', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
        </div>
    )
}

const ACTION_ICON = (action: string) => {
    if (action.includes('route') || action.includes('signal')) return '🚦'
    if (action.includes('energy') || action.includes('power')) return '⚡'
    if (action.includes('rain') || action.includes('flood') || action.includes('wet')) return '🌧'
    if (action.includes('speed')) return '🚗'
    if (action.includes('nominal') || action.includes('normal')) return '✅'
    return '📋'
}

export default function DecisionPanel({ decision }: { decision: Decision | null }) {
    if (!decision) {
        return (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={20} color="#6366f1" />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Loading decision engine...</p>
            </div>
        )
    }

    const isHigh = decision.urgency === 'HIGH'
    const urgencyColor = isHigh ? '#ef4444' : '#10b981'

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Brain size={15} color="#818cf8" />
                </div>
                <div>
                    <p className="section-label">AI Decision Engine</p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: 1 }}>Real-time recommendations</p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                        padding: '4px 10px', borderRadius: 8,
                        background: isHigh ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                        border: `1px solid ${urgencyColor}30`,
                    }}>
                        {isHigh
                            ? <AlertCircle size={12} color={urgencyColor} />
                            : <CheckCircle2 size={12} color={urgencyColor} />}
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: urgencyColor }}>{decision.urgency}</span>
                    </div>
                </div>
            </div>

            {/* Score rings */}
            {decision.scores && (
                <div style={{
                    display: 'flex', justifyContent: 'space-around',
                    padding: '0.875rem', background: 'rgba(0,0,0,0.2)',
                    borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)',
                }}>
                    <RingGauge value={decision.scores.traffic_priority} color="#3b82f6" label="Traffic" />
                    <RingGauge value={decision.scores.energy_priority} color="#f59e0b" label="Energy" />
                    <RingGauge value={decision.scores.weather_risk} color="#06b6d4" label="Weather" />
                </div>
            )}

            {/* Actions */}
            <div>
                <p className="section-label" style={{ marginBottom: '0.5rem' }}>Recommended Actions</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {decision.recommended_actions.map((action, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                            padding: '0.55rem 0.7rem',
                            background: 'rgba(59,130,246,0.06)',
                            border: '1px solid rgba(59,130,246,0.12)',
                            borderRadius: 9,
                        }}>
                            <span style={{ fontSize: '0.85rem', flexShrink: 0, lineHeight: 1.2 }}>{ACTION_ICON(action)}</span>
                            <span style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>{action}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div className="divider" />

            {/* Reasons */}
            <div>
                <p className="section-label" style={{ marginBottom: '0.4rem' }}>Trigger Conditions</p>
                {decision.reasons.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.4rem', marginBottom: 4, alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--muted)', fontSize: '0.75rem', flexShrink: 0, marginTop: 1 }}>›</span>
                        <p style={{ fontSize: '0.72rem', color: 'var(--muted2)', lineHeight: 1.45 }}>{r}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
