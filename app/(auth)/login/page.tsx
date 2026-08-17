'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, ShieldCheck, TriangleAlert, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthCard } from '@/components/auth/auth-card'
import { GuestGate } from '@/components/auth/guest-gate'
import { mockLogin, type Role } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'

const roles: { value: Role; label: string; icon: typeof Users }[] = [
  { value: 'staff', label: 'Staff', icon: Users },
  { value: 'admin', label: 'Admin', icon: ShieldCheck },
]

export default function LoginPage() {
  return (
    <GuestGate>
      <LoginForm />
    </GuestGate>
  )
}

function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [role, setRole] = useState<Role>('staff')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await mockLogin({ email, password, role })
      login(role)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard title="Welcome back" description="Sign in to access the staff administration workspace.">
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {roles.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            aria-pressed={role === value}
            className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              role === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

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
            placeholder={role === 'admin' ? 'admin@organo.gov.ng' : 'staff@organo.gov.ng'}
            className="h-10 rounded-lg border bg-background px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-primary"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Password
          <div className="relative">
            <input
              required
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
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
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 font-normal text-muted-foreground">
            <input type="checkbox" name="remember" className="size-4 rounded border-input" />
            Remember me
          </label>
          <Link href="/forgot-password" className="font-medium text-primary">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" disabled={isSubmitting} className="mt-2 h-10">
          {isSubmitting && <Loader2 data-icon="inline-start" className="animate-spin" />}
          {isSubmitting ? 'Signing in…' : `Sign in as ${role === 'admin' ? 'Admin' : 'Staff'}`}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">Demo mode — any email and a password of 6+ characters will sign you in.</p>
    </AuthCard>
  )
}
