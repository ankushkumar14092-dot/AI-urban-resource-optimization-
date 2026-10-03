import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip as LeafletTooltip } from 'react-leaflet'
import { Map } from 'lucide-react'

interface MapPoint {
    id: string
    name: string
    lat: number
    lon: number
    type: 'traffic' | 'water' | 'waste' | 'energy'
    status: 'OK' | 'WARNING' | 'CRITICAL'
    detail: string
}

const STATUS = {
    OK: { color: '#10b981', pulse: 'rgba(16,185,129,0.3)' },
    WARNING: { color: '#f97316', pulse: 'rgba(249,115,22,0.3)' },
    CRITICAL: { color: '#ef4444', pulse: 'rgba(239,68,68,0.3)' },
}

const TYPE_EMOJI: Record<string, string> = {
    traffic: '🚗',
    water: '💧',
    waste: '🗑️',
    energy: '⚡',
}

interface Props { points: MapPoint[]; height?: number }

export default function CityMap({ points, height = 360 }: Props) {
    const critCount = points.filter(p => p.status === 'CRITICAL').length
    const warnCount = points.filter(p => p.status === 'WARNING').length

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                padding: '0.875rem 1.25rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(0,0,0,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Map size={14} color="var(--blue)" />
                    <p className="section-label">Live City Map</p>
                    <span style={{ fontSize: '0.65rem', color: 'var(--muted)', marginLeft: 4 }}>Minneapolis Metro</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {/* Legend */}
                    {(['OK', 'WARNING', 'CRITICAL'] as const).map(s => (
                        <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', color: 'var(--muted)' }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS[s].color, display: 'inline-block' }} />
                            {s}
                        </span>
                    ))}
                    <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
                    {critCount > 0 && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f87171' }}>{critCount} critical</span>
                    )}
                    {warnCount > 0 && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fb923c' }}>{warnCount} warning</span>
                    )}
                </div>
            </div>

            <MapContainer
                center={[44.978, -93.268]}
                zoom={13}
                style={{ height, width: '100%' }}
                zoomControl={true}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>'
                />
                {points.map(p => {
                    const s = STATUS[p.status]
                    const isTraffic = p.type === 'traffic'
                    return (
                        <CircleMarker
                            key={p.id}
                            center={[p.lat, p.lon]}
                            radius={isTraffic ? 13 : 9}
                            pathOptions={{
                                fillColor: s.color,
                                color: s.color,
                                fillOpacity: 0.8,
                                weight: isTraffic ? 2 : 1.5,
                            }}
                        >
                            <LeafletTooltip permanent={false} direction="top" offset={[0, -8]}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                                    {TYPE_EMOJI[p.type]} {p.name}
                                </span>
                            </LeafletTooltip>
                            <Popup>
                                <div style={{ minWidth: 180, fontFamily: 'Inter, sans-serif' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 6 }}>
                                        <span style={{ fontSize: '1rem' }}>{TYPE_EMOJI[p.type]}</span>
                                        <strong style={{ fontSize: '0.85rem' }}>{p.name}</strong>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                                        <span style={{
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: s.color, display: 'inline-block',
                                        }} />
                                        <span style={{ fontWeight: 700, fontSize: '0.75rem', color: s.color }}>
                                            {p.status}
                                        </span>
                                        <span style={{
                                            marginLeft: 4, padding: '1px 6px', borderRadius: 4, fontSize: '0.65rem',
                                            background: 'rgba(255,255,255,0.1)', fontWeight: 600, textTransform: 'capitalize',
                                        }}>{p.type}</span>
                                    </div>
                                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>{p.detail}</p>
                                </div>
                            </Popup>
                        </CircleMarker>
                    )
                })}
            </MapContainer>
        </div>
    )
}

export type { MapPoint }
