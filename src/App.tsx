import { useState } from 'react'
import {
  Activity,
  Settings,
} from 'lucide-react'
import { TopNav, type TopNavState } from './TopNav'
import { LeftSidebar } from './LeftSidebar'
import { CenterMapPanel } from './CenterMapPanel'

// Today's date in YYYY-MM-DD for the default date picker value
const todayISO = new Date().toISOString().slice(0, 10)

function App() {
  // ── Left Sidebar Timeline state ──────────────────────────────────────────
  const [activeYear, setActiveYear] = useState(2026)

  // ── Top Nav state ──────────────────────────────────────────────────────
  const [navState, setNavState] = useState<TopNavState>({
    city:     'Bengaluru',
    date:     todayISO,
    time:     12,          // noon
    layer:    'LST',
    scenario: 'Current',
  })

  const handleNavChange = (patch: Partial<TopNavState>) =>
    setNavState(prev => ({ ...prev, ...patch }))

  const handleZoneClick = (zone: { zoneName: string; temperature: number; riskLevel: 'Low' | 'Moderate' | 'Critical' }) => {
    console.info('Zone selected:', zone)
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0B1220] text-gray-200 overflow-hidden font-sans p-2 gap-2 box-border">

      {/* ── TOP NAV BAR ─────────────────────────────────────────────────── */}
      <TopNav state={navState} onChange={handleNavChange} />

      {/* ── MIDDLE CONTENT ──────────────────────────────────────────────── */}
      <div className="flex-1 flex gap-2 overflow-hidden min-h-0">

        {/* LEFT SIDEBAR */}
        <LeftSidebar activeYear={activeYear} onYearChange={setActiveYear} />

        {/* CENTER MAP */}
        <main className="flex-1 glass-card relative overflow-hidden">
          <CenterMapPanel
            activeYear={activeYear}
            city={navState.city}
            layer={navState.layer}
            scenario={navState.scenario}
            onZoneClick={handleZoneClick}
          />
        </main>

        {/* RIGHT PANEL */}
        <aside className="w-80 shrink-0 glass-card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono font-medium">
              RIGHT PANEL
            </span>
            <span className="w-2 h-2 rounded-full bg-brand-orange" />
          </div>
          <div className="flex-1 p-4 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-orange/5 border border-brand-orange/20 flex items-center justify-center text-brand-orange shadow-[0_0_20px_rgba(255,107,53,0.15)]">
              <Settings size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-semibold tracking-wide text-white">RIGHT PANEL</h3>
              <p className="text-[11px] text-gray-400 mt-1 px-4">
                Controls panel for overlay metrics, parameters adjustments, and simulation scenarios.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* ── BOTTOM PANEL ────────────────────────────────────────────────── */}
      <footer className="h-52 shrink-0 glass-card flex flex-col overflow-hidden">
        <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono font-medium">
            BOTTOM ANALYTICS
          </span>
          <div className="flex gap-4 font-mono text-[10px] text-gray-400">
            <div>UHI INTENSITY: <span className="text-brand-orange font-bold">3.4°C</span></div>
            <div>ALBEDO AVG: <span className="text-brand-cyan font-bold">0.18</span></div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center gap-3 p-4">
          <div className="w-12 h-12 rounded-full bg-brand-cyan/5 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
            <Activity size={24} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">BOTTOM ANALYTICS</h3>
            <p className="text-xs text-gray-400 mt-0.5 max-w-xl">
              Temporal analysis chart shell. Displays heat stress indices, simulated microclimate variations, and historic urban land surface temperature (LST) trends.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
