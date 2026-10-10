import { CATEGORIES, type MonthlyFinancialInsights } from '@/domain/models'

export function presentDailyTrend(insights: MonthlyFinancialInsights) {
  const maximum = Math.max(...insights.dailyExpenses.map((item) => item.amountFen), 0)
  return insights.dailyExpenses.map((item) => ({
    ...item,
    widthPercent: maximum === 0 ? 0 : Math.max(4, Math.round((item.amountFen / maximum) * 100)),
  }))
}

export function presentCategoryRanking(insights: MonthlyFinancialInsights) {
  if (insights.expenseFen <= 0) return []
  return insights.categoryExpenses.map((item) => ({
    ...item,
    name: CATEGORIES.find((category) => category.id === item.categoryId)?.name ?? '其他',
    percent: Math.round(item.ratio * 100),
  }))
}
