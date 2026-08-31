import { PermissionGate } from '@/components/auth/permission-gate'
import { Organization } from '@/components/pages/organization'

export default function Page() {
  return (
    <PermissionGate screen="ORGANIZATION" capability="view">
      <Organization />
    </PermissionGate>
  )
}
