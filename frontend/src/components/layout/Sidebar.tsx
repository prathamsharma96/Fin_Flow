import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: '/records',
    label: 'Records',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
        <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

const adminItems = [
  {
    to: '/users',
    label: 'Users',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 14c0-3 2.686-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    adminOnly: true,
  },
]

const roleBadgeColor: Record<string, string> = {
  ADMIN: 'bg-purple-950 text-purple-400',
  ANALYST: 'bg-blue-950 text-blue-400',
  VIEWER: 'bg-slate-800 text-slate-400',
}

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className="w-56 bg-dark-800 border-r border-dark-500 flex flex-col h-screen sticky top-0 flex-shrink-0">
      <div className="px-5 py-6 border-b border-dark-500">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 16 16">
              <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" />
              <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" opacity=".6" />
              <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" opacity=".6" />
              <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" />
            </svg>
          </div>
          <span className="font-semibold text-slate-100 text-base">Finflow</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-xs text-slate-600 uppercase tracking-widest px-2 mb-2">Main</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                isActive
                  ? 'bg-dark-600 text-slate-100 border-r-2 border-indigo-500'
                  : 'text-slate-400 hover:bg-dark-600 hover:text-slate-200'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p className="text-xs text-slate-600 uppercase tracking-widest px-2 mt-4 mb-2">Admin</p>
            {adminItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                    isActive
                      ? 'bg-dark-600 text-slate-100 border-r-2 border-indigo-500'
                      : 'text-slate-400 hover:bg-dark-600 hover:text-slate-200'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-dark-500">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleBadgeColor[user?.role ?? 'VIEWER']}`}>
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-red-400 hover:bg-dark-600 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}
