import { describe, expect, it } from 'vitest'
import type { TransactionRecord } from '@/domain/models'
import { mergeTransactionPages, shiftMonth } from './records-state'

function record(id: string, occurredAt: string, createdAt: string): TransactionRecord {
  return { id, occurredAt, createdAt, updatedAt: createdAt, ownerOpenId: 'user-1', monthKey: occurredAt.slice(0, 7), type: 'expense', amountFen: 100, categoryId: 'food' }
}

describe('records state', () => {
  it('orders records by occurrence and creation time, newest first', () => {
    const items = mergeTransactionPages([record('old', '2026-10-08', '2026-10-08T10:00:00Z')], [record('newer-created', '2026-10-09', '2026-10-09T12:00:00Z'), record('newest-created', '2026-10-09', '2026-10-09T13:00:00Z')])
    expect(items.map((item) => item.id)).toEqual(['newest-created', 'newer-created', 'old'])
  })

  it('deduplicates records across pages', () => {
    const original = record('same', '2026-10-09', '2026-10-09T12:00:00Z')
    const updated = { ...original, amountFen: 200 }
    expect(mergeTransactionPages([original], [updated])).toEqual([updated])
  })

  it('moves across year boundaries', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
  })
})
