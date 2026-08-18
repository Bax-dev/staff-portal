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
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (isoDate) {
    const year = Number(isoDate[1])
    const month = Number(isoDate[2]) - 1
    const day = Number(isoDate[3])
    const parsed = new Date(year, month, day)
    if (parsed.getFullYear() !== year || parsed.getMonth() !== month || parsed.getDate() !== day) {
      throw new AppError(400, `Invalid date: ${value}`)
    }
    return parsed
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(400, `Invalid date: ${value}`)
  }
  return parsed
}

export function parseOptionalDate(value?: string) {
  if (!value) return undefined
  return parseDisplayDate(value)
}
