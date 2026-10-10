'use strict'

function calculate(monthKey, transactions) {
  let incomeFen = 0
  let expenseFen = 0
  const daily = new Map()
  const categories = new Map()

  for (const item of transactions) {
    if (item.type === 'income') {
      incomeFen += item.amountFen
      continue
    }
    expenseFen += item.amountFen
    daily.set(item.occurredAt, (daily.get(item.occurredAt) || 0) + item.amountFen)
    categories.set(item.categoryId, (categories.get(item.categoryId) || 0) + item.amountFen)
  }

  return {
    monthKey,
    incomeFen,
    expenseFen,
    balanceFen: incomeFen - expenseFen,
    dailyExpenses: [...daily.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, amountFen]) => ({ date, amountFen })),
    categoryExpenses: [...categories.entries()]
      .map(([categoryId, amountFen]) => ({
        categoryId,
        amountFen,
        ratio: expenseFen === 0 ? 0 : amountFen / expenseFen,
      }))
      .sort((left, right) => right.amountFen - left.amountFen),
  }
}

function createMonthlyInsightsHandler({ getOpenId, repository }) {
  return async function monthlyInsights(event = {}) {
    const ownerOpenId = getOpenId()
    if (!ownerOpenId) return { ok: false, error: { code: 'AUTH_REQUIRED', message: '无法识别微信用户身份，请重试。' } }
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(event.monthKey ?? '')) {
      return { ok: false, error: { code: 'VALIDATION_FAILED', message: '月份格式无效。' } }
    }
    const transactions = await repository.listByMonth(ownerOpenId, event.monthKey)
    return { ok: true, data: calculate(event.monthKey, transactions) }
  }
}

module.exports = { calculate, createMonthlyInsightsHandler }
