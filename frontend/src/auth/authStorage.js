export const saveAuth = (authResponse) => {
  localStorage.setItem('access_token', authResponse.token)
  localStorage.setItem('auth_user', JSON.stringify({
    userId: authResponse.userId,
    fullName: authResponse.fullName,
    email: authResponse.email,
    role: authResponse.role,
    permissions: authResponse.permissions || [],
  }))
}

export const getToken = () => {
  return localStorage.getItem('access_token')
}

export const getAuthUser = () => {
  const value = localStorage.getItem('auth_user')
  return value ? JSON.parse(value) : null
}

export const hasPermission = (permission) => {
  const user = getAuthUser()
  return user?.permissions?.includes(permission)
}

export const clearAuth = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('auth_user')
}
