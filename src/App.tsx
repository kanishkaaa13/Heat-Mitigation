import { useState } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Map, 
  Activity, 
  Layers, 
  Settings, 
  Thermometer, 
  HelpCircle,
  Menu
} from 'lucide-react'

function App() {
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false)

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0B1220] text-gray-200 overflow-hidden font-sans p-2 gap-2 box-border">
      
      {/* TOP NAV BAR (h-14) */}
      <header className="h-14 shrink-0 glass-card flex items-center justify-between px-4 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-orange to-brand-cyan flex items-center justify-center text-space-navy font-bold text-lg font-mono shadow-[0_0_15px_rgba(0,229,255,0.4)]">
            U
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              Urban Heat Digital Twin
            </h1>
          </div>
        </div>

        {/* TOP NAV label and badge */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono font-medium">
            TOP NAV
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-xs font-bold px-3 py-1 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-full tracking-wide shadow-[0_0_10px_rgba(0,229,255,0.1)]">
            ISRO BAH 2026 — Urban Heat Mitigation
          </span>
        </div>
      </header>

      {/* MIDDLE CONTENT SECTION */}
      <div className="flex-1 flex gap-2 overflow-hidden min-h-0">
        
        {/* LEFT SIDEBAR (w-64) */}
        <aside 
          className={`
            ${isLeftCollapsed ? 'w-16' : 'w-64'} 
            shrink-0 
            glass-card 
            transition-all 
            duration-300 
            ease-in-out 
            flex 
            flex-col 
            overflow-hidden 
            relative
          `}
        >
          {/* Header/Toggle area inside Left Sidebar */}
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            {!isLeftCollapsed && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono font-medium">
                LEFT SIDEBAR
              </span>
            )}
            {isLeftCollapsed && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono font-medium mx-auto">
                LS
              </span>
            )}
            <button 
              onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
              className="p-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-cyan/30 text-gray-400 hover:text-brand-cyan transition-colors"
              title={isLeftCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isLeftCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Sidebar Menu Placeholders */}
          <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-brand-cyan/20 text-brand-cyan">
              <Map size={18} />
              {!isLeftCollapsed && <span className="text-sm font-medium">Visualizer Map</span>}
            </div>
            
            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 text-gray-400 hover:text-gray-200 transition-all cursor-pointer">
              <Activity size={18} />
              {!isLeftCollapsed && <span className="text-sm font-medium">Mitigation Plan</span>}
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 text-gray-400 hover:text-gray-200 transition-all cursor-pointer">
              <Layers size={18} />
              {!isLeftCollapsed && <span className="text-sm font-medium">Thermal Layers</span>}
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 text-gray-400 hover:text-gray-200 transition-all cursor-pointer">
              <Settings size={18} />
              {!isLeftCollapsed && <span className="text-sm font-medium">Configuration</span>}
            </div>
          </div>

          {/* Footer Area of Sidebar */}
          <div className="p-3 border-t border-white/5 flex items-center justify-center">
            {!isLeftCollapsed ? (
              <div className="text-[10px] text-gray-500 text-center font-mono">
                SYSTEM VER: <span className="text-brand-cyan">1.0.0-BETA</span>
              </div>
            ) : (
              <HelpCircle size={14} className="text-gray-500" />
            )}
          </div>
        </aside>

        {/* CENTER MAP (flex-1) */}
        <main className="flex-1 glass-card flex flex-col relative overflow-hidden">
          <div className="absolute top-4 left-4 z-10 bg-[#0B1220]/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 text-xs text-brand-cyan font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></span>
            ACTIVE TWIN AREA: BENGALURU
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4">
            <div className="w-16 h-16 rounded-full bg-brand-cyan/5 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-[0_0_20px_rgba(0,229,255,0.15)]">
              <Map size={32} />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold tracking-wide text-white">CENTER MAP</h2>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Interactive spatial viewer. Rendering thermal layers, surface temperature indices, and ISRO satellite imagery overlay.
              </p>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 text-[10px] text-white/30 font-mono">
            COORDS: 12.9716° N, 77.5946° E
          </div>
        </main>

        {/* RIGHT PANEL (w-80) */}
        <aside className="w-80 shrink-0 glass-card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono font-medium">
              RIGHT PANEL
            </span>
            <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
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

      {/* BOTTOM PANEL (h-52) */}
      <footer className="h-52 shrink-0 glass-card flex flex-col overflow-hidden">
        <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono font-medium">
            BOTTOM ANALYTICS
          </span>
          <div className="flex gap-4 font-mono text-[10px] text-gray-400">
            <div>UHI INTENSITY: <span className="text-brand-orange font-bold font-mono">3.4°C</span></div>
            <div>ALBEDO AVG: <span className="text-brand-cyan font-bold font-mono">0.18</span></div>
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
