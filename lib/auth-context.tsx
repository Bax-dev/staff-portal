'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Role } from '@/lib/auth'

const STORAGE_KEY = 'organo-auth-role'

type AuthContextValue = {
  role: Role | null
  isLoading: boolean
  login: (role: Role) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored === 'staff' || stored === 'admin') setRole(stored)
    setIsLoading(false)
  }, [])

  function login(nextRole: Role) {
    sessionStorage.setItem(STORAGE_KEY, nextRole)
    setRole(nextRole)
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY)
    setRole(null)
  }

  return <AuthContext.Provider value={{ role, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
