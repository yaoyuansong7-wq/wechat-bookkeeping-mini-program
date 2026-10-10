import { describe, expect, it } from 'vitest'
import { validateTransactionInput } from './validation'

describe('validateTransactionInput', () => {
  it('accepts a complete valid expense', () => {
    expect(validateTransactionInput({
      type: 'expense',
      amountFen: 3200,
      categoryId: 'food',
      occurredAt: '2026-10-09',
      note: '午餐',
    })).toEqual([])
  })

  it('reports missing and invalid required fields', () => {
    const fields = validateTransactionInput({ amountFen: 0 }).map((issue) => issue.field)
    expect(fields).toEqual(expect.arrayContaining(['type', 'amountFen', 'categoryId', 'occurredAt']))
  })

  it('rejects a category from the other transaction type', () => {
    expect(validateTransactionInput({
      type: 'income',
      amountFen: 100,
      categoryId: 'food',
      occurredAt: '2026-10-09',
    })).toContainEqual({ field: 'categoryId', message: '分类与收支类型不匹配。' })
  })
})
