import { describe, expect, it } from 'vitest'
import type { MonthlyFinancialInsights } from '@/domain/models'
import { presentCategoryRanking, presentDailyTrend } from './presenter'

const empty: MonthlyFinancialInsights = { monthKey: '2026-10', incomeFen: 0, expenseFen: 0, balanceFen: 0, dailyExpenses: [], categoryExpenses: [] }

describe('statistics presenter', () => {
  it('does not calculate category percentages without expenses', () => {
    expect(presentCategoryRanking(empty)).toEqual([])
  })

  it('presents daily bars relative to the largest expense', () => {
    expect(presentDailyTrend({ ...empty, dailyExpenses: [{ date: '2026-10-01', amountFen: 250 }, { date: '2026-10-02', amountFen: 1000 }] })).toEqual([
      { date: '2026-10-01', amountFen: 250, widthPercent: 25 },
      { date: '2026-10-02', amountFen: 1000, widthPercent: 100 },
    ])
  })

  it('presents category names and rounded percentages', () => {
    const result = presentCategoryRanking({ ...empty, expenseFen: 1000, categoryExpenses: [{ categoryId: 'food', amountFen: 667, ratio: 0.667 }, { categoryId: 'transport', amountFen: 333, ratio: 0.333 }] })
    expect(result.map(({ name, percent }) => ({ name, percent }))).toEqual([{ name: '餐饮', percent: 67 }, { name: '交通', percent: 33 }])
  })
})
