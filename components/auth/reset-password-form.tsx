'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CircleCheck, Eye, EyeOff, Loader2, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthCard } from '@/components/auth/auth-card'
import { mockResetPassword } from '@/lib/auth'

export function ResetPasswordForm() {
  const router = useRouter()
  const token = useSearchParams().get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  if (!token) {
    return (
      <AuthCard title="Invalid reset link" description="This password reset link is invalid or has expired.">
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">Request a new link to continue resetting your password.</p>
          <Button nativeButton={false} render={<Link href="/forgot-password" />} className="mt-2">
            Request a new link
          </Button>
        </div>
      </AuthCard>
    )
  }

  if (done) {
    return (
      <AuthCard title="Password reset" description="Your password has been changed successfully.">
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <CircleCheck className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">Continue to sign in with your new password.</p>
          <Button nativeButton={false} render={<Link href="/login" />} className="mt-2">
            Continue to sign in
          </Button>
        </div>
      </AuthCard>
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setIsSubmitting(true)
    try {
      await mockResetPassword({ token, password })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard title="Reset password" description="Choose a new password for your account.">
      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium">
          New password
          <div className="relative">
            <input
              required
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="h-10 w-full rounded-lg border bg-background px-3 pr-10 text-sm font-normal outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Confirm new password
          <input
            required
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your new password"
            className="h-10 rounded-lg border bg-background px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-primary"
          />
        </label>
        <Button type="submit" disabled={isSubmitting} className="mt-2 h-10">
          {isSubmitting && <Loader2 data-icon="inline-start" className="animate-spin" />}
          {isSubmitting ? 'Resetting…' : 'Reset password'}
        </Button>
      </form>
    </AuthCard>
  )
}
