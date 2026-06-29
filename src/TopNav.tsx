import { useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────
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

// ── Helpers ────────────────────────────────────────────────────────────────
const CITIES: City[]     = ['Bengaluru', 'Delhi', 'Mumbai', 'Chennai', 'Hyderabad']
const LAYERS: Layer[]    = ['LST', 'NDVI', 'LULC']
const SCENARIOS: Scenario[] = ['Current', '2030', '2040', '2050']

/** Convert slider value (6–18) to a human-readable AM/PM string */
function formatTime(val: number): string {
  const h = val % 12 || 12
  const ampm = val < 12 ? 'AM' : val === 12 ? 'PM' : 'PM'
  return `${h}:00 ${ampm}`
}

/** Percentage position of the sun icon along the track */
function sunPct(val: number): number {
  return ((val - 6) / (18 - 6)) * 100
}

// ── Component ──────────────────────────────────────────────────────────────
export function TopNav({ state, onChange }: TopNavProps) {
  return (
    <header className="h-14 shrink-0 glass-card flex items-center px-4 gap-3 relative overflow-visible">

      {/* ── LEFT: Brand ── */}
      <div className="flex items-center gap-2 shrink-0 mr-2">
        <span className="text-xl leading-none select-none">🛰</span>
        <h1
          className="text-[15px] font-bold tracking-tight leading-none whitespace-nowrap"
          style={{ color: '#00E5FF', textShadow: '0 0 12px rgba(0,229,255,0.4)' }}
        >
          Urban Heat Digital Twin
        </h1>
      </div>

      {/* ── DIVIDER ── */}
      <div className="h-7 w-px bg-white/10 shrink-0" />

      {/* ── CENTER: Controls ── */}
      <div className="flex items-center gap-3 flex-1 min-w-0">

        {/* City Selector */}
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
          {/* custom chevron */}
          <svg
            className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-white/40"
            width="10" height="10" viewBox="0 0 10 10" fill="none"
          >
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Date Picker */}
        <input
          id="date-picker"
          type="date"
          value={state.date}
          onChange={e => onChange({ date: e.target.value })}
          className="nav-input text-xs font-mono py-1.5 px-2.5 rounded-lg cursor-pointer w-[130px]"
        />

        {/* ── Time Slider ── */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-white/40 font-mono">6AM</span>
          <div className="relative flex flex-col items-center w-[100px]">
            {/* Sun emoji that moves */}
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
          <span className="text-[10px] text-white/40 font-mono">6PM</span>
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{ color: '#00E5FF', background: 'rgba(0,229,255,0.08)' }}
          >
            {formatTime(state.time)}
          </span>
        </div>

        {/* ── Vertical divider ── */}
        <div className="h-7 w-px bg-white/10 shrink-0" />

        {/* ── Satellite Layer Toggles ── */}
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
                        color: 'rgba(255,255,255,0.4)',
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

        {/* ── Vertical divider ── */}
        <div className="h-7 w-px bg-white/10 shrink-0" />

        {/* ── Climate Scenario Pills ── */}
        <div className="flex items-center gap-1 shrink-0">
          {SCENARIOS.map(s => {
            const active = state.scenario === s
            return (
              <button
                key={s}
                onClick={() => onChange({ scenario: s })}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all duration-200"
                style={
                  active
                    ? {
                        color: '#0B1220',
                        background: '#00E5FF',
                        borderColor: '#00E5FF',
                        boxShadow: '0 0 12px rgba(0,229,255,0.6)',
                      }
                    : {
                        color: 'rgba(255,255,255,0.4)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)',
                      }
                }
              >
                {s}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="h-7 w-px bg-white/10 shrink-0" />

      {/* ── RIGHT: Avatar ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
          <span className="text-[10px] font-mono text-white/30 hidden xl:block">LIVE</span>
        </div>
        {/* Avatar */}
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

// ── Re-export state type so App.tsx can import it ──────────────────────────
export type { TopNavState }
