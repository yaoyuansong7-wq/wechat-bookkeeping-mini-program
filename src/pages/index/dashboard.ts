import type { MonthlyFinancialInsights, TransactionRecord } from '@/domain/models'
import type { BookkeepingService, InsightsService, ServiceError } from '@/services/contracts'

export type DashboardResult =
  | { ok: true; insights: MonthlyFinancialInsights; recent: TransactionRecord[] }
  | { ok: false; error: ServiceError }

export async function loadDashboard(insightsService: InsightsService, bookkeepingService: BookkeepingService, monthKey: string): Promise<DashboardResult> {
  const [insights, records] = await Promise.all([insightsService.getMonthly(monthKey), bookkeepingService.list(monthKey)])
  if (!insights.ok) return { ok: false, error: insights.error }
  if (!records.ok) return { ok: false, error: records.error }
  return { ok: true, insights: insights.data, recent: records.data.items.slice(0, 3) }
}
