import type { AuthUser } from '@/lib/api/types'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function getApiBase() {
  if (typeof window !== 'undefined') {
    const { hostname } = window.location
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return ''
    }
  }

  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '')
}

export function apiUrl(path: string) {
  return `${getApiBase()}${path}`
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const token = typeof window === 'undefined' ? null : getStoredToken()
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(apiUrl(path), { cache: 'no-store', ...options, headers })

  if (response.status === 204) {
    return undefined as T
  }

  const payload = (await response.json().catch(() => null)) as { data?: T; error?: string } | null

  if (!response.ok) {
    throw new ApiError(payload?.error ?? 'Request failed', response.status)
  }

  return payload?.data as T
}

const AUTH_TOKEN_KEY = 'smp-auth-token'
const AUTH_USER_KEY = 'smp-auth-user'

function clearLegacyLocalAuth() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(AUTH_USER_KEY)
}

export function getStoredToken() {
  clearLegacyLocalAuth()
  return window.sessionStorage.getItem(AUTH_TOKEN_KEY)
}

export function getStoredAuthUser() {
  clearLegacyLocalAuth()
  const raw = window.sessionStorage.getItem(AUTH_USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function persistAuth(token: string, user: AuthUser) {
  clearLegacyLocalAuth()
  window.sessionStorage.setItem(AUTH_TOKEN_KEY, token)
  window.sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  clearLegacyLocalAuth()
  window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
  window.sessionStorage.removeItem(AUTH_USER_KEY)
}
