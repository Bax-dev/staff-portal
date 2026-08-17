import { cn } from '@/lib/utils'
import { initials } from '@/lib/staff-data'

export function StaffAvatar({ name, photo, className }: { name: string; photo?: string; className?: string }) {
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt={name} className={cn('shrink-0 rounded-full object-cover', className)} />
  }
  return <div className={cn('grid shrink-0 place-items-center rounded-full bg-primary/10 font-semibold text-primary', className)}>{initials(name)}</div>
}
