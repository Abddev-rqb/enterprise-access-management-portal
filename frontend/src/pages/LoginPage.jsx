import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import apiClient from '../api/apiClient'
import { saveAuth } from '../auth/authStorage'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

function LoginPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@accessportal.com',
      password: 'admin123',
    },
  })

  const onSubmit = async (formData) => {
    setServerError('')

    try {
      const response = await apiClient.post('/auth/login', formData)
      saveAuth(response.data)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please check credentials.')
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-slate-950 lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-slate-950 p-12 text-white lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AccessPortal</h1>
              <p className="text-sm text-slate-400">Enterprise Access Management</p>
            </div>
          </div>

          <div className="mt-24 max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
              Secure IAM Admin Console
            </p>
            <h2 className="mt-5 text-5xl font-bold leading-tight">
              Manage users, roles, permissions, sessions, and audit logs.
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              A production-style Java Spring Boot and React application built for enterprise identity and access workflows.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm text-slate-300">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-2xl font-bold text-white">JWT</p>
            <p className="mt-1">Secure auth</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-2xl font-bold text-white">RBAC</p>
            <p className="mt-1">Permission based</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-2xl font-bold text-white">Audit</p>
            <p className="mt-1">Activity tracking</p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-slate-100 px-6">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <ShieldCheck size={28} />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-slate-950">Admin Login</h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to manage enterprise access controls.
            </p>
          </div>

          {serverError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {serverError}
            </div>
          )}

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              {...register('email')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
              placeholder="admin@accessportal.com"
            />
            {errors.email && (
              <p className="mt-2 text-xs font-semibold text-red-600">{errors.email.message}</p>
            )}
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              type="password"
              {...register('password')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
              placeholder="admin123"
            />
            {errors.password && (
              <p className="mt-2 text-xs font-semibold text-red-600">{errors.password.message}</p>
            )}
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="mt-5 rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500">
            Demo credentials: admin@accessportal.com / admin123
          </p>
        </form>
      </section>
    </div>
  )
}

export default LoginPage
