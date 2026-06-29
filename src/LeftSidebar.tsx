// LeftSidebar.tsx — Full left panel for Urban Heat Digital Twin

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// ── Layer config ────────────────────────────────────────────────────────────
interface LayerItem {
  id: string
  label: string
  icon: string   // collapsed icon
}

const LAYERS: LayerItem[] = [
  { id: 'lst',       label: 'Land Surface Temperature', icon: '🌡' },
  { id: 'ecostress', label: 'ECOSTRESS',                icon: '🛰' },
  { id: 'ndvi',      label: 'NDVI',                     icon: '🌿' },
  { id: 'lulc',      label: 'Land Use',                 icon: '🗺' },
  { id: 'pop',       label: 'Population Density',       icon: '👥' },
  { id: 'vuln',      label: 'Heat Vulnerability',       icon: '⚠' },
  { id: 'wind',      label: 'Wind Direction',           icon: '💨' },
  { id: 'humidity',  label: 'Humidity',                 icon: '💧' },
  { id: 'rain',      label: 'Rainfall',                 icon: '🌧' },
  { id: 'building',  label: 'Building Height',          icon: '🏙' },
  { id: 'water',     label: 'Water Bodies',             icon: '🌊' },
  { id: 'ai',        label: 'AI Recommendation',        icon: '🤖' },
]

// ── Satellite sources ────────────────────────────────────────────────────────
const SOURCES = [
  { id: 'landsat',   label: 'Landsat 8',   icon: '🛰' },
  { id: 'sentinel',  label: 'Sentinel-2',  icon: '🛰' },
  { id: 'ecostress', label: 'ECOSTRESS',   icon: '🛰' },
  { id: 'era5',      label: 'ERA5',        icon: '🌍' },
  { id: 'imd',       label: 'IMD',         icon: '🌧' },
  { id: 'osm',       label: 'OSM',         icon: '🗺' },
  { id: 'ghsl',      label: 'GHSL',        icon: '🏙' },
]

// ── Props ────────────────────────────────────────────────────────────────────
interface LeftSidebarProps {
  activeYear: number
  onYearChange: (y: number) => void
}

// ── Component ────────────────────────────────────────────────────────────────
export function LeftSidebar({ activeYear, onYearChange }: LeftSidebarProps) {
  const [collapsed, setCollapsed]   = useState(false)
  const [checked, setChecked]       = useState<Record<string, boolean>>(
    Object.fromEntries(LAYERS.map(l => [l.id, true]))
  )

  const toggleLayer = (id: string) =>
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))

  // timeline: range min=2016 max=2026 (inverted so 2026 is visually at top)
  const sliderVal = 2026 - activeYear + 2016  // maps 2026→2016, 2016→2026

  return (
    <div className="relative flex shrink-0 h-full overflow-visible">
      {/* ── Toggle button (placed outside overflow-hidden aside) ── */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="
          absolute -right-3 top-6 z-20
          w-6 h-6 rounded-full
          bg-[#0B1220] border border-white/20
          hover:border-brand-cyan/50 hover:text-brand-cyan
          text-gray-400 flex items-center justify-center
          transition-colors shadow-lg cursor-pointer
        "
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      <aside
        className={`
          ${collapsed ? 'w-12' : 'w-64'}
          h-full flex flex-col
          bg-white/5 backdrop-blur-md
          border border-white/10 rounded-[18px]
          transition-all duration-300 ease-in-out
          overflow-hidden relative
        `}
      >
        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto sidebar-scroll">

          {/* ═══ SECTION 1 — LAYERS ═══ */}
          <div className="px-3 pt-4 pb-2">
            {!collapsed && (
              <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3"
                  style={{ color: '#00E5FF' }}>
                Layers
              </h2>
            )}

            <ul className="flex flex-col gap-1">
              {LAYERS.map(layer => (
                <li key={layer.id}>
                  {collapsed ? (
                    <button
                      onClick={() => toggleLayer(layer.id)}
                      title={layer.label}
                      className={`
                        w-full flex items-center justify-center py-1.5 rounded-lg
                        transition-colors text-base
                        ${checked[layer.id]
                          ? 'text-brand-cyan'
                          : 'text-white/25 hover:text-white/40'}
                      `}
                    >
                      {layer.icon}
                    </button>
                  ) : (
                    <label
                      className="flex items-center gap-2.5 py-1 px-1 rounded-lg
                                 cursor-pointer group hover:bg-white/5 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checked[layer.id]}
                        onChange={() => toggleLayer(layer.id)}
                        className="sidebar-checkbox"
                      />
                      <span className={`
                        text-[11px] font-medium leading-tight transition-colors
                        ${checked[layer.id] ? 'text-gray-200' : 'text-white/30'}
                      `}>
                        {layer.label}
                      </span>
                    </label>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* ═══ SECTION 2 — SATELLITE SOURCES ═══ */}
          <div className="px-3 pt-4 pb-2 border-t border-white/5">
            {!collapsed && (
              <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3"
                  style={{ color: '#00E5FF' }}>
                Satellite Sources
              </h2>
            )}

            <div className={`flex flex-wrap gap-1.5 ${collapsed ? 'flex-col items-center' : ''}`}>
              {SOURCES.map(src => (
                collapsed ? (
                  <span
                    key={src.id}
                    title={src.label}
                    className="text-base py-1 flex justify-center"
                  >
                    {src.icon}
                  </span>
                ) : (
                  <span
                    key={src.id}
                    className="
                      inline-flex items-center gap-1 px-2 py-0.5
                      rounded-full text-[10px] font-medium
                      bg-white/10 border border-cyan-400/30
                      text-cyan-300/80
                      transition-all duration-200
                      hover:border-cyan-400/60 hover:bg-cyan-400/10
                      cursor-default
                    "
                    style={{ boxShadow: '0 0 6px rgba(0,229,255,0.08)' }}
                  >
                    <span className="text-[11px]">{src.icon}</span>
                    {src.label}
                  </span>
                )
              ))}
            </div>
          </div>

          {/* ═══ SECTION 3 — TIMELINE ═══ */}
          <div className="px-3 pt-4 pb-6 border-t border-white/5">
            {!collapsed && (
              <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase mb-4"
                  style={{ color: '#00E5FF' }}>
                Timeline
              </h2>
            )}

            {collapsed ? (
              <div className="flex justify-center mt-2">
                <span
                  className="font-mono text-[10px] font-bold"
                  style={{ color: '#00E5FF', writingMode: 'vertical-rl' }}
                >
                  {activeYear}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div
                  className="font-mono text-xl font-bold tracking-widest"
                  style={{ color: '#00E5FF', textShadow: '0 0 14px rgba(0,229,255,0.5)' }}
                >
                  {activeYear}
                </div>

                <div className="flex items-center gap-3 w-full justify-center">
                  <div className="flex flex-col items-end justify-between h-[160px] text-[10px] font-mono text-white/40 select-none">
                    <span>2026</span>
                    <span>2016</span>
                  </div>

                  <div className="relative h-[160px] flex items-center justify-center">
                    <input
                      type="range"
                      min={2016}
                      max={2026}
                      step={1}
                      value={sliderVal}
                      onChange={e => {
                        const raw = Number(e.target.value)
                        onYearChange(2026 - raw + 2016)
                      }}
                      className="timeline-slider"
                      style={{ height: 160, width: 160 }}
                    />
                  </div>

                  <div className="flex flex-col justify-between h-[160px]">
                    {Array.from({ length: 11 }, (_, i) => 2026 - i).map(y => (
                      <div
                        key={y}
                        className={`
                          h-px w-3 transition-colors
                          ${y === activeYear ? 'bg-brand-cyan' : 'bg-white/15'}
                        `}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {!collapsed && (
          <div className="shrink-0 border-t border-white/5 px-3 py-2">
            <span className="font-mono text-[9px] text-white/25">
              DATA EPOCH: <span style={{ color: '#00E5FF' }}>2016–2026</span>
            </span>
          </div>
        )}
      </aside>
    </div>
  )
}
