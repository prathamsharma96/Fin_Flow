import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { dashboardApi } from '../api'
import { StatCard, Badge, Spinner, PageHeader, formatCurrency, formatDate } from '../components/ui'
import { useAuth } from '../context/AuthContext'

interface Summary {
  totalIncome: number
  totalExpense: number
  netBalance: number
  totalRecords: number
  recentRecords: Array<{
    id: string
    amount: number
    type: 'income' | 'expense'
    category: string
    date: string
    notes?: string
  }>
}

interface Trend {
  month: string
  income: number
  expense: number
}

interface Category {
  category: string
  type: string
  total: number
  count: number
}

export default function Dashboard() {
  const { isAnalyst } = useAuth()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [trends, setTrends] = useState<Trend[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sRes, cRes] = await Promise.all([
          dashboardApi.summary(),
          dashboardApi.categories(),
        ])
        setSummary(sRes.data.data)
        setCategories(cRes.data.data.slice(0, 6))

        if (isAnalyst) {
          const tRes = await dashboardApi.trends()
          setTrends(tRes.data.data)
        }
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [isAnalyst])

  if (loading) return <div className="p-8"><Spinner /></div>
  if (!summary) return null

  const now = new Date()
  const monthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div className="p-8">
      <PageHeader
        title="Dashboard"
        subtitle={`${monthLabel} — all accounts`}
        action={
          <div className="flex items-center gap-2 bg-blue-950 text-blue-400 text-xs px-3 py-1.5 rounded-full border border-blue-900">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Live data
          </div>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total income"
          value={formatCurrency(summary.totalIncome)}
          change="from all records"
          changeUp
          iconBg="bg-emerald-950"
          icon={<svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 14 14"><path d="M7 11V3M3 7l4-4 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        />
        <StatCard
          label="Total expenses"
          value={formatCurrency(summary.totalExpense)}
          change="from all records"
          changeUp={false}
          iconBg="bg-red-950"
          icon={<svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 14 14"><path d="M7 3v8M3 7l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        />
        <StatCard
          label="Net balance"
          value={formatCurrency(summary.netBalance)}
          change={summary.netBalance >= 0 ? 'positive balance' : 'negative balance'}
          changeUp={summary.netBalance >= 0}
          iconBg="bg-indigo-950"
          icon={<svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 14 14"><rect x="1" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M5 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.2" /></svg>}
        />
        <StatCard
          label="Total records"
          value={summary.totalRecords.toString()}
          change="all time"
          changeUp
          iconBg="bg-purple-950"
          icon={<svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 14 14"><path d="M2 2h10v10H2z" stroke="currentColor" strokeWidth="1.2" rx="1" /><path d="M4 6h6M4 8.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {/* Trend chart */}
        {isAnalyst && trends.length > 0 && (
          <div className="card xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200">Monthly trend</h2>
              <span className="text-xs text-slate-500 bg-dark-600 px-2 py-1 rounded-lg">Last 6 months</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={trends} barSize={14} barGap={4}>
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#13151f', border: '1px solid #2d2d3a', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(v: number) => [formatCurrency(v)]}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: '#64748b' }} />
                <Bar dataKey="income" fill="#6366f1" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#374151" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Categories */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">By category</h2>
            <span className="text-xs text-slate-500 bg-dark-600 px-2 py-1 rounded-lg">All time</span>
          </div>
          <div className="space-y-3">
            {categories.map((cat, i) => {
              const maxTotal = Math.max(...categories.map((c) => c.total))
              const pct = Math.round((cat.total / maxTotal) * 100)
              const colors = ['#6366f1', '#f87171', '#34d399', '#fbbf24', '#a78bfa', '#60a5fa']
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors[i % colors.length] }} />
                  <span className="text-xs text-slate-400 flex-1 truncate">{cat.category}</span>
                  <div className="w-20 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                  </div>
                  <span className="text-xs text-slate-300 min-w-[60px] text-right">{formatCurrency(cat.total)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent records */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-200">Recent records</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-500">
              {['Description', 'Category', 'Date', 'Type', 'Amount'].map((h) => (
                <th key={h} className="text-xs font-medium text-slate-500 text-left pb-3 pr-4 last:text-right">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {summary.recentRecords.map((r) => (
              <tr key={r.id} className="border-b border-dark-600 last:border-0">
                <td className="py-3 pr-4 text-slate-300">{r.notes ?? '—'}</td>
                <td className="py-3 pr-4 text-slate-500">{r.category}</td>
                <td className="py-3 pr-4 text-slate-500">{formatDate(r.date)}</td>
                <td className="py-3 pr-4"><Badge type={r.type} /></td>
                <td className={`py-3 text-right font-medium ${r.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {r.type === 'income' ? '+' : '−'}{formatCurrency(r.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
