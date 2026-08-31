import { AdminGate } from '@/components/auth/permission-gate'
import { StaffAccess } from '@/components/pages/staff-access'

export default function Page() {
  return (
    <AdminGate>
      <StaffAccess />
    </AdminGate>
  )
}
