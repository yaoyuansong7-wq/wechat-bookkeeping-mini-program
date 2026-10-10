import type { TransactionRecord } from '@/domain/models'

export function mergeTransactionPages(current: TransactionRecord[], incoming: TransactionRecord[]): TransactionRecord[] {
  const records = new Map(current.map((item) => [item.id, item]))
  incoming.forEach((item) => records.set(item.id, item))
  return [...records.values()].sort((left, right) => (
    right.occurredAt.localeCompare(left.occurredAt) || right.createdAt.localeCompare(left.createdAt)
  ))
}

export function shiftMonth(monthKey: string, offset: number): string {
  const [year, month] = monthKey.split('-').map(Number)
  const target = new Date(Date.UTC(year, month - 1 + offset, 1))
  return `${target.getUTCFullYear()}-${String(target.getUTCMonth() + 1).padStart(2, '0')}`
}
