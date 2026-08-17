import { AppError } from './errors.js'

const displayDate = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatDisplayDate(value: Date | null) {
  if (!value) return 'Not specified'
  return displayDate.format(value)
}

export function parseDisplayDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(400, `Invalid date: ${value}`)
  }
  return parsed
}
