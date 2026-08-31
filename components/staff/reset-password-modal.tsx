'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CredentialsFormatPicker, type CredentialsDeliveryFormat } from '@/components/staff/credentials-format-picker'
import { CredentialsReveal } from '@/components/staff/credentials-reveal'
import { toast } from '@/components/ui/toast'
import { staffAccountsApi } from '@/lib/api'
import type { StaffAccount } from '@/lib/api/types'
import { useStaffAccounts } from '@/lib/staff-accounts-context'

function generatePassword() {
  const bytes = new Uint8Array(9)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0')).join('').slice(0, 12)
}

export function ResetPasswordModal({ account, onClose }: { account: StaffAccount; onClose: () => void }) {
  const { refresh } = useStaffAccounts()
  const [password, setPassword] = useState('')
  const [format, setFormat] = useState<CredentialsDeliveryFormat>('xlsx')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<{ email: string; password: string } | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const explicitPassword = password.trim() || undefined
      if (format === 'screen') {
        const result = await staffAccountsApi.resetPassword(account.id, explicitPassword)
        await refresh()
        setRevealed({ email: result.email, password: result.plainPassword })
      } else {
        await staffAccountsApi.resetPassword(account.id, explicitPassword, format)
        await refresh()
        toast.add({ type: 'success', title: 'Password reset and credentials downloaded.' })
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset this password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (revealed) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4">
        <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl">
          <CredentialsReveal email={revealed.email} password={revealed.password} onDone={onClose} />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4">
      <div className="w-full max-w-md rounded-xl border bg-card shadow-xl">
        <div className="flex items-start justify-between border-b p-5">
          <div>
            <h2 className="text-lg font-semibold">Reset password</h2>
            <p className="mt-1 text-sm text-muted-foreground">{account.staffName ?? account.name} · {account.email}</p>
          </div>
          <button aria-label="Close reset password" onClick={onClose}>
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <label className="flex flex-col gap-2 text-sm font-medium">
            New password
            <div className="flex gap-2">
              <input
                type="text"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Leave blank to auto-generate"
                className="h-10 w-full min-w-0 rounded-lg border bg-background px-3 font-normal"
              />
              <Button type="button" variant="outline" onClick={() => setPassword(generatePassword())}>
                Generate
              </Button>
            </div>
          </label>
          <CredentialsFormatPicker name="reset-format" value={format} onChange={setFormat} />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Resetting…' : 'Reset password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
