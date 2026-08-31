import { PermissionGate } from '@/components/auth/permission-gate'
import { Overview } from '@/components/pages/overview'

export default function Page() {
  return (
    <PermissionGate screen="OVERVIEW" capability="view">
      <Overview />
    </PermissionGate>
  )
}
