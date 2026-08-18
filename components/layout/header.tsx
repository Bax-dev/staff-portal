'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, ChevronDown, LogOut, Menu, Settings } from 'lucide-react'
import { navItems } from '@/lib/staff-data'
import { useAuth } from '@/lib/auth-context'
import { useStaff } from '@/lib/staff-context'
import { notificationApi } from '@/lib/api'
import type { AppNotification } from '@/lib/api/types'
import { StaffAvatar } from '@/components/staff/staff-avatar'

export function Header({ onOpenNav }: { onOpenNav: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { organizationName, dataVersion } = useStaff()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const activeLabel = navItems.find((item) => item.href === pathname)?.label ?? 'Overview'
  const unread = notifications.filter((item) => !item.readAt).length

  useEffect(() => {
    if (!user) return
    notificationApi.list(user.id).then(setNotifications).catch(() => setNotifications([]))
  }, [user, dataVersion])

  function handleSignOut() {
    setMenuOpen(false)
    logout()
    router.push('/login')
  }

  async function handleRead(id: string) {
    const updated = await notificationApi.markRead(id)
    setNotifications((current) => current.map((item) => (item.id === updated.id ? updated : item)))
  }

  return (
    <header className="flex h-20 items-center justify-between border-b bg-card px-5 md:px-8">
      <div className="flex items-center gap-3">
        <button aria-label="Open navigation" className="lg:hidden" onClick={onOpenNav}>
          <Menu className="size-5" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{organizationName}</p>
          <h1 className="text-lg font-semibold tracking-tight">{activeLabel}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setNotesOpen(false) }}>
          <button data-tour="notifications" aria-label="Notifications" onClick={() => setNotesOpen((current) => !current)} className="relative grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
            <Bell className="size-4" />
            {unread > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />}
          </button>
          {notesOpen && (
            <div className="absolute right-0 top-full z-10 mt-2 w-80 overflow-hidden rounded-lg border bg-card shadow-lg">
              <div className="border-b px-3 py-2 text-xs font-semibold">Notifications</div>
              {notifications.length === 0 ? (
                <p className="px-3 py-4 text-sm text-muted-foreground">No notifications yet.</p>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((item) => (
                    <button key={item.id} onClick={() => handleRead(item.id)} className="flex w-full flex-col items-start gap-1 border-b px-3 py-3 text-left last:border-b-0 hover:bg-muted">
                      <p className={`text-sm ${item.readAt ? 'text-muted-foreground' : 'font-medium'}`}>{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.body}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="hidden h-8 w-px bg-border sm:block" />
        <div className="relative" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false) }}>
          <button onClick={() => setMenuOpen((current) => !current)} aria-expanded={menuOpen} className="flex items-center gap-2 rounded-lg p-1 hover:bg-muted">
            <StaffAvatar name={user?.name ?? 'User'} photo={user?.photo ?? undefined} className="size-8 text-xs" />
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold">{user?.name ?? 'User'}</p>
              <p className="text-[11px] text-muted-foreground">{user?.role === 'admin' ? 'Administrator' : 'Staff member'}</p>
            </div>
            <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-2 w-44 overflow-hidden rounded-lg border bg-card shadow-lg">
              <button onClick={() => { setMenuOpen(false); router.push('/settings') }} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted">
                <Settings className="size-4" />
                Account setup
              </button>
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
