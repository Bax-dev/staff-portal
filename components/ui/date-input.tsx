'use client'

import { toDateInputValue } from '@/lib/dates'
import { cn } from '@/lib/utils'

type DateInputProps = {
  name: string
  defaultValue?: string | null
  required?: boolean
  max?: string
  min?: string
  className?: string
  'aria-label'?: string
}

export function DateInput({ name, defaultValue, required, max, min, className, 'aria-label': ariaLabel }: DateInputProps) {
  return (
    <input
      type="date"
      name={name}
      required={required}
      defaultValue={toDateInputValue(defaultValue)}
      max={max}
      min={min}
      aria-label={ariaLabel}
      className={cn('h-10 w-full min-w-0 rounded-lg border bg-background px-3 font-normal', className)}
    />
  )
}
