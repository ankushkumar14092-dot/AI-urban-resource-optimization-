import { useState, useEffect } from 'react'
import { Activity, Wifi, WifiOff, RefreshCw, Bell } from 'lucide-react'

interface Props {
    lastUpdated: string
    alertCount?: number
    onRefresh?: () => void
}

export default function Header({ lastUpdated, alertCount = 0, onRefresh }: Props) {
    const [time, setTime] = useState(new Date())
    const [connected, setConnected] = useState(true)

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(t)
    }, [])

    // Simulate occasional disconnect flicker for realism
    useEffect(() => {
        if (lastUpdated !== '—') setConnected(true)
    }, [lastUpdated])

    const timeStr = time.toLocaleTimeString('en-US', { hour12: false })
    const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

    return (
        <header style={{
            background: 'linear-gradient(180deg, rgba(4,8,18,0.98) 0%, rgba(7,13,26,0.96) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            padding: '0 1.75rem',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 200,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
        }}>
            {/* Left — brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(99,102,241,0.4)',
                    flexShrink: 0,
                }}>
                    <Activity size={19} color="white" strokeWidth={2.2} />
                </div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h1 style={{
                            fontSize: '1.0rem', fontWeight: 800, letterSpacing: '-0.025em',
                            background: 'linear-gradient(90deg, #e2e8f0, #94a3b8)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            AI Urban Command Center
                        </h1>
                        <span style={{
                            padding: '1px 7px', borderRadius: 5,
                            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                            fontSize: '0.6rem', fontWeight: 700, color: '#818cf8', letterSpacing: '0.08em',
                        }}>LIVE</span>
                    </div>
                    <p style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: 1 }}>
                        Minneapolis Metro · Real-time resource optimization
                    </p>
                </div>
            </div>

            {/* Center — live clock */}
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '0.35rem 1.25rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10,
            }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums' }}>
                    {timeStr}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: 1 }}>{dateStr}</span>
            </div>

            {/* Right — status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Alert bell */}
                {alertCount > 0 && (
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 8,
                            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}>
                            <Bell size={15} color="#f87171" />
                        </div>
                        <span style={{
                            position: 'absolute', top: -4, right: -4,
                            width: 16, height: 16, borderRadius: '50%',
                            background: '#ef4444', fontSize: '0.6rem', fontWeight: 800,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                        }}>{alertCount}</span>
                    </div>
                )}

                {/* Refresh button */}
                {onRefresh && (
                    <button onClick={onRefresh} style={{
                        width: 34, height: 34, borderRadius: 8,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--muted2)',
                    }}>
                        <RefreshCw size={14} />
                    </button>
                )}

                {/* Connection status */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.35rem 0.75rem', borderRadius: 8,
                    background: connected ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${connected ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                    <span className="pulse" style={{ background: connected ? 'var(--green)' : 'var(--red)' }} />
                    {connected ? <Wifi size={13} color="#34d399" /> : <WifiOff size={13} color="#f87171" />}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: connected ? '#34d399' : '#f87171' }}>
                            {connected ? 'Connected' : 'Offline'}
                        </span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--muted)', lineHeight: 1 }}>
                            {lastUpdated}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    )
}
