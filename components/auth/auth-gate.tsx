'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { role, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !role) router.replace('/login')
  }, [isLoading, role, router])

  if (isLoading || !role) return null
  return <>{children}</>
}
