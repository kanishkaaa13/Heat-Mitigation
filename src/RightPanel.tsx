import { useEffect, useMemo, useState } from 'react'
import type { ZoneData } from './CenterMapPanel'

type RightPanelTab = 'heat' | 'cool' | 'future'

interface RightPanelProps {
  selectedZone: ZoneData | null
}

const tabs: Array<{ id: RightPanelTab; label: string; icon: string }> = [
  { id: 'heat', label: 'Heat Doctor', icon: '🩺' },
  { id: 'cool', label: 'AI Cooling Planner', icon: '🌿' },
  { id: 'future', label: 'Future Heat', icon: '🔮' },
]

const interventions = [
  { id: 'tree', icon: '🌳', name: 'Tree Cover', cooling: 2.3, cost: 4.2 },
  { id: 'roof', icon: '🏠', name: 'Cool Roofs', cooling: 1.8, cost: 6.8 },
  { id: 'road', icon: '🟦', name: 'Reflective Roads', cooling: 1.2, cost: 3.1 },
  { id: 'water', icon: '💧', name: 'Water Body', cooling: 0.9, cost: 9.5 },
]

export function RightPanel({ selectedZone }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<RightPanelTab>('heat')
  const [typedText, setTypedText] = useState('')
  const [appliedIds, setAppliedIds] = useState<string[]>([])
  const [displayedPredictedLST, setDisplayedPredictedLST] = useState(44.6)
  const [displayedCooling, setDisplayedCooling] = useState(0)

  useEffect(() => {
    if (!selectedZone) {
      setTypedText('')
      return
    }

    const fullText = `This hotspot is driven by high building density, minimal vegetation, and dark asphalt that absorbs solar radiation. LST is 6.2°C above the city average.`
    setTypedText('')

    let index = 0
    const interval = window.setInterval(() => {
      setTypedText(fullText.slice(0, index + 1))
      index += 1
      if (index >= fullText.length) {
        window.clearInterval(interval)
      }
    }, 30)

    return () => window.clearInterval(interval)
  }, [selectedZone])

  const totalCooling = useMemo(() => {
    return interventions.reduce((sum, item) => sum + (appliedIds.includes(item.id) ? item.cooling : 0), 0)
  }, [appliedIds])

  const totalCost = useMemo(() => {
    return interventions.reduce((sum, item) => sum + (appliedIds.includes(item.id) ? item.cost : 0), 0)
  }, [appliedIds])

  const predictedLST = 44.6 - totalCooling
  const budgetUsed = totalCost
  const budgetRemaining = 50 - budgetUsed
  const budgetPct = Math.min(100, (budgetUsed / 50) * 100)

  useEffect(() => {
    const duration = 650
    const startLST = displayedPredictedLST
    const startCooling = displayedCooling
    const startTime = performance.now()

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setDisplayedPredictedLST(startLST + (predictedLST - startLST) * eased)
      setDisplayedCooling(startCooling + (totalCooling - startCooling) * eased)

      if (progress < 1) {
        window.requestAnimationFrame(animate)
      } else {
        setDisplayedPredictedLST(predictedLST)
        setDisplayedCooling(totalCooling)
      }
    }

    window.requestAnimationFrame(animate)
    return () => window.cancelAnimationFrame(animate as unknown as number)
  }, [predictedLST, totalCooling])

  const riskLabel = selectedZone?.riskLevel?.toUpperCase() ?? 'NO DATA'
  const tempValue = selectedZone ? `${selectedZone.temperature.toFixed(1)}°C` : '—'
  const zoneLabel = 'Zone A — Sector 12'

  const toggleIntervention = (id: string) => {
    setAppliedIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]))
  }

  return (
    <aside className={`shrink-0 flex flex-col overflow-hidden border-l border-white/10 bg-white/5 backdrop-blur-lg transition-all duration-300 ${selectedZone ? 'w-80' : 'w-0'}`}>
      <div className={`h-full w-80 flex flex-col transition-all duration-300 ${selectedZone ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'}`}>
        <div className="border-b border-white/10 p-4">
          <div className="flex gap-2">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition-all ${isActive ? 'bg-brand-cyan/15 text-brand-cyan shadow-[0_0_14px_rgba(0,229,255,0.18)]' : 'bg-white/5 text-white/55 hover:bg-white/10 hover:text-white/80'}`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'heat' ? (
            <div className="tab-panel">
              {!selectedZone ? (
                <div className="flex h-full min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-gray-400">
                  Click a zone on the map to analyze
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-cyan">
                      {zoneLabel}
                    </div>
                    <div
                      className="mt-3 text-5xl font-semibold leading-none"
                      style={{ color: '#ff4d4d', textShadow: '0 0 12px #FF4444' }}
                    >
                      {tempValue}
                    </div>
                    <div className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${riskLabel === 'CRITICAL' ? 'animate-pulse bg-red-500/20 text-red-200' : 'bg-white/10 text-white/70'}`}>
                      {riskLabel}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Population</div>
                      <div className="mt-1 text-sm font-semibold text-white">13,400</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Tree Cover</div>
                      <div className="mt-1 text-sm font-semibold text-white">6%</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Impervious Surface</div>
                      <div className="mt-1 text-sm font-semibold text-white">89%</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Building Density</div>
                      <div className="mt-1 text-sm font-semibold text-white">High</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 col-span-2">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Primary Cause</div>
                      <div className="mt-1 text-sm font-semibold text-white">Dense Concrete</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 col-span-2">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Secondary Cause</div>
                      <div className="mt-1 text-sm font-semibold text-white">Low Vegetation</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 col-span-2">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Confidence</div>
                      <div className="mt-1 text-sm font-semibold text-white">94%</div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <span>🤖</span>
                      <span>AI Analysis</span>
                    </div>
                    <div className="mt-3 text-sm leading-6 text-gray-300">
                      {typedText}
                      <span className="ml-0.5 animate-pulse">|</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : activeTab === 'cool' ? (
            <div className="tab-panel space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-cyan">
                  AI Cooling Planner
                </div>
                <div className="mt-2 text-sm text-gray-300">
                  Simulate interventions and estimate how much local heat can be reduced at the selected zone.
                </div>
              </div>

              <div className="max-h-[240px] space-y-2 overflow-y-auto pr-1">
                {interventions.map(item => {
                  const applied = appliedIds.includes(item.id)
                  return (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.icon}</span>
                          <div>
                            <div className="text-sm font-semibold text-white">{item.name}</div>
                            <div className="text-[11px] text-brand-cyan">Expected Cooling: −{item.cooling.toFixed(1)}°C</div>
                            <div className="text-[11px] text-brand-orange">Cost: ₹{item.cost.toFixed(1)} Cr</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleIntervention(item.id)}
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${applied ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200' : 'border-cyan-400/30 bg-transparent text-cyan-200 hover:bg-cyan-400/10'}`}
                        >
                          {applied ? 'Applied ✓' : 'Apply →'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="flex items-center justify-between text-sm text-white">
                  <span className="font-semibold">Live Simulation</span>
                  <span className="text-[11px] uppercase tracking-[0.25em] text-brand-cyan">{appliedIds.length > 0 ? 'Active' : 'Baseline'}</span>
                </div>
                <div className="mt-3 text-[11px] uppercase tracking-[0.24em] text-white/45">Current LST</div>
                <div className="text-3xl font-semibold text-white">44.6°C</div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.24em] text-white/45">Predicted LST</div>
                <div className="text-3xl font-semibold text-brand-cyan">{displayedPredictedLST.toFixed(1)}°C</div>
                <div className="mt-3 text-sm font-semibold text-emerald-300">Cooling: −{displayedCooling.toFixed(1)}°C ↓</div>
                <div className="mt-2 text-[11px] text-white/55">Confidence: 93%</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="mb-2 flex items-center justify-between text-sm text-white">
                  <span className="font-semibold">Budget Calculator</span>
                  <span className="text-[11px] text-brand-orange">₹50 Cr</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-brand-orange transition-all duration-700" style={{ width: `${budgetPct}%` }} />
                </div>
                <div className="mt-2 text-[11px] text-gray-300">Used ₹{budgetUsed.toFixed(1)} Cr / Remaining ₹{budgetRemaining.toFixed(1)} Cr</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-cyan">Ecosystem Benefits</div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-200">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-2">🌿 Carbon Storage: +420 tons</div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-2">🌊 Runoff Reduction: 28%</div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-2">🌫 PM2.5 Reduction: 11%</div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-2">😊 Human Comfort: +34%</div>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100">Powered by SOLWEIG</span>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100">InVEST</span>
              </div>
            </div>
          ) : (
            <div className="tab-panel rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-cyan">
                Future Heat
              </div>
              <div className="mt-3 text-sm text-gray-300">
                Under the 2050 projection, this corridor is likely to exceed the citywide heat threshold during peak afternoon hours.
              </div>
              <div className="mt-4 rounded-xl border border-orange-400/20 bg-orange-400/10 p-3 text-sm text-orange-100">
                Projected peak LST: 49.7°C by 2050 with current land-use patterns.
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
