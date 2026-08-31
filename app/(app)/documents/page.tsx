import { PermissionGate } from '@/components/auth/permission-gate'
import { Documents } from '@/components/pages/documents'

export default function Page() {
  return (
    <PermissionGate screen="DOCUMENTS" capability="view">
      <Documents />
    </PermissionGate>
  )
}
