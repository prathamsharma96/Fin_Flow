import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: 'VIEWER' | 'ANALYST' | 'ADMIN'
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  isAdmin: boolean
  isAnalyst: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('finflow_token')
    const storedUser = localStorage.getItem('finflow_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = (user: User, token: string) => {
    setUser(user)
    setToken(token)
    localStorage.setItem('finflow_token', token)
    localStorage.setItem('finflow_user', JSON.stringify(user))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('finflow_token')
    localStorage.removeItem('finflow_user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAdmin: user?.role === 'ADMIN',
        isAnalyst: user?.role === 'ANALYST' || user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
