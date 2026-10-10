import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const { createMonthlyInsightsHandler } = require('./handler.js') as {
  createMonthlyInsightsHandler: (dependencies: any) => (event: any) => Promise<any>
}

describe('monthly-insights cloud function', () => {
  it('returns zero values for an empty month', async () => {
    const handler = createMonthlyInsightsHandler({
      getOpenId: () => 'user-a',
      repository: { listByMonth: async () => [] },
    })
    await expect(handler({ monthKey: '2026-10' })).resolves.toEqual({
      ok: true,
      data: {
        monthKey: '2026-10',
        incomeFen: 0,
        expenseFen: 0,
        balanceFen: 0,
        dailyExpenses: [],
        categoryExpenses: [],
      },
    })
  })

  it('queries only the trusted user and calculates all insights', async () => {
    const calls: unknown[] = []
    const handler = createMonthlyInsightsHandler({
      getOpenId: () => 'user-a',
      repository: {
        listByMonth: async (...args: unknown[]) => {
          calls.push(args)
          return [
            { type: 'income', amountFen: 10000, categoryId: 'salary', occurredAt: '2026-10-01' },
            { type: 'expense', amountFen: 2500, categoryId: 'food', occurredAt: '2026-10-02' },
          ]
        },
      },
    })
    const result = await handler({ monthKey: '2026-10' })
    expect(calls).toEqual([['user-a', '2026-10']])
    expect(result).toMatchObject({
      ok: true,
      data: {
        incomeFen: 10000,
        expenseFen: 2500,
        balanceFen: 7500,
        dailyExpenses: [{ date: '2026-10-02', amountFen: 2500 }],
        categoryExpenses: [{ categoryId: 'food', amountFen: 2500, ratio: 1 }],
      },
    })
  })

  it('rejects invalid months', async () => {
    const handler = createMonthlyInsightsHandler({
      getOpenId: () => 'user-a',
      repository: { listByMonth: async () => [] },
    })
    await expect(handler({ monthKey: '2026-13' })).resolves.toMatchObject({
      ok: false,
      error: { code: 'VALIDATION_FAILED' },
    })
  })
})
