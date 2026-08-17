import { Suspense } from 'react'
import { GuestGate } from '@/components/auth/guest-gate'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export default function ResetPasswordPage() {
  return (
    <GuestGate>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </GuestGate>
  )
}
