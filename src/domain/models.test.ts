import { describe, expect, it } from 'vitest'
import { CATEGORIES, type TransactionInput } from './models'

describe('bookkeeping models', () => {
  it('keeps category identifiers unique and aligned with their type', () => {
    const ids = CATEGORIES.map((category) => category.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(CATEGORIES.some((category) => category.type === 'income')).toBe(true)
    expect(CATEGORIES.some((category) => category.type === 'expense')).toBe(true)
  })

  it('provides a shared transaction input contract', () => {
    const input: TransactionInput = {
      type: 'expense',
      amountFen: 3200,
      categoryId: 'food',
      occurredAt: '2026-10-09',
    }

    expect(input.amountFen).toBe(3200)
  })
})
