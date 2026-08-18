import type { AppearanceFontSize, AppearanceTheme } from '@/lib/api/types'

export const THEME_KEY = 'smp-theme'
export const FONT_SIZE_KEY = 'smp-font-size'

export const fontSizeOptions: Array<{ value: AppearanceFontSize; label: string; hint: string }> = [
  { value: 'small', label: 'Small', hint: 'Compact' },
  { value: 'medium', label: 'Default', hint: 'Comfortable' },
  { value: 'large', label: 'Large', hint: 'Easier to read' },
  { value: 'xlarge', label: 'Extra large', hint: 'Highest contrast size' },
]

export function isTheme(value: string | null | undefined): value is AppearanceTheme {
  return value === 'light' || value === 'dark'
}

export function isFontSize(value: string | null | undefined): value is AppearanceFontSize {
  return value === 'small' || value === 'medium' || value === 'large' || value === 'xlarge'
}

export function readStoredAppearance() {
  if (typeof window === 'undefined') {
    return { theme: 'light' as const, fontSize: 'medium' as const }
  }

  const theme = window.localStorage.getItem(THEME_KEY)
  const fontSize = window.localStorage.getItem(FONT_SIZE_KEY)
  return {
    theme: isTheme(theme) ? theme : 'light',
    fontSize: isFontSize(fontSize) ? fontSize : 'medium',
  }
}

export function applyAppearance(theme: AppearanceTheme, fontSize: AppearanceFontSize) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  root.dataset.fontSize = fontSize
  window.localStorage.setItem(THEME_KEY, theme)
  window.localStorage.setItem(FONT_SIZE_KEY, fontSize)
}
