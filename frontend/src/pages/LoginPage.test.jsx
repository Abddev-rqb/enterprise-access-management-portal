import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import LoginPage from './LoginPage'
import apiClient from '../api/apiClient'

vi.mock('../api/apiClient', () => ({
  default: {
    post: vi.fn(),
  },
}))

vi.mock('../auth/authStorage', () => ({
  saveAuth: vi.fn(),
}))

const mockedNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders demo login form', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /admin login/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('admin@accessportal.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('admin123')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation error when email is empty', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const emailInput = screen.getByPlaceholderText('admin@accessportal.com')
    await user.clear(emailInput)

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
  })

  it('submits login request successfully', async () => {
    const user = userEvent.setup()

    apiClient.post.mockResolvedValueOnce({
      data: {
        token: 'mock-token',
        userId: 1,
        fullName: 'Admin User',
        email: 'admin@accessportal.com',
        role: 'ADMIN',
        permissions: ['DASHBOARD_VIEW'],
      },
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'admin@accessportal.com',
      password: 'admin123',
    })

    expect(mockedNavigate).toHaveBeenCalledWith('/dashboard')
  })
})
