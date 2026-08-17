'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { StaffDrawer } from '@/components/staff/staff-drawer'
import { StaffFormModal } from '@/components/staff/staff-form-modal'
import { DeleteStaffDialog } from '@/components/staff/delete-staff-dialog'
import { useStaff } from '@/lib/staff-context'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false)
  const { selectedStaff, selectStaff, formOpen, formStaff, closeForm, saveStaff, deletingStaff, cancelDelete, confirmDelete } = useStaff()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <Sidebar open={mobileNav} onClose={() => setMobileNav(false)} />
        {mobileNav && <button aria-label="Close menu" className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={() => setMobileNav(false)} />}
        <main className="min-w-0 flex-1">
          <Header onOpenNav={() => setMobileNav(true)} />
          <div className="mx-auto max-w-[1500px] p-5 md:p-8">{children}</div>
        </main>
      </div>
      {selectedStaff && <StaffDrawer person={selectedStaff} onClose={() => selectStaff(null)} />}
      {formOpen && <StaffFormModal key={formStaff?.id ?? 'create'} staff={formStaff} onClose={closeForm} onSubmit={saveStaff} />}
      {deletingStaff && <DeleteStaffDialog person={deletingStaff} onCancel={cancelDelete} onConfirm={confirmDelete} />}
    </div>
  )
}
