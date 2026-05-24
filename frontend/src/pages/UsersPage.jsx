import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import apiClient from '../api/apiClient'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import PaginationControls from '../components/PaginationControls'

const PAGE_SIZE = 10

const userSchema = z.object({
  fullName: z.string().min(2, 'Full name must have at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().optional(),
  roleId: z.string().min(1, 'Role is required'),
  enabled: z.boolean(),
}).superRefine((data, context) => {
  if (data.password !== undefined && data.password !== '' && data.password.length < 6) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['password'],
      message: 'Password must have at least 6 characters',
    })
  }
})

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  roleId: '',
  enabled: true,
}

const initialPageData = {
  content: [],
  page: 0,
  size: PAGE_SIZE,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
}

function UsersPage() {
  const [pageData, setPageData] = useState(initialPageData)
  const [roles, setRoles] = useState([])
  const [editingUserId, setEditingUserId] = useState(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')

  const users = pageData.content

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: initialForm,
  })

  const formEnabled = watch('enabled')

  const loadData = async () => {
    setLoading(true)
    setServerError('')

    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        apiClient.get(`/users/page?page=${page}&size=${PAGE_SIZE}`),
        apiClient.get('/roles'),
      ])

      setPageData(usersResponse.data)
      setRoles(rolesResponse.data)
    } catch (err) {
      setServerError(err.response?.data?.message || 'Unable to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.toLowerCase().trim()

      const matchesSearch =
        user.fullName.toLowerCase().includes(searchText) ||
        user.email.toLowerCase().includes(searchText) ||
        user.role.toLowerCase().includes(searchText)

      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && user.enabled) ||
        (statusFilter === 'DISABLED' && !user.enabled)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, search, roleFilter, statusFilter])

  const resetForm = () => {
    reset(initialForm)
    setEditingUserId(null)
    setServerError('')
    setSuccess('')
  }

  const handleEdit = (user) => {
    const matchedRole = roles.find((role) => role.name === user.role)

    setEditingUserId(user.id)
    reset({
      fullName: user.fullName,
      email: user.email,
      password: '',
      roleId: matchedRole?.id ? String(matchedRole.id) : '',
      enabled: user.enabled,
    })
    setSuccess('')
    setServerError('')
  }

  const onSubmit = async (formData) => {
    setServerError('')
    setSuccess('')

    try {
      if (editingUserId) {
        await apiClient.put(`/users/${editingUserId}`, {
          fullName: formData.fullName,
          email: formData.email,
          roleId: Number(formData.roleId),
          enabled: formData.enabled,
        })

        setSuccess('User updated successfully.')
      } else {
        if (!formData.password || formData.password.length < 6) {
          setServerError('Password must have at least 6 characters.')
          return
        }

        await apiClient.post('/users', {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          roleId: Number(formData.roleId),
        })

        setSuccess('User created successfully.')
        setPage(0)
      }

      resetForm()
      await loadData()
    } catch (err) {
      setServerError(err.response?.data?.message || 'Unable to save user.')
    }
  }

  const handleDisable = async (userId) => {
    const confirmed = window.confirm('Disable this user account?')

    if (!confirmed) return

    setServerError('')
    setSuccess('')

    try {
      await apiClient.delete(`/users/${userId}`)
      setSuccess('User disabled successfully.')
      await loadData()
    } catch (err) {
      setServerError(err.response?.data?.message || 'Unable to disable user.')
    }
  }

  if (loading) return <LoadingState />

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Create, update, disable, search, filter, and paginate enterprise user accounts."
      />

      {serverError && <ErrorState message={serverError} />}

      {success && (
        <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-700">
          {success}
        </div>
      )}

      <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-950">
            {editingUserId ? 'Update User' : 'Create User'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Assign a role so permissions are inherited automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Full Name</span>
            <input
              {...register('fullName')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              placeholder="Example User"
            />
            {errors.fullName && (
              <p className="mt-2 text-xs font-semibold text-red-600">{errors.fullName.message}</p>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              {...register('email')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              placeholder="user@company.com"
            />
            {errors.email && (
              <p className="mt-2 text-xs font-semibold text-red-600">{errors.email.message}</p>
            )}
          </label>

          {!editingUserId && (
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <input
                type="password"
                {...register('password')}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                placeholder="Minimum 6 characters"
              />
              {errors.password && (
                <p className="mt-2 text-xs font-semibold text-red-600">{errors.password.message}</p>
              )}
            </label>
          )}

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Role</span>
            <select
              {...register('roleId')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.roleId && (
              <p className="mt-2 text-xs font-semibold text-red-600">{errors.roleId.message}</p>
            )}
          </label>

          {editingUserId && (
            <label className="flex items-end gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <input
                type="checkbox"
                checked={formEnabled}
                onChange={(event) => setValue('enabled', event.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm font-semibold text-slate-700">Enabled</span>
            </label>
          )}

          <div className="flex items-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : editingUserId ? 'Update User' : 'Create User'}
            </button>

            {editingUserId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
            placeholder="Search current page by name, email, or role..."
          />

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
          >
            <option value="ALL">All Roles on Current Page</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
          >
            <option value="ALL">All Status on Current Page</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
          </select>
        </div>

        <div className="mb-4 text-sm font-medium text-slate-500">
          Showing {filteredUsers.length} users on this page from {pageData.totalElements} total users
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-800">{user.fullName}</td>
                  <td className="px-4 py-3 text-slate-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      user.enabled
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(user.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>

                      {user.enabled && (
                        <button
                          onClick={() => handleDisable(user.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          Disable
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                    No users match the current search or filters.
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

export default UsersPage
