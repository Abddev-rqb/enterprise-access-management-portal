import { useEffect, useMemo, useState } from 'react'
import apiClient from '../api/apiClient'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import PaginationControls from '../components/PaginationControls'

const PAGE_SIZE = 10

function SessionsPage() {
  const [pageData, setPageData] = useState({
    content: [],
    page: 0,
    size: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const sessions = pageData.content

  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await apiClient.get(`/sessions/page?page=${page}&size=${PAGE_SIZE}`)
        setPageData(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load sessions.')
      } finally {
        setLoading(false)
      }
    }

    loadSessions()
  }, [page])

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const searchText = search.toLowerCase().trim()

      const matchesSearch =
        session.fullName.toLowerCase().includes(searchText) ||
        session.email.toLowerCase().includes(searchText) ||
        session.role.toLowerCase().includes(searchText)

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && session.active) ||
        (statusFilter === 'INACTIVE' && !session.active)

      return matchesSearch && matchesStatus
    })
  }, [sessions, search, statusFilter])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div>
      <PageHeader
        title="Sessions"
        subtitle="Monitor and paginate login sessions, active tokens, logout time, and user access history."
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
            placeholder="Search current page by name, email, or role..."
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
          >
            <option value="ALL">All Sessions on Current Page</option>
            <option value="ACTIVE">Active Sessions</option>
            <option value="INACTIVE">Inactive Sessions</option>
          </select>
        </div>

        <div className="mb-4 text-sm font-medium text-slate-500">
          Showing {filteredSessions.length} sessions on this page from {pageData.totalElements} total sessions
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Login Time</th>
                <th className="px-4 py-3">Logout Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => (
                <tr key={session.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-800">{session.fullName}</td>
                  <td className="px-4 py-3 text-slate-500">{session.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {session.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      session.active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {session.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(session.loginTime).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {session.logoutTime ? new Date(session.logoutTime).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}

              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                    No sessions match the current search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <PaginationControls
          page={pageData.page}
          size={pageData.size}
          totalPages={pageData.totalPages}
          totalElements={pageData.totalElements}
          onPrevious={() => setPage((current) => Math.max(current - 1, 0))}
          onNext={() => setPage((current) => current + 1)}
        />
      </section>
    </div>
  )
}

export default SessionsPage
