import { PermissionGate } from '@/components/auth/permission-gate'
import { AuditLogPage } from '@/components/pages/audit-log'

export default function Page() {
  return (
    <PermissionGate screen="AUDIT_LOG" capability="view">
      <AuditLogPage />
    </PermissionGate>
  )
}
