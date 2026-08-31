import { PermissionGate } from '@/components/auth/permission-gate'
import { ArchivePage } from '@/components/pages/archive'

export default function Page() {
  return (
    <PermissionGate screen="ARCHIVE" capability="view">
      <ArchivePage />
    </PermissionGate>
  )
}
