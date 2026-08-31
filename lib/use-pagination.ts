'use client'

import { useEffect, useMemo, useState } from 'react'

export const PAGE_SIZE_OPTIONS = [20, 50, 100] as const
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]

export function usePagination<T>(items: T[], initialPageSize: PageSize = 20) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(initialPageSize)

  useEffect(() => {
    setPage(1)
  }, [items.length, pageSize])

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const page_ = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const start = (page_ - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page_, pageSize])

  return { pageItems, page: page_, pageSize, setPage, setPageSize, totalPages, totalItems }
}
