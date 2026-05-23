import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Activity, BarChart3, KeyRound, LogOut, MonitorCheck, ShieldCheck, Users } from 'lucide-react'
import apiClient from '../api/apiClient'
import { clearAuth, getAuthUser, hasPermission } from '../auth/authStorage'

const navItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: BarChart3,
    permission: 'DASHBOARD_VIEW',
  },
  {
    label: 'Users',
    path: '/users',
    icon: Users,
    permission: 'USER_READ',
  },
  {
    label: 'Roles',
    path: '/roles',
    icon: ShieldCheck,
    permission: 'ROLE_MANAGE',
  },
  {
    label: 'Permissions',
    path: '/permissions',
    icon: KeyRound,
    permission: 'PERMISSION_MANAGE',
  },
  {
    label: 'Sessions',
    path: '/sessions',
    icon: MonitorCheck,
    permission: 'AUDIT_VIEW',
  },
  {
    label: 'Audit Logs',
    path: '/audit-logs',
    icon: Activity,
    permission: 'AUDIT_VIEW',
  },
]

function AppLayout() {
  const navigate = useNavigate()
  const user = getAuthUser()

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout API failed:', error)
    } finally {
      clearAuth()
      navigate('/login')
    }
  }

  const visibleNavItems = navItems.filter((item) => hasPermission(item.permission))

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed left-0 top-0 h-screen w-72 border-r border-slate-200 bg-white px-5 py-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-950">AccessPortal</h1>
              <p className="text-xs text-slate-500">Enterprise IAM Console</p>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            {visibleNavItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition',
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950',
                    ].join(' ')
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={18}
                        className={isActive ? 'text-white' : 'text-slate-500'}
                      />
                      <span className={isActive ? 'text-white' : 'text-slate-700'}>
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        </div>

        <div className="absolute bottom-6 left-5 right-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">{user?.fullName}</p>
          <p className="mt-1 text-xs text-slate-500">{user?.email}</p>
          <p className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            {user?.role}
          </p>

          <button
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-72 min-h-screen px-8 py-7">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
