import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Records from './pages/Records'
import Users from './pages/Users'
import { Spinner } from './components/ui'
import { useEffect, useState } from 'react'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  if (token) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { token } = useAuth()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/records" element={<Records />} />
        <Route path="/users" element={<Users />} />
      </Route>
      <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
