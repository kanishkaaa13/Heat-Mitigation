import { motion } from 'framer-motion'

// TopNav.tsx — top navigation bar for Urban Heat Digital Twin

type City = 'Bengaluru' | 'Delhi' | 'Mumbai' | 'Chennai' | 'Hyderabad'
type Layer = 'LST' | 'NDVI' | 'LULC'
type Scenario = 'Current' | '2030' | '2040' | '2050'

interface TopNavState {
  city: City
  date: string
  time: number
  layer: Layer
  scenario: Scenario
}

interface TopNavProps {
  state: TopNavState
  onChange: (patch: Partial<TopNavState>) => void
}

const CITIES: City[] = ['Bengaluru', 'Delhi', 'Mumbai', 'Chennai', 'Hyderabad']
const LAYERS: Layer[] = ['LST', 'NDVI', 'LULC']
const SCENARIOS: Scenario[] = ['Current', '2030', '2040', '2050']

function formatTime(val: number): string {
  const h = val % 12 || 12
  return `${h}:00 ${val < 12 ? 'AM' : 'PM'}`
}

function sunPct(val: number): number {
  return ((val - 6) / (18 - 6)) * 100
}

export function TopNav({ state, onChange }: TopNavProps) {
  const activeScenarioIndex = SCENARIOS.indexOf(state.scenario)

  return (
    <header className="h-14 shrink-0 glass-card flex items-center px-4 gap-3 relative overflow-visible">
      <div className="flex items-center gap-2 shrink-0 mr-2">
        <span className="text-xl leading-none select-none">🛰</span>
        <h1
          className="text-[15px] font-bold tracking-tight leading-none whitespace-nowrap"
          style={{ color: '#00E5FF', textShadow: '0 0 12px rgba(0,229,255,0.4)' }}
        >
          Urban Heat Digital Twin
        </h1>
      </div>

      <div className="h-7 w-px bg-white/10 shrink-0" />

      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative shrink-0">
          <select
            id="city-selector"
            value={state.city}
            onChange={e => onChange({ city: e.target.value as City })}
            className="nav-select text-xs font-medium pr-6 pl-2.5 py-1.5 rounded-lg appearance-none cursor-pointer"
          >
            {CITIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-white/40"
            width="10" height="10" viewBox="0 0 10 10" fill="none"
          >
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <input
          id="date-picker"
          type="date"
          value={state.date}
          onChange={e => onChange({ date: e.target.value })}
          className="nav-input text-xs font-mono py-1.5 px-2.5 rounded-lg cursor-pointer w-[130px]"
        />

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-white/60 font-mono">6AM</span>
          <div className="relative flex flex-col items-center w-[100px]">
            <div
              className="absolute -top-4 text-sm pointer-events-none transition-all duration-150 select-none"
              style={{ left: `calc(${sunPct(state.time)}% - 8px)` }}
            >
              ☀️
            </div>
            <input
              id="time-slider"
              type="range"
              min={6}
              max={18}
              step={1}
              value={state.time}
              onChange={e => onChange({ time: Number(e.target.value) })}
              className="nav-slider w-full"
            />
          </div>
          <span className="text-[10px] text-white/60 font-mono">6PM</span>
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{ color: '#00E5FF', background: 'rgba(0,229,255,0.08)' }}
          >
            {formatTime(state.time)}
          </span>
        </div>

        <div className="h-7 w-px bg-white/10 shrink-0" />

        <div className="flex items-center gap-1 shrink-0">
          {LAYERS.map(l => {
            const active = state.layer === l
            return (
              <button
                key={l}
                onClick={() => onChange({ layer: l })}
                className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full border transition-all duration-200"
                style={
                  active
                    ? {
                        color: '#00E5FF',
                        borderColor: '#00E5FF',
                        background: 'rgba(0,229,255,0.08)',
                        boxShadow: '0 0 8px #00E5FF, inset 0 0 6px rgba(0,229,255,0.1)',
                      }
                    : {
                        color: 'rgba(255,255,255,0.55)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)',
                      }
                }
              >
                {l}
              </button>
            )
          })}
        </div>

        <div className="h-7 w-px bg-white/10 shrink-0" />

        <div className="relative flex items-center gap-1 shrink-0 rounded-full border border-white/10 bg-white/5 p-1">
          <motion.div
            layout
            className="absolute inset-y-1 rounded-full border border-cyan-400/40 bg-cyan-400/10"
            animate={{ x: activeScenarioIndex * 62, width: 56 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          />
          {SCENARIOS.map(s => {
            const active = state.scenario === s
            return (
              <button
                key={s}
                onClick={() => onChange({ scenario: s })}
                className="relative z-10 flex h-7 w-[56px] items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-200"
                style={active ? { color: '#08111E' } : { color: 'rgba(255,255,255,0.55)' }}
              >
                {s}
              </button>
            )
          })}
        </div>
      </div>

      <div className="h-7 w-px bg-white/10 shrink-0" />

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(248,113,113,0.8)] animate-pulse" />
          <span className="hidden text-[10px] font-mono font-semibold uppercase tracking-[0.25em] text-white/70 xl:block">LIVE</span>
        </div>
        <button
          id="user-avatar"
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 border transition-all duration-200"
          style={{
            color: '#00E5FF',
            borderColor: 'rgba(0,229,255,0.35)',
            background: 'rgba(0,229,255,0.08)',
            boxShadow: '0 0 10px rgba(0,229,255,0.15)',
          }}
          title="User: SP"
        >
          SP
        </button>
      </div>
    </header>
  )
}

export type { TopNavState }
