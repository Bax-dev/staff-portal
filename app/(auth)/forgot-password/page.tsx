'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, MailCheck, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthCard } from '@/components/auth/auth-card'
import { GuestGate } from '@/components/auth/guest-gate'
import { mockRequestPasswordReset } from '@/lib/auth'

export default function ForgotPasswordPage() {
  return (
    <GuestGate>
      <ForgotPasswordForm />
    </GuestGate>
  )
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await mockRequestPasswordReset({ email })
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (sent) {
    return (
      <AuthCard title="Check your email" description="We've sent password reset instructions if an account exists for that address.">
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">
            The link sent to <span className="font-medium text-foreground">{email}</span> will expire in 60 minutes.
          </p>
          <Button variant="outline" onClick={() => setSent(false)} className="mt-2">
            Use a different email
          </Button>
        </div>
        <Link href="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-primary">
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Forgot password" description="Enter your work email and we'll send you a reset link.">
      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Work email
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@organo.gov.ng"
            className="h-10 rounded-lg border bg-background px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-primary"
          />
        </label>
        <Button type="submit" disabled={isSubmitting} className="mt-2 h-10">
          {isSubmitting && <Loader2 data-icon="inline-start" className="animate-spin" />}
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
      <Link href="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-primary">
        <ArrowLeft className="size-3.5" />
        Back to sign in
      </Link>
    </AuthCard>
  )
}
