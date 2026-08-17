'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, ChevronDown, LogOut, Menu } from 'lucide-react'
import { initials, navItems } from '@/lib/staff-data'
import { useAuth } from '@/lib/auth-context'

const roleCopy = {
  admin: { name: 'Admin Officer', label: 'Administrator' },
  staff: { name: 'Staff Officer', label: 'Staff member' },
} as const

export function Header({ onOpenNav }: { onOpenNav: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { role, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const activeLabel = navItems.find((item) => item.href === pathname)?.label ?? 'Overview'
  const profile = roleCopy[role ?? 'staff']

  function handleSignOut() {
    setMenuOpen(false)
    logout()
    router.push('/login')
  }

  return (
    <header className="flex h-20 items-center justify-between border-b bg-card px-5 md:px-8">
      <div className="flex items-center gap-3">
        <button aria-label="Open navigation" className="lg:hidden" onClick={onOpenNav}>
          <Menu className="size-5" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Planning and Design Directorate</p>
          <h1 className="text-lg font-semibold tracking-tight">{activeLabel}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
          <Bell className="size-4" />
        </button>
        <div className="hidden h-8 w-px bg-border sm:block" />
        <div className="relative" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false) }}>
          <button onClick={() => setMenuOpen((current) => !current)} aria-expanded={menuOpen} className="flex items-center gap-2 rounded-lg p-1 hover:bg-muted">
            <div className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials(profile.name)}</div>
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold">{profile.name}</p>
              <p className="text-[11px] text-muted-foreground">{profile.label}</p>
            </div>
            <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-2 w-44 overflow-hidden rounded-lg border bg-card shadow-lg">
              <button onClick={handleSignOut} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-destructive hover:bg-muted">
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
