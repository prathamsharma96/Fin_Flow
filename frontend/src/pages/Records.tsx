import { useEffect, useState, FormEvent } from 'react'
import { recordsApi } from '../api'
import { Badge, Spinner, EmptyState, Modal, PageHeader, formatCurrency, formatDate } from '../components/ui'
import { useAuth } from '../context/AuthContext'

interface Record {
  id: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  notes?: string
  user?: { name: string }
}

interface Pagination {
  records: Record[]
  total: number
  page: number
  totalPages: number
}

const CATEGORIES = ['Salary', 'Freelance', 'Rent', 'Utilities', 'Investment', 'Food', 'Transport', 'Other']

export default function Records() {
  const { isAdmin } = useAuth()
  const [data, setData] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ type: '', category: '', page: '1' })
  const [showCreate, setShowCreate] = useState(false)
  const [editRecord, setEditRecord] = useState<Record | null>(null)
  const [form, setForm] = useState({ amount: '', type: 'income', category: 'Salary', date: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      const res = await recordsApi.getAll(params)
      setData(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filters])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record? This cannot be undone.')) return
    await recordsApi.delete(id)
    load()
  }

  const openEdit = (r: Record) => {
    setEditRecord(r)
    setForm({
      amount: String(r.amount),
      type: r.type,
      category: r.category,
      date: r.date.slice(0, 10),
      notes: r.notes ?? '',
    })
  }

  const resetForm = () => {
    setForm({ amount: '', type: 'income', category: 'Salary', date: '', notes: '' })
    setShowCreate(false)
    setEditRecord(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        amount: parseFloat(form.amount),
        type: form.type,
        category: form.category,
        date: new Date(form.date).toISOString(),
        notes: form.notes || undefined,
      }
      if (editRecord) {
        await recordsApi.update(editRecord.id, payload)
      } else {
        await recordsApi.create(payload)
      }
      resetForm()
      load()
    } catch {
      alert('Failed to save record. Please check your inputs.')
    } finally {
      setSubmitting(false)
    }
  }

  const showModal = showCreate || !!editRecord

  return (
    <div className="p-8">
      <PageHeader
        title="Financial records"
        subtitle={data ? `${data.total} total records` : ''}
        action={
          isAdmin ? (
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              Add record
            </button>
          ) : null
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <select
          className="input w-auto"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value, page: '1' })}
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select
          className="input w-auto"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value, page: '1' })}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        {(filters.type || filters.category) && (
          <button
            onClick={() => setFilters({ type: '', category: '', page: '1' })}
            className="text-xs text-slate-500 hover:text-slate-300 px-3 py-2 border border-dark-500 rounded-lg transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="card">
        {loading ? (
          <Spinner />
        ) : !data || data.records.length === 0 ? (
          <EmptyState message="No records found" />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-500">
                  {['Notes', 'Category', 'Date', 'Type', 'Amount', ...(isAdmin ? ['Actions'] : [])].map((h) => (
                    <th key={h} className="text-xs font-medium text-slate-500 text-left pb-3 pr-4 last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.records.map((r) => (
                  <tr key={r.id} className="border-b border-dark-600 last:border-0 hover:bg-dark-600/40 transition-colors">
                    <td className="py-3 pr-4 text-slate-300 max-w-[180px] truncate">{r.notes ?? '—'}</td>
                    <td className="py-3 pr-4 text-slate-500">{r.category}</td>
                    <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">{formatDate(r.date)}</td>
                    <td className="py-3 pr-4"><Badge type={r.type} /></td>
                    <td className={`py-3 pr-4 font-medium whitespace-nowrap ${r.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {r.type === 'income' ? '+' : '−'}{formatCurrency(r.amount)}
                    </td>
                    {isAdmin && (
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(r)} className="text-xs text-slate-500 hover:text-indigo-400 transition-colors px-2 py-1 rounded hover:bg-dark-600">Edit</button>
                          <button onClick={() => handleDelete(r.id)} className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-dark-600">Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-500">
                <p className="text-xs text-slate-500">Page {data.page} of {data.totalPages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters((f) => ({ ...f, page: String(data.page - 1) }))}
                    disabled={data.page <= 1}
                    className="text-xs px-3 py-1.5 border border-dark-500 rounded-lg text-slate-400 hover:border-indigo-500 disabled:opacity-30 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setFilters((f) => ({ ...f, page: String(data.page + 1) }))}
                    disabled={data.page >= data.totalPages}
                    className="text-xs px-3 py-1.5 border border-dark-500 rounded-lg text-slate-400 hover:border-indigo-500 disabled:opacity-30 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create / Edit modal */}
      {showModal && (
        <Modal title={editRecord ? 'Edit record' : 'New record'} onClose={resetForm}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Amount (₹)</label>
                <input type="number" step="0.01" min="0" className="input" value={form.amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Type</label>
                <select className="input" value={form.type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, type: e.target.value })}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Category</label>
                <select className="input" value={form.category} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Date</label>
                <input type="date" className="input" value={form.date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, date: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Notes (optional)</label>
              <input type="text" className="input" value={form.notes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. April salary credit" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={resetForm} className="btn-ghost flex-1 text-sm">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1 text-sm disabled:opacity-50">
                {submitting ? 'Saving...' : editRecord ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
