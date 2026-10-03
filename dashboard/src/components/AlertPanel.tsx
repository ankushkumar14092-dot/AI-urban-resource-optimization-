import { AlertTriangle, CheckCircle, Info, ChevronRight } from 'lucide-react'

interface Alert {
    id: string
    type: 'HIGH' | 'MODERATE' | 'INFO' | 'OK'
    title: string
    message: string
    time: string
    zone?: string
}

interface Props { alerts: Alert[] }

const CFG = {
    HIGH: { bg: 'rgba(239,68,68,0.07)', border: '#ef4444', glow: 'rgba(239,68,68,0.15)', dot: '#ef4444', icon: AlertTriangle },
    MODERATE: { bg: 'rgba(249,115,22,0.07)', border: '#f97316', glow: 'rgba(249,115,22,0.15)', dot: '#f97316', icon: AlertTriangle },
    INFO: { bg: 'rgba(59,130,246,0.07)', border: '#3b82f6', glow: 'rgba(59,130,246,0.15)', dot: '#3b82f6', icon: Info },
    OK: { bg: 'rgba(16,185,129,0.06)', border: '#10b981', glow: 'rgba(16,185,129,0.12)', dot: '#10b981', icon: CheckCircle },
}

const LABEL = { HIGH: 'Critical', MODERATE: 'Warning', INFO: 'Info', OK: 'Normal' }

export default function AlertPanel({ alerts }: Props) {
    const critCount = alerts.filter(a => a.type === 'HIGH').length
    const warnCount = alerts.filter(a => a.type === 'MODERATE').length

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <p className="section-label">Live Alerts</p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {critCount > 0 && (
                        <span style={{
                            padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 800,
                            background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)',
                        }}>{critCount} critical</span>
                    )}
                    {warnCount > 0 && (
                        <span style={{
                            padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 800,
                            background: 'rgba(249,115,22,0.15)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.25)',
                        }}>{warnCount} warning</span>
                    )}
                </div>
            </div>

            {/* Alert list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flex: 1 }}>
                {alerts.map((a, idx) => {
                    const c = CFG[a.type]
                    const Icon = c.icon
                    return (
                        <div key={a.id} style={{
                            background: c.bg,
                            border: `1px solid ${c.border}28`,
                            borderLeft: `3px solid ${c.border}`,
                            borderRadius: 10, padding: '0.7rem 0.75rem',
                            cursor: 'default',
                            transition: 'all 0.15s',
                            animation: idx === 0 ? 'countUp 0.3s ease forwards' : 'none',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                                    background: `${c.border}18`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon size={13} color={c.border} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.78rem' }}>{a.title}</span>
                                            <span style={{
                                                padding: '1px 6px', borderRadius: 4, fontSize: '0.58rem', fontWeight: 700,
                                                background: `${c.border}20`, color: c.border, textTransform: 'uppercase', letterSpacing: '0.05em',
                                            }}>{LABEL[a.type]}</span>
                                        </div>
                                        <span style={{ fontSize: '0.62rem', color: 'var(--muted)', flexShrink: 0 }}>{a.time}</span>
                                    </div>
                                    <p style={{ fontSize: '0.73rem', color: 'var(--muted2)', lineHeight: 1.45 }}>{a.message}</p>
                                    {a.zone && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                            <span style={{ fontSize: '0.62rem', color: 'var(--muted)', fontWeight: 600 }}>Zone: {a.zone}</span>
                                        </div>
                                    )}
                                </div>
                                <ChevronRight size={12} color="var(--muted)" style={{ flexShrink: 0, marginTop: 6 }} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export type { Alert }
