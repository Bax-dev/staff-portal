'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, ShieldCheck, X } from 'lucide-react'
import { navItems } from '@/lib/staff-data'

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <aside className={`${open ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden'} w-72 shrink-0 flex-col border-r bg-card lg:flex`}>
      <div className="flex h-20 items-center gap-3 border-b px-7">
        <div className="grid size-9 place-items-center rounded-lg bg-primary text-xs text-primary-foreground font-bold">SMP</div>
        <div>
          <p className="font-semibold tracking-tight">SMP</p>
          <p className="text-xs text-muted-foreground">Staff Management Portal</p>
        </div>
        <button aria-label="Close navigation" className="ml-auto lg:hidden" onClick={onClose}>
          <X className="size-5" />
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        <div data-tour="nav" className="flex flex-col gap-1">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-left transition-colors ${
                pathname === href ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </div>
        <div data-tour="audit" className="mt-auto rounded-xl bg-muted/60 p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <span className="text-xs font-semibold">Secure workspace</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">Manage staff data with controlled access and clear audit trails.</p>
          <Link href="/audit-log" onClick={onClose} className="mt-3 inline-block text-xs font-semibold text-primary">
            View audit log <ChevronRight className="ml-1 inline size-3" />
          </Link>
        </div>
      </nav>
    </aside>
  )
}
