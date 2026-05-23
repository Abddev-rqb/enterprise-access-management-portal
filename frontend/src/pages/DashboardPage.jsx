import { useEffect, useState } from 'react'
import apiClient from '../api/apiClient'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'

function DashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await apiClient.get('/dashboard')
        setDashboard(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load dashboard.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of users, sessions, roles, and recent security activity."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Users" value={dashboard.totalUsers} helper="All registered users" />
        <StatCard label="Active Users" value={dashboard.activeUsers} helper="Enabled accounts" />
        <StatCard label="Roles" value={dashboard.rolesCount} helper="Configured roles" />
        <StatCard label="Recent Logins" value={dashboard.recentLoginCount} helper="Last 24 hours" />
        <StatCard label="Audit Events" value={dashboard.recentAuditCount} helper="Last 24 hours" />
      </div>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-950">Recent Audit Activities</h2>
          <p className="mt-1 text-sm text-slate-500">Latest security and admin actions.</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Created At</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recentAuditActivities?.map((log) => (
                <tr key={log.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-700">{log.actorEmail || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{log.details}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}

              {dashboard.recentAuditActivities?.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                    No audit activities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
