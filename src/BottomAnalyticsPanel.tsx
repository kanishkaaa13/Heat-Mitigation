import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const temperatureData = [
  { year: '2015', lst: 38.2 },
  { year: '2016', lst: 38.6 },
  { year: '2017', lst: 39.1 },
  { year: '2018', lst: 39.8 },
  { year: '2019', lst: 40.3 },
  { year: '2020', lst: 40.9 },
  { year: '2021', lst: 41.2 },
  { year: '2022', lst: 41.7 },
  { year: '2023', lst: 42.1 },
  { year: '2024', lst: 42.6 },
  { year: '2025', lst: 43.1 },
  { year: '2026', lst: 43.6 },
]

const rainfallData = [
  { year: '2015', rainfall: 58, lst: 38.2 },
  { year: '2016', rainfall: 61, lst: 38.6 },
  { year: '2017', rainfall: 54, lst: 39.1 },
  { year: '2018', rainfall: 62, lst: 39.8 },
  { year: '2019', rainfall: 57, lst: 40.3 },
  { year: '2020', rainfall: 49, lst: 40.9 },
  { year: '2021', rainfall: 64, lst: 41.2 },
  { year: '2022', rainfall: 51, lst: 41.7 },
  { year: '2023', rainfall: 47, lst: 42.1 },
  { year: '2024', rainfall: 59, lst: 42.6 },
  { year: '2025', rainfall: 45, lst: 43.1 },
  { year: '2026', rainfall: 52, lst: 43.6 },
]

const coolingData = [
  { name: 'Trees', value: 28, color: '#34D399' },
  { name: 'Cool Roofs', value: 22, color: '#38BDF8' },
  { name: 'Water', value: 19, color: '#22D3EE' },
  { name: 'Roads', value: 13, color: '#FB923C' },
]

const vulnerabilityData = [
  { year: '2015', historical: 18, current: 24, predicted: 28 },
  { year: '2018', historical: 21, current: 28, predicted: 33 },
  { year: '2021', historical: 24, current: 31, predicted: 37 },
  { year: '2024', historical: 27, current: 35, predicted: 41 },
  { year: '2026', historical: 30, current: 39, predicted: 45 },
]

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-[16px] border border-white/10 bg-black/20 p-2 backdrop-blur">
      <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-300">{title}</div>
      <div className="min-h-0 flex-1">
        {children}
      </div>
    </div>
  )
}

export function BottomAnalyticsPanel() {
  return (
    <div className="flex flex-1 gap-2 overflow-x-auto p-3">
      <ChartCard title="Temperature Trend">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={temperatureData}>
            <defs>
              <linearGradient id="lstFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#00E5FF" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="lst" stroke="#00E5FF" strokeWidth={2} fill="url(#lstFill)" animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Rainfall vs LST">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rainfallData}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar yAxisId="left" dataKey="rainfall" fill="#FF6B35" radius={[4, 4, 0, 0]} animationDuration={800} />
            <Line yAxisId="right" type="monotone" dataKey="lst" stroke="#00E5FF" strokeWidth={2} dot={false} animationDuration={800} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Cooling Contribution">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={coolingData} dataKey="value" innerRadius={34} outerRadius={48} paddingAngle={2} animationDuration={800}>
              {coolingData.map(entry => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="relative -mt-16 mb-2 flex justify-center">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">Total Cooling</div>
            <div className="text-sm font-semibold text-brand-cyan">4.2°C</div>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="Heat Vulnerability Timeline">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={vulnerabilityData}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)' }} />
            <Bar dataKey="historical" stackId="a" fill="#64748B" radius={[3, 3, 0, 0]} animationDuration={800} />
            <Bar dataKey="current" stackId="a" fill="#FF6B35" animationDuration={800} />
            <Bar dataKey="predicted" stackId="a" fill="#FF4444" animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
