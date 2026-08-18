'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { initials } from '@/lib/staff-data'
import { resolveMediaUrl } from '@/lib/api'

export function StaffAvatar({ name, photo, className }: { name: string; photo?: string; className?: string }) {
  const [src, setSrc] = useState<string | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    if (!photo) {
      setSrc(undefined)
      return
    }
    resolveMediaUrl(photo)
      .then((url) => {
        if (!cancelled) setSrc(url)
      })
      .catch(() => {
        if (!cancelled) setSrc(undefined)
      })
    return () => {
      cancelled = true
    }
  }, [photo])

  if (src) {
    return <img src={src} alt={name} className={cn('shrink-0 rounded-full object-cover', className)} />
  }
  return <div className={cn('grid shrink-0 place-items-center rounded-full bg-primary/10 font-semibold text-primary', className)}>{initials(name)}</div>
}
