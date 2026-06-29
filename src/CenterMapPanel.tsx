import { useState, type MouseEvent } from 'react'

type ZoneType = 'park' | 'warm' | 'hotspot' | 'road'

export interface ZoneData {
  zoneName: string
  temperature: number
  riskLevel: 'Low' | 'Moderate' | 'Critical'
}

interface ZoneBlock {
  id: string
  x: number
  y: number
  width: number
  height: number
  type: ZoneType
  zoneName: string
  temperature: number
  riskLevel: ZoneData['riskLevel']
}

interface CenterMapPanelProps {
  activeYear: number
  city: string
  layer: string
  scenario: string
  onZoneClick?: (zone: ZoneData) => void
  stats?: {
    avgLst: string
    airTemp: string
    humidity: string
    wind: string
    heatIndex: string
  }
}

const zoneBlocks: ZoneBlock[] = [
  { id: 'park-1', x: 80, y: 90, width: 120, height: 90, type: 'park', zoneName: 'River Park', temperature: 29.4, riskLevel: 'Low' },
  { id: 'warm-1', x: 220, y: 90, width: 100, height: 90, type: 'warm', zoneName: 'Civic Quarter', temperature: 37.8, riskLevel: 'Moderate' },
  { id: 'hot-1', x: 340, y: 90, width: 120, height: 90, type: 'hotspot', zoneName: 'Transit Hub', temperature: 44.6, riskLevel: 'Critical' },
  { id: 'road-1', x: 480, y: 90, width: 90, height: 90, type: 'road', zoneName: 'Main Avenue', temperature: 34.8, riskLevel: 'Moderate' },
  { id: 'warm-2', x: 590, y: 90, width: 110, height: 90, type: 'warm', zoneName: 'Mixed Housing', temperature: 36.9, riskLevel: 'Moderate' },
  { id: 'park-2', x: 720, y: 90, width: 140, height: 90, type: 'park', zoneName: 'Botanical Garden', temperature: 30.2, riskLevel: 'Low' },

  { id: 'warm-3', x: 80, y: 220, width: 110, height: 90, type: 'warm', zoneName: 'Industrial Belt', temperature: 39.1, riskLevel: 'Moderate' },
  { id: 'hot-2', x: 210, y: 220, width: 120, height: 90, type: 'hotspot', zoneName: 'CBD Core', temperature: 45.8, riskLevel: 'Critical' },
  { id: 'road-2', x: 350, y: 220, width: 100, height: 90, type: 'road', zoneName: 'Ring Road', temperature: 35.5, riskLevel: 'Moderate' },
  { id: 'warm-4', x: 470, y: 220, width: 120, height: 90, type: 'warm', zoneName: 'Residential East', temperature: 37.1, riskLevel: 'Moderate' },
  { id: 'hot-3', x: 610, y: 220, width: 130, height: 90, type: 'hotspot', zoneName: 'Warehouse District', temperature: 46.4, riskLevel: 'Critical' },
  { id: 'park-3', x: 760, y: 220, width: 100, height: 90, type: 'park', zoneName: 'Urban Wetland', temperature: 28.7, riskLevel: 'Low' },

  { id: 'warm-5', x: 80, y: 350, width: 140, height: 90, type: 'warm', zoneName: 'Old Town', temperature: 38.2, riskLevel: 'Moderate' },
  { id: 'hot-4', x: 240, y: 350, width: 120, height: 90, type: 'hotspot', zoneName: 'Solar Corridor', temperature: 47.1, riskLevel: 'Critical' },
  { id: 'road-3', x: 380, y: 350, width: 120, height: 90, type: 'road', zoneName: 'Metro Spine', temperature: 34.1, riskLevel: 'Moderate' },
  { id: 'warm-6', x: 520, y: 350, width: 110, height: 90, type: 'warm', zoneName: 'Low-rise West', temperature: 36.5, riskLevel: 'Moderate' },
  { id: 'park-4', x: 650, y: 350, width: 150, height: 90, type: 'park', zoneName: 'Central Green', temperature: 29.8, riskLevel: 'Low' },
  { id: 'warm-7', x: 820, y: 350, width: 100, height: 90, type: 'warm', zoneName: 'Campus Loop', temperature: 35.4, riskLevel: 'Moderate' },

  { id: 'warm-8', x: 140, y: 480, width: 120, height: 90, type: 'warm', zoneName: 'Suburban Fringe', temperature: 35.8, riskLevel: 'Moderate' },
  { id: 'hot-5', x: 280, y: 480, width: 120, height: 90, type: 'hotspot', zoneName: 'Concrete Basin', temperature: 46.8, riskLevel: 'Critical' },
  { id: 'road-4', x: 420, y: 480, width: 120, height: 90, type: 'road', zoneName: 'Harbor Road', temperature: 33.9, riskLevel: 'Moderate' },
  { id: 'warm-9', x: 560, y: 480, width: 140, height: 90, type: 'warm', zoneName: 'North District', temperature: 36.1, riskLevel: 'Moderate' },
  { id: 'park-5', x: 720, y: 480, width: 120, height: 90, type: 'park', zoneName: 'Reservoir Edge', temperature: 29.2, riskLevel: 'Low' },
]

const defaultStats = {
  avgLst: '41.2°C',
  airTemp: '38.4°C',
  humidity: '62%',
  wind: '3.1 m/s',
  heatIndex: '47°C',
}

export function CenterMapPanel({
  activeYear,
  city,
  layer,
  scenario,
  onZoneClick,
  stats = defaultStats,
}: CenterMapPanelProps) {
  const [builderMode, setBuilderMode] = useState(false)
  const [burst, setBurst] = useState<{ id: number; x: number; y: number } | null>(null)

  const handleZoneClick = (event: MouseEvent<SVGRectElement>, zone: ZoneBlock) => {
    const svg = event.currentTarget.ownerSVGElement
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 1000
    const y = ((event.clientY - rect.top) / rect.height) * 700

    if (builderMode) {
      setBurst({ id: Date.now(), x, y })
      window.setTimeout(() => setBurst(current => (current?.id === burst?.id ? null : current)), 1200)
    }

    onZoneClick?.({
      zoneName: zone.zoneName,
      temperature: zone.temperature,
      riskLevel: zone.riskLevel,
    })
  }

  return (
    <div className="relative flex-1 overflow-hidden rounded-[18px] border border-white/10 bg-[#07101b]">
      <div className="absolute left-4 top-4 z-20 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-xl">
        <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
          Live Urban Pulse
        </div>
        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-gray-200">
          <span>Avg LST: <span className="text-brand-cyan">{stats.avgLst}</span></span>
          <span>Air Temp: <span className="text-brand-cyan">{stats.airTemp}</span></span>
          <span>Humidity: <span className="text-brand-cyan">{stats.humidity}</span></span>
          <span>Wind: <span className="text-brand-cyan">{stats.wind}</span></span>
          <span>Heat Index: <span className="text-brand-cyan">{stats.heatIndex}</span></span>
        </div>
      </div>

      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setBuilderMode(value => !value)}
          className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${builderMode ? 'border-brand-cyan/60 bg-brand-cyan/15 text-brand-cyan' : 'border-white/10 bg-white/10 text-gray-300 hover:border-brand-cyan/40 hover:text-brand-cyan'}`}
        >
          {builderMode ? 'Builder Mode On' : 'Builder Mode'}
        </button>
      </div>

      <div className="absolute left-4 top-24 z-10 rounded-full border border-white/10 bg-[#07101b]/70 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/60 backdrop-blur">
        {city.toUpperCase()} · {layer} · {scenario} · {activeYear}
      </div>

      <svg viewBox="0 0 1000 700" className="h-full w-full">
        <rect x="0" y="0" width="1000" height="700" fill="#07101b" />

        <g opacity="0.35" stroke="#243041" strokeWidth="2">
          {Array.from({ length: 9 }, (_, index) => (
            <line key={`v-${index}`} x1={80 + index * 100} y1="40" x2={80 + index * 100} y2="640" />
          ))}
          {Array.from({ length: 7 }, (_, index) => (
            <line key={`h-${index}`} x1="40" y1={90 + index * 90} x2="940" y2={90 + index * 90} />
          ))}
        </g>

        <g opacity="0.6" stroke="#2c3a4a" strokeWidth="3" strokeLinecap="round">
          <line x1="60" y1="120" x2="940" y2="120" />
          <line x1="60" y1="250" x2="940" y2="250" />
          <line x1="60" y1="380" x2="940" y2="380" />
          <line x1="60" y1="510" x2="940" y2="510" />
          <line x1="60" y1="640" x2="940" y2="640" />
          <line x1="120" y1="60" x2="120" y2="640" />
          <line x1="260" y1="60" x2="260" y2="640" />
          <line x1="400" y1="60" x2="400" y2="640" />
          <line x1="540" y1="60" x2="540" y2="640" />
          <line x1="680" y1="60" x2="680" y2="640" />
          <line x1="820" y1="60" x2="820" y2="640" />
          <line x1="940" y1="60" x2="940" y2="640" />
        </g>

        {zoneBlocks.map(zone => (
          <rect
            key={zone.id}
            x={zone.x}
            y={zone.y}
            width={zone.width}
            height={zone.height}
            rx="10"
            ry="10"
            className={zone.type === 'hotspot' ? 'hotspot-block cursor-pointer' : 'cursor-pointer'}
            fill={zone.type === 'park' ? '#1E90FF' : zone.type === 'warm' ? '#FFB347' : zone.type === 'hotspot' ? '#CC2200' : '#444'}
            fillOpacity={zone.type === 'park' ? 0.42 : zone.type === 'warm' ? 0.9 : zone.type === 'hotspot' ? 0.9 : 0.95}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1"
            onClick={event => handleZoneClick(event, zone)}
          />
        ))}

        <g className="wind-arrows" opacity="0.75">
          <g className="wind-arrow" style={{ animationDelay: '0s' }}>
            <path d="M80 72 L140 72" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
            <path d="M126 58 L144 72 L126 86" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
          <g className="wind-arrow" style={{ animationDelay: '1.4s' }}>
            <path d="M250 620 L330 620" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
            <path d="M316 606 L334 620 L316 634" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
          <g className="wind-arrow" style={{ animationDelay: '2.5s' }}>
            <path d="M620 120 L700 120" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
            <path d="M686 106 L704 120 L686 134" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
          <g className="wind-arrow" style={{ animationDelay: '3.2s' }}>
            <path d="M780 560 L860 560" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
            <path d="M846 546 L864 560 L846 574" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        </g>
      </svg>

      {burst && (
        <>
          <div
            className="builder-ripple"
            style={{ left: `${(burst.x / 1000) * 100}%`, top: `${(burst.y / 700) * 100}%` }}
          />
          <div
            className="builder-float"
            style={{ left: `${(burst.x / 1000) * 100}%`, top: `${(burst.y / 700) * 100}%` }}
          >
            −1.2°C
          </div>
        </>
      )}
    </div>
  )
}
