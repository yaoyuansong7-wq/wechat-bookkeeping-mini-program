import { describe, expect, it, vi } from 'vitest'
import type { BookkeepingService } from '@/services/contracts'
import { deleteTransaction } from './actions'

function service(): BookkeepingService {
  return { create: vi.fn(), list: vi.fn(), update: vi.fn(), remove: vi.fn().mockResolvedValue({ ok: true, data: { id: 'record-1' } }) }
}

describe('deleteTransaction', () => {
  it('does not delete when confirmation is cancelled', async () => {
    const bookkeeping = service()
    await expect(deleteTransaction(bookkeeping, 'record-1', false)).resolves.toBeNull()
    expect(bookkeeping.remove).not.toHaveBeenCalled()
  })

  it('deletes the selected record after confirmation', async () => {
    const bookkeeping = service()
    await expect(deleteTransaction(bookkeeping, 'record-1', true)).resolves.toEqual({ ok: true, data: { id: 'record-1' } })
    expect(bookkeeping.remove).toHaveBeenCalledWith('record-1')
  })
})
