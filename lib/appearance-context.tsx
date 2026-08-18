'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '@/lib/api'
import type { AppearanceFontSize, AppearanceTheme } from '@/lib/api/types'
import { applyAppearance, readStoredAppearance } from '@/lib/appearance'
import { useAuth } from '@/lib/auth-context'

type AppearanceContextValue = {
  theme: AppearanceTheme
  fontSize: AppearanceFontSize
  setTheme: (theme: AppearanceTheme) => Promise<void>
  setFontSize: (fontSize: AppearanceFontSize) => Promise<void>
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null)

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useAuth()
  const stored = readStoredAppearance()
  const [theme, setThemeState] = useState<AppearanceTheme>(stored.theme)
  const [fontSize, setFontSizeState] = useState<AppearanceFontSize>(stored.fontSize)

  useEffect(() => {
    applyAppearance(theme, fontSize)
  }, [theme, fontSize])

  useEffect(() => {
    if (!user) return
    if (user.theme) setThemeState(user.theme)
    if (user.fontSize) setFontSizeState(user.fontSize)
  }, [user])

  const persist = useCallback(
    async (nextTheme: AppearanceTheme, nextFontSize: AppearanceFontSize) => {
      applyAppearance(nextTheme, nextFontSize)
      if (!user) return
      const updated = await authApi.updateProfile({ theme: nextTheme, fontSize: nextFontSize })
      updateUser(updated)
    },
    [updateUser, user],
  )

  const setTheme = useCallback(
    async (next: AppearanceTheme) => {
      setThemeState(next)
      await persist(next, fontSize)
    },
    [fontSize, persist],
  )

  const setFontSize = useCallback(
    async (next: AppearanceFontSize) => {
      setFontSizeState(next)
      await persist(theme, next)
    },
    [persist, theme],
  )

  const value = useMemo(
    () => ({ theme, fontSize, setTheme, setFontSize }),
    [fontSize, setFontSize, setTheme, theme],
  )

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}

export function useAppearance() {
  const context = useContext(AppearanceContext)
  if (!context) throw new Error('useAppearance must be used within an AppearanceProvider')
  return context
}
