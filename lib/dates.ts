function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function toDateInputValue(value?: string | null) {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'Not specified' || trimmed === 'Not provided') return ''

  const iso = /^(\d{4}-\d{2}-\d{2})/.exec(trimmed)
  if (iso) return iso[1]

  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return ''

  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`
}

export function todayInputValue() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function formatDateLabel(value?: string | null) {
  const input = toDateInputValue(value)
  if (!input) return ''
  const [year, month, day] = input.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
