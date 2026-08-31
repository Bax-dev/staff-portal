import { PermissionGate } from '@/components/auth/permission-gate'
import { Settings } from '@/components/pages/settings'

export default function Page() {
  return (
    <PermissionGate screen="SETTINGS" capability="view">
      <Settings />
    </PermissionGate>
  )
}
