import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('admin@finflow.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      login(res.data.data.user, res.data.data.token)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (role: 'admin' | 'analyst' | 'viewer') => {
    setEmail(`${role}@finflow.com`)
    setPassword(`${role}123`)
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 16 16">
                <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" />
                <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" opacity=".6" />
                <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" opacity=".6" />
                <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-slate-100">Finflow</span>
          </div>
        </div>

        <div className="card">
          <h1 className="text-base font-semibold text-slate-100 mb-1">Sign in</h1>
          <p className="text-sm text-slate-500 mb-6">Enter your credentials to access the dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@finflow.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-dark-500">
            <p className="text-xs text-slate-500 mb-2">Quick login (demo accounts)</p>
            <div className="flex gap-2">
              {(['admin', 'analyst', 'viewer'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => quickLogin(role)}
                  className="flex-1 text-xs py-1.5 rounded-lg border border-dark-500 text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors capitalize"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
