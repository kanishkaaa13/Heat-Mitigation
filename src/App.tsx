import { useState } from 'react'
import { TopNav, type TopNavState } from './TopNav'
import { LeftSidebar } from './LeftSidebar'
import { CenterMapPanel } from './CenterMapPanel'
import { RightPanel } from './RightPanel'
import { BottomAnalyticsPanel } from './BottomAnalyticsPanel'
import { AiChatAssistant } from './AiChatAssistant'

const todayISO = new Date().toISOString().slice(0, 10)

type ZoneSelection = { zoneName: string; temperature: number; riskLevel: 'Low' | 'Moderate' | 'Critical' }

const cityStats: Record<string, { avgLst: string; airTemp: string; humidity: string; wind: string; heatIndex: string }> = {
  Bengaluru: { avgLst: '41.2°C', airTemp: '38.4°C', humidity: '62%', wind: '3.1 m/s', heatIndex: '47°C' },
  Delhi: { avgLst: '43.8°C', airTemp: '41.6°C', humidity: '48%', wind: '2.4 m/s', heatIndex: '49°C' },
  Mumbai: { avgLst: '35.9°C', airTemp: '33.8°C', humidity: '74%', wind: '4.2 m/s', heatIndex: '39°C' },
  Chennai: { avgLst: '39.4°C', airTemp: '36.9°C', humidity: '68%', wind: '3.7 m/s', heatIndex: '44°C' },
  Hyderabad: { avgLst: '40.7°C', airTemp: '38.1°C', humidity: '57%', wind: '2.8 m/s', heatIndex: '46°C' },
}

function App() {
  const [activeYear, setActiveYear] = useState(2026)
  const [navState, setNavState] = useState<TopNavState>({
    city: 'Bengaluru',
    date: todayISO,
    time: 12,
    layer: 'LST',
    scenario: 'Current',
  })
  const [builderTool, setBuilderTool] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<ZoneSelection | null>(null)
  const [appliedInterventions, setAppliedInterventions] = useState<string[]>([])

  const handleNavChange = (patch: Partial<TopNavState>) =>
    setNavState(prev => ({ ...prev, ...patch }))

  const handleZoneClick = (zone: ZoneSelection) => {
    setSelectedZone(zone)
  }

  const builderActive = Boolean(builderTool)
  const currentStats = cityStats[navState.city] ?? cityStats.Bengaluru

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0B1220] text-gray-200 overflow-hidden font-sans p-2 gap-2 box-border">
      <TopNav state={navState} onChange={handleNavChange} />

      <div className="flex-1 flex gap-2 overflow-hidden min-h-0">
        <LeftSidebar activeYear={activeYear} onYearChange={setActiveYear} />

        <main className="flex-1 glass-card relative overflow-hidden">
          <CenterMapPanel
            activeYear={activeYear}
            city={navState.city}
            layer={navState.layer}
            scenario={navState.scenario}
            builderActive={builderActive}
            selectedTool={builderTool}
            onToolSelect={setBuilderTool}
            onZoneClick={handleZoneClick}
            stats={currentStats}
          />
        </main>

        <RightPanel
          selectedZone={selectedZone}
          activeScenario={navState.scenario}
          appliedInterventions={appliedInterventions}
          onInterventionsChange={setAppliedInterventions}
        />
      </div>

      <footer className="h-52 shrink-0 glass-card flex flex-col overflow-hidden">
        <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono font-medium">
            BOTTOM ANALYTICS
          </span>
          <div className="flex gap-4 font-mono text-[10px] text-white/60">
            <div>UHI INTENSITY: <span className="text-brand-orange font-bold">3.4°C</span></div>
            <div>ALBEDO AVG: <span className="text-brand-cyan font-bold">0.18</span></div>
          </div>
        </div>
        <BottomAnalyticsPanel />
      </footer>

      <AiChatAssistant />
    </div>
  )
}

export default App
