import { ReactNode } from 'react'

// ── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string
  change?: string
  changeUp?: boolean
  icon: ReactNode
  iconBg: string
}

export function StatCard({ label, value, change, changeUp, icon, iconBg }: StatCardProps) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-semibold text-slate-100 mb-1">{value}</p>
      {change && (
        <p className={`text-xs font-medium ${changeUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {changeUp ? '↑' : '↓'} {change}
        </p>
      )}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ type }: { type: 'income' | 'expense' }) {
  return (
    <span className={type === 'income' ? 'badge-income' : 'badge-expense'}>
      {type === 'income' ? 'Income' : 'Expense'}
    </span>
  )
}

export function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    ADMIN: 'bg-purple-950 text-purple-400',
    ANALYST: 'bg-blue-950 text-blue-400',
    VIEWER: 'bg-slate-800 text-slate-400',
  }
  return (
    <span className={`badge-role ${styles[role] ?? styles.VIEWER}`}>{role}</span>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <svg className="w-10 h-10 mb-3 opacity-40" fill="none" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-dark-800 border border-dark-500 rounded-xl w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-500">
          <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

// ── Page Header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ── Format helpers ────────────────────────────────────────────────────────────
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
