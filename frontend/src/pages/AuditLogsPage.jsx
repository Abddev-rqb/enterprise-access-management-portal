import { useEffect, useMemo, useState } from 'react'
import apiClient from '../api/apiClient'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import PaginationControls from '../components/PaginationControls'

const PAGE_SIZE = 10

function AuditLogsPage() {
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
  const [actionFilter, setActionFilter] = useState('ALL')
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const logs = pageData.content

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await apiClient.get(`/audit-logs/page?page=${page}&size=${PAGE_SIZE}`)
        setPageData(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load audit logs.')
      } finally {
        setLoading(false)
      }
    }

    loadLogs()
  }, [page])

  const actionOptions = useMemo(() => {
    return Array.from(new Set(logs.map((log) => log.action))).sort()
  }, [logs])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const searchText = search.toLowerCase().trim()

      const matchesSearch =
        (log.actorEmail || '').toLowerCase().includes(searchText) ||
        (log.action || '').toLowerCase().includes(searchText) ||
        (log.details || '').toLowerCase().includes(searchText) ||
        (log.ipAddress || '').toLowerCase().includes(searchText)

      const matchesAction = actionFilter === 'ALL' || log.action === actionFilter

      return matchesSearch && matchesAction
    })
  }, [logs, search, actionFilter])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Search, filter, and paginate login attempts, user actions, role updates, and security events."
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
            placeholder="Search current page by actor, action, details, or IP..."
          />

          <select
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
          >
            <option value="ALL">All Actions on Current Page</option>
            {actionOptions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 text-sm font-medium text-slate-500">
          Showing {filteredLogs.length} records on this page from {pageData.totalElements} total audit records
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-700">{log.actorEmail || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{log.details}</td>
                  <td className="px-4 py-3 text-slate-500">{log.ipAddress || '-'}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    No audit logs match the current search or filter.
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

export default AuditLogsPage
