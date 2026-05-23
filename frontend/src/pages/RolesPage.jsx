import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import apiClient from '../api/apiClient'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'

const roleSchema = z.object({
  name: z
    .string()
    .min(2, 'Role name must have at least 2 characters')
    .max(100, 'Role name must be less than 100 characters'),
  description: z.string().max(255, 'Description must be less than 255 characters').optional(),
  permissionIds: z.array(z.number()).min(1, 'Select at least one permission'),
})

const initialForm = {
  name: '',
  description: '',
  permissionIds: [],
}

function RolesPage() {
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [editingRoleId, setEditingRoleId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(roleSchema),
    defaultValues: initialForm,
  })

  const selectedPermissionIds = watch('permissionIds') || []

  const loadData = async () => {
    setLoading(true)
    setServerError('')

    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        apiClient.get('/roles'),
        apiClient.get('/permissions'),
      ])

      setRoles(rolesResponse.data)
      setPermissions(permissionsResponse.data)
    } catch (err) {
      setServerError(err.response?.data?.message || 'Unable to load roles.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handlePermissionToggle = (permissionId) => {
    const exists = selectedPermissionIds.includes(permissionId)

    const nextPermissionIds = exists
      ? selectedPermissionIds.filter((id) => id !== permissionId)
      : [...selectedPermissionIds, permissionId]

    setValue('permissionIds', nextPermissionIds, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const resetForm = () => {
    reset(initialForm)
    setEditingRoleId(null)
    setServerError('')
    setSuccess('')
  }

  const handleEdit = (role) => {
    const selectedIds = permissions
      .filter((permission) => role.permissions.includes(permission.name))
      .map((permission) => permission.id)

    setEditingRoleId(role.id)
    reset({
      name: role.name,
      description: role.description || '',
      permissionIds: selectedIds,
    })
    setSuccess('')
    setServerError('')
  }

  const onSubmit = async (formData) => {
    setServerError('')
    setSuccess('')

    try {
      const payload = {
        name: formData.name,
        description: formData.description || '',
        permissionIds: formData.permissionIds,
      }

      if (editingRoleId) {
        await apiClient.put(`/roles/${editingRoleId}`, payload)
        setSuccess('Role updated successfully.')
      } else {
        await apiClient.post('/roles', payload)
        setSuccess('Role created successfully.')
      }

      resetForm()
      await loadData()
    } catch (err) {
      setServerError(err.response?.data?.message || 'Unable to save role.')
    }
  }

  if (loading) return <LoadingState />

  return (
    <div>
      <PageHeader
        title="Roles"
        subtitle="Create roles and assign permission sets for role-based access control."
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
            {editingRoleId ? 'Update Role' : 'Create Role'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Select permissions that should be granted to this role.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Role Name</span>
              <input
                {...register('name')}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                placeholder="Example: SUPPORT_ADMIN"
              />
              {errors.name && (
                <p className="mt-2 text-xs font-semibold text-red-600">{errors.name.message}</p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Description</span>
              <input
                {...register('description')}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                placeholder="Describe role responsibility"
              />
              {errors.description && (
                <p className="mt-2 text-xs font-semibold text-red-600">{errors.description.message}</p>
              )}
            </label>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">Permissions</p>

            {errors.permissionIds && (
              <p className="mb-3 text-xs font-semibold text-red-600">
                {errors.permissionIds.message}
              </p>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {permissions.map((permission) => {
                const checked = selectedPermissionIds.includes(permission.id)

                return (
                  <label
                    key={permission.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                      checked
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className="mt-1 h-4 w-4"
                    />
                    <span>
                      <span className={`block text-sm font-bold ${checked ? 'text-white' : 'text-slate-950'}`}>
                        {permission.name}
                      </span>
                      <span className={`mt-1 block text-xs ${checked ? 'text-slate-300' : 'text-slate-500'}`}>
                        {permission.description}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : editingRoleId ? 'Update Role' : 'Create Role'}
            </button>

            {editingRoleId && (
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

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {roles.map((role) => (
          <article key={role.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">{role.name}</h2>
                <p className="mt-2 text-sm text-slate-500">{role.description}</p>
              </div>

              <button
                onClick={() => handleEdit(role)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Edit
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {role.permissions.map((permission) => (
                <span
                  key={permission}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {permission}
                </span>
              ))}

              {role.permissions.length === 0 && (
                <span className="text-sm text-slate-400">No permissions assigned.</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default RolesPage
