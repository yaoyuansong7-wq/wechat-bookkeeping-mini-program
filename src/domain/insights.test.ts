import { describe, expect, it } from 'vitest'
import type { TransactionRecord } from './models'
import { calculateMonthlyInsights } from './insights'

function record(overrides: Partial<TransactionRecord>): TransactionRecord {
  return {
    id: 'transaction-1',
    ownerOpenId: 'user-a',
    type: 'expense',
    amountFen: 100,
    categoryId: 'food',
    occurredAt: '2026-10-01',
    monthKey: '2026-10',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('calculateMonthlyInsights', () => {
  it('returns zero totals for an empty month', () => {
    expect(calculateMonthlyInsights('2026-10', [])).toEqual({
      monthKey: '2026-10',
      incomeFen: 0,
      expenseFen: 0,
      balanceFen: 0,
      dailyExpenses: [],
      categoryExpenses: [],
    })
  })

  it('calculates income, expenses, balance, daily totals and category ratios', () => {
    const result = calculateMonthlyInsights('2026-10', [
      record({ id: 'salary', type: 'income', categoryId: 'salary', amountFen: 850000 }),
      record({ id: 'food-1', amountFen: 3200 }),
      record({ id: 'food-2', amountFen: 1800, occurredAt: '2026-10-02' }),
      record({ id: 'transport', categoryId: 'transport', amountFen: 5000, occurredAt: '2026-10-02' }),
      record({ id: 'other-month', monthKey: '2026-09', occurredAt: '2026-09-30', amountFen: 9999 }),
    ])

    expect(result.incomeFen).toBe(850000)
    expect(result.expenseFen).toBe(10000)
    expect(result.balanceFen).toBe(840000)
    expect(result.dailyExpenses).toEqual([
      { date: '2026-10-01', amountFen: 3200 },
      { date: '2026-10-02', amountFen: 6800 },
    ])
    expect(result.categoryExpenses).toEqual([
      { categoryId: 'food', amountFen: 5000, ratio: 0.5 },
      { categoryId: 'transport', amountFen: 5000, ratio: 0.5 },
    ])
  })

  it('reflects modified and deleted records from the current input set', () => {
    const original = record({ amountFen: 1000 })
    expect(calculateMonthlyInsights('2026-10', [original]).expenseFen).toBe(1000)
    expect(calculateMonthlyInsights('2026-10', [{ ...original, amountFen: 2500 }]).expenseFen).toBe(2500)
    expect(calculateMonthlyInsights('2026-10', []).expenseFen).toBe(0)
  })
})
