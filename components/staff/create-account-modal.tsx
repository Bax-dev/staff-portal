'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldLabel } from '@/components/ui/field-label'
import { toast } from '@/components/ui/toast'
import { CredentialsFormatPicker, type CredentialsDeliveryFormat } from '@/components/staff/credentials-format-picker'
import { CredentialsReveal } from '@/components/staff/credentials-reveal'
import { staffAccountsApi } from '@/lib/api'
import { useStaffAccounts } from '@/lib/staff-accounts-context'

function generatePassword() {
  const bytes = new Uint8Array(9)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0')).join('').slice(0, 12)
}

function field(form: FormData, name: string) {
  return String(form.get(name) ?? '')
}

export function CreateAccountModal({ onClose }: { onClose: () => void }) {
  const { staffWithoutLogin, refresh } = useStaffAccounts()
  const [staffId, setStaffId] = useState(staffWithoutLogin[0]?.id ?? '')
  const [email, setEmail] = useState(staffWithoutLogin[0]?.email ?? '')
  const [password, setPassword] = useState('')
  const [format, setFormat] = useState<CredentialsDeliveryFormat>('xlsx')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<{ email: string; password: string } | null>(null)

  function handleStaffChange(id: string) {
    setStaffId(id)
    const person = staffWithoutLogin.find((candidate) => candidate.id === id)
    setEmail(person?.email ?? '')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const input = {
      staffId: field(form, 'staffId'),
      email: field(form, 'email'),
      password: password.trim() || undefined,
    }

    setError(null)
    setIsSubmitting(true)
    try {
      if (format === 'screen') {
        const result = await staffAccountsApi.create(input)
        await refresh()
        setRevealed({ email: result.email, password: result.plainPassword })
      } else {
        await staffAccountsApi.create(input, format)
        await refresh()
        toast.add({ type: 'success', title: 'Login created and credentials downloaded.' })
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create this login.')
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
            <h2 className="text-lg font-semibold">Create login</h2>
            <p className="mt-1 text-sm text-muted-foreground">Give a staff member access to the portal.</p>
          </div>
          <button aria-label="Close create login" onClick={onClose}>
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          {staffWithoutLogin.length === 0 ? (
            <p className="text-sm text-muted-foreground">Every staff record already has a login.</p>
          ) : (
            <>
              <label className="flex flex-col gap-2 text-sm font-medium">
                <FieldLabel required>Staff member</FieldLabel>
                <select
                  required
                  name="staffId"
                  value={staffId}
                  onChange={(event) => handleStaffChange(event.target.value)}
                  className="h-10 w-full rounded-lg border bg-background px-3 font-normal"
                >
                  {staffWithoutLogin.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name} · {person.staffId}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                <FieldLabel required>Email</FieldLabel>
                <input
                  required
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-10 w-full rounded-lg border bg-background px-3 font-normal"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Password
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="password"
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
              <CredentialsFormatPicker name="format" value={format} onChange={setFormat} />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating…' : 'Create login'}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
