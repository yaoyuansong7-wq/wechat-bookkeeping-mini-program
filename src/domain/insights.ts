import type {
  CategoryExpense,
  CategoryId,
  DailyExpense,
  MonthlyFinancialInsights,
  TransactionRecord,
} from './models'

export function calculateMonthlyInsights(
  monthKey: string,
  transactions: readonly TransactionRecord[],
): MonthlyFinancialInsights {
  let incomeFen = 0
  let expenseFen = 0
  const dailyTotals = new Map<string, number>()
  const categoryTotals = new Map<CategoryId, number>()

  for (const transaction of transactions) {
    if (transaction.monthKey !== monthKey) continue

    if (transaction.type === 'income') {
      incomeFen += transaction.amountFen
      continue
    }

    expenseFen += transaction.amountFen
    dailyTotals.set(
      transaction.occurredAt,
      (dailyTotals.get(transaction.occurredAt) ?? 0) + transaction.amountFen,
    )
    categoryTotals.set(
      transaction.categoryId,
      (categoryTotals.get(transaction.categoryId) ?? 0) + transaction.amountFen,
    )
  }

  const dailyExpenses: DailyExpense[] = [...dailyTotals.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, amountFen]) => ({ date, amountFen }))

  const categoryExpenses: CategoryExpense[] = [...categoryTotals.entries()]
    .map(([categoryId, amountFen]) => ({
      categoryId,
      amountFen,
      ratio: expenseFen === 0 ? 0 : amountFen / expenseFen,
    }))
    .sort((left, right) => right.amountFen - left.amountFen)

  return {
    monthKey,
    incomeFen,
    expenseFen,
    balanceFen: incomeFen - expenseFen,
    dailyExpenses,
    categoryExpenses,
  }
}
