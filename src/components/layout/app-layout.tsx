import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/auth-context'
import {
  LayoutDashboard,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/applications', label: 'Applications', icon: Briefcase },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/applications': 'Applications',
  '/applications/new': 'New Application',
  '/settings': 'Settings',
}

export function AppLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : '??'

  const username = user?.email?.split('@')[0] ?? ''

  const currentTitle = pageTitles[location.pathname]
    ?? (location.pathname.includes('/edit') ? 'Edit Application'
    : location.pathname.includes('/applications/') ? 'Application Detail'
    : '')

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-gray-950 transition-all duration-300 ease-in-out lg:static lg:z-auto',
          collapsed ? 'w-[70px]' : 'w-[230px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className={cn(
          'flex h-[64px] shrink-0 items-center border-b border-gray-800/50',
          collapsed ? 'justify-center px-2' : 'gap-3 px-5',
        )}>
          <Link to="/" className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 transition-transform duration-200 hover:scale-105">
            <Zap className="h-5 w-5 text-white transition-transform duration-200 group-hover:rotate-12" strokeWidth={2.5} />
          </Link>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-white tracking-tight">JobFlow</p>
              <p className="text-[10px] text-gray-500">Job Tracker</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'hidden rounded-lg p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-300 lg:block transition-all duration-200',
              !collapsed && 'ml-auto',
            )}
          >
            <ChevronLeft className={cn('h-3.5 w-3.5 transition-transform duration-300', collapsed && 'rotate-180')} />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-lg p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-300 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                    : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200',
                  collapsed && 'justify-center px-2',
                )
              }
            >
              <item.icon className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-50">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-800/50 px-3 py-3">
          <button
            onClick={handleSignOut}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400',
              collapsed && 'justify-center px-2',
            )}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>

          {!collapsed && (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-gray-800/30 px-3 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white shadow ring-2 ring-indigo-500/20">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-gray-200">{username}</p>
                <p className="truncate text-[10px] text-gray-500">{user?.email}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-[64px] shrink-0 items-center gap-4 border-b border-gray-200/80 bg-white/80 backdrop-blur-sm px-4 lg:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1">
            {currentTitle && (
              <h2 className="text-lg font-bold text-gray-900">{currentTitle}</h2>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/applications/new')}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              Add Application
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-1.5 transition-colors hover:bg-gray-100">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white">
                {initials}
              </div>
              <span className="hidden text-sm font-medium text-gray-700 sm:block">{username}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
