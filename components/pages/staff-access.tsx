'use client'

import { useState } from 'react'
import { KeyRound, Plus, Power, ShieldCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toastError } from '@/components/ui/toast'
import { CreateAccountModal } from '@/components/staff/create-account-modal'
import { DeleteAccountDialog } from '@/components/staff/delete-account-dialog'
import { PermissionsModal } from '@/components/staff/permissions-modal'
import { ResetPasswordModal } from '@/components/staff/reset-password-modal'
import type { StaffAccount } from '@/lib/api/types'
import { StaffAccountsProvider, useStaffAccounts } from '@/lib/staff-accounts-context'

function permissionSummary(account: StaffAccount) {
  const viewCount = account.permissions.filter((permission) => permission.canView).length
  return `${viewCount} of ${account.permissions.length} screens`
}

function StaffAccessContent() {
  const {
    accounts,
    isLoading,
    error,
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
  } = useStaffAccounts()
  const [deletingAccount, setDeletingAccount] = useState<StaffAccount | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function handleToggleActive(account: StaffAccount) {
    setBusyId(account.id)
    try {
      if (account.isActive) {
        await deactivate(account.id)
      } else {
        await reactivate(account.id)
      }
    } catch (err) {
      toastError(err, account.isActive ? 'Could not deactivate this login.' : 'Could not reactivate this login.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!deletingAccount) return
    setBusyId(deletingAccount.id)
    try {
      await remove(deletingAccount.id)
      setDeletingAccount(null)
    } catch (err) {
      toastError(err, 'Could not delete this login.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">{accounts.length} staff logins</p>
          <h2 className="text-3xl font-semibold tracking-tight">Staff access</h2>
          <p className="mt-2 text-sm text-muted-foreground">Create logins for staff and control what each one can see and do.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus data-icon="inline-start" />
          Create login
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Staff member</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Access</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-muted/30">
                  <td className="px-5 py-4 font-medium">{account.staffName ?? account.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{account.email}</td>
                  <td className="px-5 py-4 text-muted-foreground">{account.role === 'ADMINISTRATOR' ? 'Administrator' : 'Staff'}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${account.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {account.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{permissionSummary(account)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        aria-label={`Manage permissions for ${account.email}`}
                        onClick={() => openPermissions(account)}
                        className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                        disabled={account.role === 'ADMINISTRATOR'}
                        title={account.role === 'ADMINISTRATOR' ? 'Administrators already have full access' : 'Manage permissions'}
                      >
                        <ShieldCheck className="size-4" />
                      </button>
                      <button
                        aria-label={`Reset password for ${account.email}`}
                        onClick={() => openResetPassword(account)}
                        className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <KeyRound className="size-4" />
                      </button>
                      <button
                        aria-label={account.isActive ? `Deactivate ${account.email}` : `Reactivate ${account.email}`}
                        onClick={() => handleToggleActive(account)}
                        disabled={busyId === account.id}
                        className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Power className="size-4" />
                      </button>
                      <button
                        aria-label={`Delete ${account.email}`}
                        onClick={() => setDeletingAccount(account)}
                        className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {accounts.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {isLoading ? 'Loading staff logins…' : error ?? 'No staff logins yet.'}
          </div>
        )}
      </div>

      {createOpen && <CreateAccountModal onClose={closeCreate} />}
      {permissionsAccount && (
        <PermissionsModal account={permissionsAccount} onClose={closePermissions} onSave={savePermissions} />
      )}
      {resetPasswordAccount && <ResetPasswordModal account={resetPasswordAccount} onClose={closeResetPassword} />}
      {deletingAccount && (
        <DeleteAccountDialog account={deletingAccount} onCancel={() => setDeletingAccount(null)} onConfirm={handleDelete} />
      )}
    </div>
  )
}

export function StaffAccess() {
  return (
    <StaffAccountsProvider>
      <StaffAccessContent />
    </StaffAccountsProvider>
  )
}
