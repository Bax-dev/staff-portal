'use client'

import { nigerianStates, resolveNigerianState } from '@/lib/nigeria'
import { cn } from '@/lib/utils'

type StateSelectProps = {
  name: string
  defaultValue?: string | null
  required?: boolean
  className?: string
}

export function StateSelect({ name, defaultValue, required, className }: StateSelectProps) {
  const resolved = resolveNigerianState(defaultValue)
  const extraOption = resolved && !(nigerianStates as readonly string[]).includes(resolved) ? [resolved] : []

  return (
    <select
      name={name}
      required={required}
      defaultValue={resolved}
      className={cn('h-10 w-full min-w-0 rounded-lg border bg-background px-3 font-normal', className)}
    >
      <option value="">Select state</option>
      {[...extraOption, ...nigerianStates].map((state) => (
        <option key={state} value={state}>
          {state}
        </option>
      ))}
    </select>
  )
}
