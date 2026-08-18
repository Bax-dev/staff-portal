'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { TOUR_STORAGE_KEY, tourSteps } from '@/lib/tour'

type TourContextValue = {
  active: boolean
  stepIndex: number
  total: number
  start: () => void
  next: () => void
  prev: () => void
  skip: () => void
}

const TourContext = createContext<TourContextValue | null>(null)

function markComplete() {
  window.localStorage.setItem(TOUR_STORAGE_KEY, '1')
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const total = tourSteps.length

  const skip = useCallback(() => {
    markComplete()
    setActive(false)
  }, [])

  const start = useCallback(() => {
    setStepIndex(0)
    setActive(true)
  }, [])

  const next = useCallback(() => {
    setStepIndex((current) => {
      if (current >= total - 1) {
        markComplete()
        setActive(false)
        return current
      }
      return current + 1
    })
  }, [total])

  const prev = useCallback(() => {
    setStepIndex((current) => Math.max(0, current - 1))
  }, [])

  useEffect(() => {
    if (window.localStorage.getItem(TOUR_STORAGE_KEY)) return
    const timer = window.setTimeout(() => start(), 800)
    return () => window.clearTimeout(timer)
  }, [start])

  const value = useMemo(
    () => ({ active, stepIndex, total, start, next, prev, skip }),
    [active, next, prev, skip, start, stepIndex, total],
  )

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}

export function useTour() {
  const context = useContext(TourContext)
  if (!context) throw new Error('useTour must be used within a TourProvider')
  return context
}
