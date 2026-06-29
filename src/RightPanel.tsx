import { AnimatePresence, motion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ZoneData } from './CenterMapPanel'

type RightPanelTab = 'heat' | 'cool' | 'future'

interface RightPanelProps {
  selectedZone: ZoneData | null
  city: string
  activeScenario: string
  appliedInterventions: string[]
  onInterventionsChange: (ids: string[]) => void
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

const futureScenarioData = [
  { year: 2016, optimistic: 31.4, business: 33.2, worst: 35.7 },
  { year: 2017, optimistic: 31.8, business: 33.7, worst: 36.3 },
  { year: 2018, optimistic: 32.1, business: 34.2, worst: 36.8 },
  { year: 2019, optimistic: 32.4, business: 34.7, worst: 37.3 },
  { year: 2020, optimistic: 32.9, business: 35.2, worst: 37.9 },
  { year: 2021, optimistic: 33.3, business: 35.7, worst: 38.4 },
  { year: 2022, optimistic: 33.8, business: 36.2, worst: 39.0 },
  { year: 2023, optimistic: 34.4, business: 36.9, worst: 39.6 },
  { year: 2024, optimistic: 35.0, business: 37.5, worst: 40.2 },
  { year: 2025, optimistic: 35.6, business: 38.1, worst: 40.8 },
  { year: 2026, optimistic: 36.2, business: 38.8, worst: 41.5 },
  { year: 2030, optimistic: 37.8, business: 41.6, worst: 45.7 },
  { year: 2040, optimistic: 39.4, business: 44.8, worst: 49.3 },
  { year: 2050, optimistic: 40.7, business: 47.5, worst: 53.2 },
]

export function RightPanel({ selectedZone, city, activeScenario, appliedInterventions, onInterventionsChange }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<RightPanelTab>('heat')
  const [typedText, setTypedText] = useState('')
  const [displayedPredictedLST, setDisplayedPredictedLST] = useState(44.6)
  const [displayedCooling, setDisplayedCooling] = useState(0)
  const springPredicted = useSpring(displayedPredictedLST, { stiffness: 140, damping: 22 })
  const springCooling = useSpring(displayedCooling, { stiffness: 140, damping: 22 })
  const animatedPredictedText = useTransform(springPredicted, value => `${value.toFixed(1)}°C`)
  const animatedCoolingText = useTransform(springCooling, value => `Cooling: −${value.toFixed(1)}°C ↓`)

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
    return interventions.reduce((sum, item) => sum + (appliedInterventions.includes(item.id) ? item.cooling : 0), 0)
  }, [appliedInterventions])

  const totalCost = useMemo(() => {
    return interventions.reduce((sum, item) => sum + (appliedInterventions.includes(item.id) ? item.cost : 0), 0)
  }, [appliedInterventions])

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
  const zoneLabel = `${city} — Sector 12`

  const toggleIntervention = (id: string) => {
    onInterventionsChange(
      appliedInterventions.includes(id)
        ? appliedInterventions.filter(item => item !== id)
        : [...appliedInterventions, id],
    )
  }

  return (
    <aside className={`shrink-0 flex flex-col overflow-hidden border-l border-white/10 bg-white/5 backdrop-blur-lg transition-all duration-300 ${selectedZone ? 'w-80' : 'w-0'}`}>
      <motion.div initial={{ x: 320, opacity: 0 }} animate={{ x: 0, opacity: selectedZone ? 1 : 0 }} transition={{ type: 'spring', stiffness: 140, damping: 24 }} className={`h-full w-80 flex flex-col ${selectedZone ? 'pointer-events-auto' : 'pointer-events-none'}`}>
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
          <AnimatePresence mode="wait">
            {activeTab === 'heat' ? (
              <motion.div key="heat" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.2 }} className="tab-panel">
              {!selectedZone ? (
                <div className="flex h-full min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-gray-400">
                  Click a zone on the map to analyze
                </div>
              ) : (
                <>
                  <div className="interactive-card interactive-card rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-cyan">
                      {zoneLabel}
                    </div>
                    <div
                      className="mt-3 text-5xl font-semibold leading-none font-mono"
                      style={{ color: '#ff4d4d', textShadow: '0 0 12px #FF4444' }}
                    >
                      {tempValue}
                    </div>
                    <div className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${riskLabel === 'CRITICAL' ? 'animate-pulse bg-red-500/20 text-red-200' : 'bg-white/10 text-white/70'}`}>
                      {riskLabel}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="interactive-card rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Population</div>
                      <div className="mt-1 text-sm font-semibold font-mono text-white/80">13,400</div>
                    </div>
                    <div className="interactive-card rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Tree Cover</div>
                      <div className="mt-1 text-sm font-semibold font-mono text-white/80">6%</div>
                    </div>
                    <div className="interactive-card rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Impervious Surface</div>
                      <div className="mt-1 text-sm font-semibold font-mono text-white/80">89%</div>
                    </div>
                    <div className="interactive-card rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Building Density</div>
                      <div className="mt-1 text-sm font-semibold font-mono text-white/80">High</div>
                    </div>
                    <div className="interactive-card rounded-xl border border-white/10 bg-white/5 p-3 col-span-2">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Primary Cause</div>
                      <div className="mt-1 text-sm font-semibold font-mono text-white/80">Dense Concrete</div>
                    </div>
                    <div className="interactive-card rounded-xl border border-white/10 bg-white/5 p-3 col-span-2">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Secondary Cause</div>
                      <div className="mt-1 text-sm font-semibold font-mono text-white/80">Low Vegetation</div>
                    </div>
                    <div className="interactive-card rounded-xl border border-white/10 bg-white/5 p-3 col-span-2">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Confidence</div>
                      <div className="mt-1 text-sm font-semibold font-mono text-white/80">94%</div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                      <span>🤖</span>
                      <span>AI Analysis</span>
                    </div>
                    <div className="mt-3 text-sm leading-6 text-white/70">
                      {typedText}
                      <span className="ml-0.5 animate-pulse">|</span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ) : activeTab === 'cool' ? (
            <motion.div key="cool" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.2 }} className="tab-panel space-y-4">
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
                  const applied = appliedInterventions.includes(item.id)
                  return (
                    <div key={item.id} className="interactive-card rounded-2xl border border-white/10 bg-white/10 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.icon}</span>
                          <div>
                            <div className="text-sm font-semibold font-mono text-white/80">{item.name}</div>
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

              <div className="interactive-card rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="flex items-center justify-between text-sm text-white/80">
                  <span className="font-semibold">Live Simulation</span>
                  <span className="text-[11px] uppercase tracking-[0.25em] text-brand-cyan">{appliedInterventions.length > 0 ? 'Active' : 'Baseline'}</span>
                </div>
                <div className="mt-3 text-[11px] uppercase tracking-[0.24em] text-white/45">Current LST</div>
                <div className="text-3xl font-semibold font-mono text-white/80">44.6°C</div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.24em] text-white/45">Predicted LST</div>
                <motion.div className="text-3xl font-semibold font-mono text-brand-cyan" animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 180, damping: 20 }}>{animatedPredictedText.get()}</motion.div>
                <motion.div className="mt-3 text-sm font-semibold font-mono text-emerald-300" animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>{animatedCoolingText.get()}</motion.div>
                <div className="mt-2 text-[11px] text-white/55">Confidence: 93%</div>
              </div>

              <div className="interactive-card rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="mb-2 flex items-center justify-between text-sm text-white/80">
                  <span className="font-semibold">Budget Calculator</span>
                  <span className="text-[11px] text-brand-orange">₹50 Cr</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div className="h-full rounded-full bg-brand-orange" animate={{ width: `${budgetPct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
                </div>
                <div className="mt-2 text-[11px] text-gray-300">Used ₹{budgetUsed.toFixed(1)} Cr / Remaining ₹{budgetRemaining.toFixed(1)} Cr</div>
              </div>

              <div className="interactive-card rounded-2xl border border-white/10 bg-white/10 p-4">
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
            </motion.div>
          ) : (
            <motion.div key="future" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.2 }} className="tab-panel space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-cyan">
                  Future Heat
                </div>
                <div className="mt-3 text-sm text-gray-300">
                  Forecasted LST pathways for the selected zone across optimistic, business-as-usual, and worst-case scenarios.
                </div>
              </div>

              <div className="interactive-card rounded-2xl border border-white/10 bg-black/20 p-3 backdrop-blur">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-cyan">Scenario Trends</div>
                  <div className="flex gap-3 text-[10px] text-gray-300">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Optimistic</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-brand-orange" /> BAU</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Worst Case</span>
                  </div>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={futureScenarioData}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)' }} />
                      <Line type="monotone" dataKey="optimistic" stroke={activeScenario === '2030' || activeScenario === '2040' || activeScenario === '2050' ? '#4ADE80' : '#4ADE80'} strokeWidth={activeScenario === 'Current' ? 2 : 3} dot={{ r: 3 }} animationDuration={900} />
                      <Line type="monotone" dataKey="business" stroke="#FF6B35" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" animationDuration={900} />
                      <Line type="monotone" dataKey="worst" stroke="#FF4444" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="3 3" animationDuration={900} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </motion.div>
    </aside>
  )
}
