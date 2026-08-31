import { PermissionGate } from '@/components/auth/permission-gate'
import { Reports } from '@/components/pages/reports'

export default function Page() {
  return (
    <PermissionGate screen="REPORTS" capability="view">
      <Reports />
    </PermissionGate>
  )
}
