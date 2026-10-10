import { describe, expect, it, vi } from 'vitest'
import { createWechatServices, type CloudCaller } from './services'

describe('WeChat service adapter', () => {
  it('maps successful identity results', async () => {
    const caller = vi.fn(async () => ({ ok: true, data: { openId: 'user-a' } })) as CloudCaller
    const services = createWechatServices(caller)
    await expect(services.identity.getSession()).resolves.toEqual({ ok: true, data: { openId: 'user-a' } })
    expect(caller).toHaveBeenCalledWith('get-session', undefined)
  })

  it('preserves validation and authentication errors', async () => {
    const caller = vi.fn(async () => ({
      ok: false,
      error: { code: 'VALIDATION_FAILED' as const, message: '金额无效。' },
    })) as CloudCaller
    const result = await createWechatServices(caller).bookkeeping.create({
      type: 'expense', amountFen: 0, categoryId: 'food', occurredAt: '2026-10-09',
    })
    expect(result).toEqual({ ok: false, error: { code: 'VALIDATION_FAILED', message: '金额无效。' } })
  })

  it('maps rejected cloud calls to network errors', async () => {
    const caller = vi.fn(async () => { throw new Error('offline') }) as CloudCaller
    const result = await createWechatServices(caller).insights.getMonthly('2026-10')
    expect(result).toEqual({ ok: false, error: { code: 'NETWORK_ERROR', message: 'offline' } })
  })
})
