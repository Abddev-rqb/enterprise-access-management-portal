import { useEffect, useState } from 'react'
import apiClient from '../api/apiClient'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'

function PermissionsPage() {
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const response = await apiClient.get('/permissions')
        setPermissions(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load permissions.')
      } finally {
        setLoading(false)
      }
    }

    loadPermissions()
  }, [])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div>
      <PageHeader
        title="Permissions"
        subtitle="System-level permissions used for authorization decisions."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {permissions.map((permission) => (
          <article key={permission.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-950">{permission.name}</h2>
            <p className="mt-2 text-sm text-slate-500">{permission.description}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

export default PermissionsPage
