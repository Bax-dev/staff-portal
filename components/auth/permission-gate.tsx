'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Screen } from '@/lib/api/types'
import { useAuth } from '@/lib/auth-context'

export function PermissionGate({
  screen,
  capability,
  children,
}: {
  screen: Screen
  capability: 'view' | 'edit' | 'delete'
  children: React.ReactNode
}) {
  const { isLoading, hasPermission } = useAuth()
  const router = useRouter()
  const allowed = hasPermission(screen, capability)

  useEffect(() => {
    if (!isLoading && !allowed) router.replace('/')
  }, [isLoading, allowed, router])

  if (isLoading || !allowed) return null
  return <>{children}</>
}

// "Staff access" is an admin-only tool, not one of the 8 permissioned
// screens, so it gates on role rather than a Screen/capability pair.
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { isLoading, role } = useAuth()
  const router = useRouter()
  const isAdmin = role === 'admin'

  useEffect(() => {
    if (!isLoading && !isAdmin) router.replace('/')
  }, [isLoading, isAdmin, router])

  if (isLoading || !isAdmin) return null
  return <>{children}</>
}
