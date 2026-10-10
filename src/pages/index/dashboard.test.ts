import { describe, expect, it, vi } from 'vitest'
import type { BookkeepingService, InsightsService } from '@/services/contracts'
import { loadDashboard } from './dashboard'

const emptyInsights = { monthKey: '2026-10', incomeFen: 0, expenseFen: 0, balanceFen: 0, dailyExpenses: [], categoryExpenses: [] }

describe('loadDashboard', () => {
  it('returns an empty monthly dashboard', async () => {
    const insights = { getMonthly: vi.fn().mockResolvedValue({ ok: true, data: emptyInsights }) } satisfies InsightsService
    const bookkeeping = { list: vi.fn().mockResolvedValue({ ok: true, data: { items: [], nextCursor: null } }) } as unknown as BookkeepingService
    await expect(loadDashboard(insights, bookkeeping, '2026-10')).resolves.toEqual({ ok: true, insights: emptyInsights, recent: [] })
  })

  it('keeps only the three most recent records', async () => {
    const insights = { getMonthly: vi.fn().mockResolvedValue({ ok: true, data: emptyInsights }) } satisfies InsightsService
    const items = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]
    const bookkeeping = { list: vi.fn().mockResolvedValue({ ok: true, data: { items, nextCursor: null } }) } as unknown as BookkeepingService
    const result = await loadDashboard(insights, bookkeeping, '2026-10')
    expect(result.ok && result.recent.map((item) => item.id)).toEqual(['1', '2', '3'])
  })

  it('returns a service error instead of partial data', async () => {
    const error = { code: 'NETWORK_ERROR' as const, message: '网络连接失败。' }
    const insights = { getMonthly: vi.fn().mockResolvedValue({ ok: false, error }) } satisfies InsightsService
    const bookkeeping = { list: vi.fn().mockResolvedValue({ ok: true, data: { items: [], nextCursor: null } }) } as unknown as BookkeepingService
    await expect(loadDashboard(insights, bookkeeping, '2026-10')).resolves.toEqual({ ok: false, error })
  })
})
