import { describe, expect, it, vi } from 'vitest'
import type { TransactionInput, TransactionRecord } from '@/domain/models'
import type { BookkeepingService } from '@/services/contracts'
import { saveTransaction } from './submission'

const input: TransactionInput = {
  type: 'expense',
  amountFen: 1250,
  categoryId: 'food',
  occurredAt: '2026-10-09',
  note: '午餐',
}

const record: TransactionRecord = {
  ...input,
  id: 'record-1',
  ownerOpenId: 'user-1',
  monthKey: '2026-10',
  createdAt: '2026-10-09T04:00:00.000Z',
  updatedAt: '2026-10-09T04:00:00.000Z',
}

function createService(): BookkeepingService {
  return {
    create: vi.fn().mockResolvedValue({ ok: true, data: record }),
    list: vi.fn(),
    update: vi.fn().mockResolvedValue({ ok: true, data: record }),
    remove: vi.fn(),
  }
}

describe('saveTransaction', () => {
  it('creates a record when there is no transaction id', async () => {
    const service = createService()
    await expect(saveTransaction(service, input)).resolves.toEqual({ ok: true, data: record })
    expect(service.create).toHaveBeenCalledWith(input)
    expect(service.update).not.toHaveBeenCalled()
  })

  it('updates the existing record in edit mode', async () => {
    const service = createService()
    await saveTransaction(service, input, { transactionId: 'record-1' })
    expect(service.update).toHaveBeenCalledWith('record-1', input)
    expect(service.create).not.toHaveBeenCalled()
  })

  it('returns a save error without changing the submitted input', async () => {
    const service = createService()
    const original = structuredClone(input)
    vi.mocked(service.create).mockResolvedValue({
      ok: false,
      error: { code: 'NETWORK_ERROR', message: '网络连接失败，请稍后重试。' },
    })

    await expect(saveTransaction(service, input)).resolves.toEqual({
      ok: false,
      error: { code: 'NETWORK_ERROR', message: '网络连接失败，请稍后重试。' },
    })
    expect(input).toEqual(original)
  })
})
