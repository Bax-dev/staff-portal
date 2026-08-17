import { StaffProvider } from '@/lib/staff-context'
import { AppShell } from '@/components/layout/app-shell'
import { AuthGate } from '@/components/auth/auth-gate'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <StaffProvider>
        <AppShell>{children}</AppShell>
      </StaffProvider>
    </AuthGate>
  )
}
