import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PAGE_SIZE_OPTIONS, type PageSize } from '@/lib/use-pagination'

interface PaginationProps {
  page: number
  pageSize: PageSize
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: PageSize) => void
}

export function Pagination({ page, pageSize, totalItems, totalPages, onPageChange, onPageSizeChange }: PaginationProps) {
  if (totalItems === 0) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t px-5 py-3 text-sm text-muted-foreground sm:flex-row">
      <p>
        Showing {start}–{end} of {totalItems}
      </p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="text-xs">
            Rows per page
          </label>
          <select
            id="page-size"
            aria-label="Rows per page"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value) as PageSize)}
            className="h-8 rounded-lg border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" aria-label="Previous page" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-16 text-center text-xs">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="icon-sm" aria-label="Next page" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
