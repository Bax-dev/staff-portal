'use client'

import { useEffect, useState } from 'react'
import { Archive, ArrowDownToLine, ArrowUpFromLine, Eye, Pencil, Plus, Search, SlidersHorizontal, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { BulkDeleteStaffDialog } from '@/components/staff/bulk-delete-staff-dialog'
import { StaffAvatar } from '@/components/staff/staff-avatar'
import { toast, toastError } from '@/components/ui/toast'
import { useAuth } from '@/lib/auth-context'
import { useStaff } from '@/lib/staff-context'
import { usePagination } from '@/lib/use-pagination'

export function Directory() {
  const { staff, filteredStaff, query, setQuery, department, setDepartment, departments, selectStaff, openCreateForm, openEditForm, requestArchive, removeManyStaff, triggerImport, exportCsv, exportXlsx, isLoading, error } = useStaff()
  const { hasPermission } = useAuth()
  const canEdit = hasPermission('DIRECTORY', 'edit')
  const canDelete = hasPermission('DIRECTORY', 'delete')
  const { pageItems, page, pageSize, setPage, setPageSize, totalPages, totalItems } = usePagination(filteredStaff)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmingBulkDelete, setConfirmingBulkDelete] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  useEffect(() => {
    setSelectedIds(new Set())
  }, [department])

  const allOnPageSelected = pageItems.length > 0 && pageItems.every((person) => selectedIds.has(person.id))

  function toggleSelectAllOnPage() {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (allOnPageSelected) {
        pageItems.forEach((person) => next.delete(person.id))
      } else {
        pageItems.forEach((person) => next.add(person.id))
      }
      return next
    })
  }

  function toggleSelect(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleBulkDelete() {
    const ids = [...selectedIds]
    setBulkDeleting(true)
    try {
      await removeManyStaff(ids)
      toast.add({ type: 'success', title: `Removed ${ids.length} record${ids.length === 1 ? '' : 's'}.` })
      setSelectedIds(new Set())
      setConfirmingBulkDelete(false)
    } catch (err: unknown) {
      toastError(err, 'Could not remove the selected records.')
    } finally {
      setBulkDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            {filteredStaff.length} of {staff.length} records
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">Staff directory</h2>
          <p className="mt-2 text-sm text-muted-foreground">Search, filter, import and download staff records.</p>
        </div>
        <div data-tour="directory-actions" className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={triggerImport}>
            <ArrowUpFromLine data-icon="inline-start" />
            Import
          </Button>
          <Button variant="outline" onClick={exportCsv}>
            <ArrowDownToLine data-icon="inline-start" />
            CSV
          </Button>
          <Button variant="outline" onClick={exportXlsx}>
            <ArrowDownToLine data-icon="inline-start" />
            XLSX
          </Button>
          {canEdit && (
            <Button onClick={openCreateForm}>
              <Plus data-icon="inline-start" />
              Add staff
            </Button>
          )}
        </div>
      </div>
      <div data-tour="directory-search" className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            aria-label="Search staff"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, ID, designation or department"
            className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="relative min-w-56">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <select
            aria-label="Filter department"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="h-10 w-full appearance-none rounded-lg border bg-background pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option>All departments</option>
            {departments.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
      </div>
      {canDelete && selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
          <p className="text-sm font-medium">
            {selectedIds.size} record{selectedIds.size === 1 ? '' : 's'} selected
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
              <X data-icon="inline-start" />
              Clear
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setConfirmingBulkDelete(true)}>
              <Trash2 data-icon="inline-start" />
              Delete selected
            </Button>
          </div>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                {canDelete && (
                  <th className="w-10 px-5 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all staff on this page"
                      checked={allOnPageSelected}
                      onChange={toggleSelectAllOnPage}
                      className="size-4 rounded border-input accent-primary"
                    />
                  </th>
                )}
                <th className="px-5 py-3 font-medium">Staff member</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Designation</th>
                <th className="px-5 py-3 font-medium">Grade</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pageItems.map((person) => (
                <tr key={person.id} className="hover:bg-muted/30">
                  {canDelete && (
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        aria-label={`Select ${person.name}`}
                        checked={selectedIds.has(person.id)}
                        onChange={() => toggleSelect(person.id)}
                        className="size-4 rounded border-input accent-primary"
                      />
                    </td>
                  )}
                  <td className="px-5 py-4">
                    <button onClick={() => selectStaff(person)} className="flex items-center gap-3 text-left">
                      <StaffAvatar name={person.name} photo={person.photo} className="size-9 text-xs" />
                      <div>
                        <p className="font-medium">{person.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {person.staffId} · {person.email}
                        </p>
                      </div>
                    </button>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{person.department}</td>
                  <td className="px-5 py-4">{person.designation}</td>
                  <td className="px-5 py-4 text-muted-foreground">{person.grade}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">{person.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button aria-label={`View ${person.name}`} onClick={() => selectStaff(person)} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Eye className="size-4" />
                      </button>
                      {canEdit && (
                        <button aria-label={`Edit ${person.name}`} onClick={() => openEditForm(person)} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                          <Pencil className="size-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button aria-label={`Archive ${person.name}`} onClick={() => requestArchive(person)} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                          <Archive className="size-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStaff.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {isLoading ? 'Loading staff records…' : error ?? 'No staff records match your search.'}
          </div>
        )}
        <Pagination page={page} pageSize={pageSize} totalItems={totalItems} totalPages={totalPages} onPageChange={setPage} onPageSizeChange={setPageSize} />
      </div>
      {confirmingBulkDelete && (
        <BulkDeleteStaffDialog
          count={selectedIds.size}
          onCancel={() => !bulkDeleting && setConfirmingBulkDelete(false)}
          onConfirm={handleBulkDelete}
        />
      )}
    </div>
  )
}
