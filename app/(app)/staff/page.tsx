import { PermissionGate } from '@/components/auth/permission-gate'
import { Directory } from '@/components/pages/directory'

export default function Page() {
  return (
    <PermissionGate screen="DIRECTORY" capability="view">
      <Directory />
    </PermissionGate>
  )
}
