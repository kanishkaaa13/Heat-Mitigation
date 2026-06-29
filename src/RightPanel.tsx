import { useEffect, useState } from 'react'
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

export function RightPanel({ selectedZone }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<RightPanelTab>('heat')
  const [typedText, setTypedText] = useState('')

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

  const riskLabel = selectedZone?.riskLevel?.toUpperCase() ?? 'NO DATA'
  const tempValue = selectedZone ? `${selectedZone.temperature.toFixed(1)}°C` : '—'
  const zoneLabel = 'Zone A — Sector 12'

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
            <div className="tab-panel rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-cyan">
                AI Cooling Planner
              </div>
              <div className="mt-3 text-sm text-gray-300">
                Priority actions: add tree belts, install cool roofs, and expand permeable surfaces to reduce local heat gain.
              </div>
              <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-100">
                Estimated cooling impact: −1.9°C within 300m of intervention.
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
