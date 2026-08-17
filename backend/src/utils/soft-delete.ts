export function appendDeletedAt(value: string, deletedAt: Date) {
  return `${value}_${deletedAt.toISOString()}`
}
