'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { authApi } from '@/lib/api'
import { clearAuth, getStoredAuthUser, getStoredToken, persistAuth } from '@/lib/api/client'
import type { AuthUser } from '@/lib/api/types'
import { applyAppearance } from '@/lib/appearance'
import type { Role } from '@/lib/auth'

type AuthContextValue = {
  user: AuthUser | null
  role: Role | null
  isLoading: boolean
  login: (input: { email: string; password: string; role: Role }) => Promise<void>
  logout: () => void
  updateUser: (user: AuthUser) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = getStoredAuthUser()
    setUser(stored)
    setIsLoading(false)
    if (stored?.theme || stored?.fontSize) {
      applyAppearance(stored.theme === 'dark' ? 'dark' : 'light', stored.fontSize ?? 'medium')
    }
    if (!stored) return
    authApi.me()
      .then((fresh) => {
        const token = getStoredToken()
        if (token) persistAuth(token, fresh)
        setUser(fresh)
        applyAppearance(fresh.theme === 'dark' ? 'dark' : 'light', fresh.fontSize ?? 'medium')
      })
      .catch(() => undefined)
  }, [])

  async function login(input: { email: string; password: string; role: Role }) {
    const session = await authApi.login(input)
    persistAuth(session.token, session.user)
    setUser(session.user)
    applyAppearance(session.user.theme === 'dark' ? 'dark' : 'light', session.user.fontSize ?? 'medium')
  }

  function logout() {
    clearAuth()
    setUser(null)
  }

  function updateUser(next: AuthUser) {
    const token = getStoredToken()
    if (token) persistAuth(token, next)
    setUser(next)
  }

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
