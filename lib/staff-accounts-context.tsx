'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { staffAccountsApi, staffApi } from '@/lib/api'
import type { ScreenPermission, StaffAccount } from '@/lib/api/types'
import type { Staff } from '@/lib/staff-data'

type StaffAccountsContextValue = {
  accounts: StaffAccount[]
  staffWithoutLogin: Staff[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  createOpen: boolean
  openCreate: () => void
  closeCreate: () => void
  permissionsAccount: StaffAccount | null
  openPermissions: (account: StaffAccount) => void
  closePermissions: () => void
  savePermissions: (id: string, permissions: ScreenPermission[]) => Promise<void>
  resetPasswordAccount: StaffAccount | null
  openResetPassword: (account: StaffAccount) => void
  closeResetPassword: () => void
  deactivate: (id: string) => Promise<void>
  reactivate: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

const StaffAccountsContext = createContext<StaffAccountsContextValue | null>(null)

export function StaffAccountsProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<StaffAccount[]>([])
  const [staffWithoutLogin, setStaffWithoutLogin] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [permissionsAccount, setPermissionsAccount] = useState<StaffAccount | null>(null)
  const [resetPasswordAccount, setResetPasswordAccount] = useState<StaffAccount | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    const [allAccounts, allStaff] = await Promise.all([staffAccountsApi.list(), staffApi.list()])
    const staffIdsWithLogin = new Set(allAccounts.map((account) => account.staffId).filter((id): id is string => Boolean(id)))
    setAccounts(allAccounts)
    setStaffWithoutLogin(allStaff.filter((person) => !staffIdsWithLogin.has(person.id)))
  }, [])

  useEffect(() => {
    setIsLoading(true)
    refresh()
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load staff logins.'))
      .finally(() => setIsLoading(false))
  }, [refresh])

  function openCreate() {
    setCreateOpen(true)
  }

  function closeCreate() {
    setCreateOpen(false)
  }

  function openPermissions(account: StaffAccount) {
    setPermissionsAccount(account)
  }

  function closePermissions() {
    setPermissionsAccount(null)
  }

  async function savePermissions(id: string, permissions: ScreenPermission[]) {
    await staffAccountsApi.updatePermissions(id, permissions)
    setPermissionsAccount(null)
    await refresh()
  }

  function openResetPassword(account: StaffAccount) {
    setResetPasswordAccount(account)
  }

  function closeResetPassword() {
    setResetPasswordAccount(null)
  }

  async function deactivate(id: string) {
    await staffAccountsApi.deactivate(id)
    await refresh()
  }

  async function reactivate(id: string) {
    await staffAccountsApi.reactivate(id)
    await refresh()
  }

  async function remove(id: string) {
    await staffAccountsApi.remove(id)
    await refresh()
  }

  const value: StaffAccountsContextValue = {
    accounts,
    staffWithoutLogin,
    isLoading,
    error,
    refresh,
    createOpen,
    openCreate,
    closeCreate,
    permissionsAccount,
    openPermissions,
    closePermissions,
    savePermissions,
    resetPasswordAccount,
    openResetPassword,
    closeResetPassword,
    deactivate,
    reactivate,
    remove,
  }

  return <StaffAccountsContext.Provider value={value}>{children}</StaffAccountsContext.Provider>
}

export function useStaffAccounts() {
  const context = useContext(StaffAccountsContext)
  if (!context) throw new Error('useStaffAccounts must be used within a StaffAccountsProvider')
  return context
}
