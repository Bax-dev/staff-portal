'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export function GuestGate({ children }: { children: React.ReactNode }) {
  const { role, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && role) router.replace('/')
  }, [isLoading, role, router])

  if (isLoading || role) return null
  return <>{children}</>
}
