import { beforeEach, describe, expect, it } from 'vitest'
import { clearAuth, getAuthUser, getToken, hasPermission, saveAuth } from './authStorage'

describe('authStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves token and user details', () => {
    saveAuth({
      token: 'token-123',
      userId: 1,
      fullName: 'Admin User',
      email: 'admin@accessportal.com',
      role: 'ADMIN',
      permissions: ['DASHBOARD_VIEW', 'USER_READ'],
    })

    expect(getToken()).toBe('token-123')
    expect(getAuthUser()).toEqual({
      userId: 1,
      fullName: 'Admin User',
      email: 'admin@accessportal.com',
      role: 'ADMIN',
      permissions: ['DASHBOARD_VIEW', 'USER_READ'],
    })
  })

  it('checks user permissions', () => {
    saveAuth({
      token: 'token-123',
      userId: 1,
      fullName: 'Admin User',
      email: 'admin@accessportal.com',
      role: 'ADMIN',
      permissions: ['DASHBOARD_VIEW'],
    })

    expect(hasPermission('DASHBOARD_VIEW')).toBe(true)
    expect(hasPermission('AUDIT_VIEW')).toBe(false)
  })

  it('clears authentication data', () => {
    saveAuth({
      token: 'token-123',
      userId: 1,
      fullName: 'Admin User',
      email: 'admin@accessportal.com',
      role: 'ADMIN',
      permissions: ['DASHBOARD_VIEW'],
    })

    clearAuth()

    expect(getToken()).toBeNull()
    expect(getAuthUser()).toBeNull()
  })
})
