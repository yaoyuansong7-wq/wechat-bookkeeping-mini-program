import { createRequire } from 'node:module'
import { beforeEach, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const { createTransactionsHandler } = require('./handler.js') as {
  createTransactionsHandler: (dependencies: {
    getOpenId: () => string
    repository: ReturnType<typeof createMemoryRepository>
    now: () => string
  }) => (event: Record<string, unknown>) => Promise<any>
}

function createMemoryRepository() {
  const records: any[] = []
  return {
    records,
    async create(data: any) {
      const record = { id: `record-${records.length + 1}`, ...data }
      records.push(record)
      return record
    },
    async listByMonth(ownerOpenId: string, monthKey: string, offset: number, pageSize: number) {
      const matches = records
        .filter((record) => record.ownerOpenId === ownerOpenId && record.monthKey === monthKey)
        .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || b.createdAt.localeCompare(a.createdAt))
      return { items: matches.slice(offset, offset + pageSize), hasMore: matches.length > offset + pageSize }
    },
    async updateOwned(id: string, ownerOpenId: string, data: any) {
      const record = records.find((item) => item.id === id && item.ownerOpenId === ownerOpenId)
      if (!record) return null
      Object.assign(record, data)
      return { ...record }
    },
    async deleteOwned(id: string, ownerOpenId: string) {
      const index = records.findIndex((item) => item.id === id && item.ownerOpenId === ownerOpenId)
      if (index < 0) return false
      records.splice(index, 1)
      return true
    },
  }
}

const validInput = {
  type: 'expense',
  amountFen: 3200,
  categoryId: 'food',
  occurredAt: '2026-10-09',
  note: ' 午餐 ',
}

describe('transactions cloud function', () => {
  let repository: ReturnType<typeof createMemoryRepository>
  let handler: ReturnType<typeof createTransactionsHandler>

  beforeEach(() => {
    repository = createMemoryRepository()
    handler = createTransactionsHandler({
      getOpenId: () => 'user-a',
      repository,
      now: () => '2026-10-09T12:00:00.000Z',
    })
  })

  it('creates a validated record owned by the trusted user', async () => {
    const result = await handler({ action: 'create', input: validInput })
    expect(result).toMatchObject({
      ok: true,
      data: { ownerOpenId: 'user-a', amountFen: 3200, monthKey: '2026-10', note: '午餐' },
    })
  })

  it('rejects invalid input on the server', async () => {
    const result = await handler({ action: 'create', input: { ...validInput, amountFen: -1 } })
    expect(result).toMatchObject({ ok: false, error: { code: 'VALIDATION_FAILED' } })
    expect(repository.records).toHaveLength(0)
  })

  it('lists the current user month with pagination', async () => {
    await handler({ action: 'create', input: validInput })
    await handler({ action: 'create', input: { ...validInput, occurredAt: '2026-10-08' } })
    const first = await handler({ action: 'list', monthKey: '2026-10', pageSize: 1 })
    expect(first.data.items).toHaveLength(1)
    expect(first.data.nextCursor).toBe('1')
    const second = await handler({ action: 'list', monthKey: '2026-10', pageSize: 1, cursor: first.data.nextCursor })
    expect(second.data.items).toHaveLength(1)
    expect(second.data.nextCursor).toBeNull()
  })

  it('updates and deletes an owned record', async () => {
    const created = await handler({ action: 'create', input: validInput })
    const updated = await handler({
      action: 'update',
      id: created.data.id,
      input: { ...validInput, amountFen: 5000, occurredAt: '2026-11-01' },
    })
    expect(updated).toMatchObject({ ok: true, data: { amountFen: 5000, monthKey: '2026-11' } })
    await expect(handler({ action: 'delete', id: created.data.id })).resolves.toEqual({
      ok: true,
      data: { id: created.data.id },
    })
    expect(repository.records).toHaveLength(0)
  })

  it('prevents another user from reading, updating, or deleting the record', async () => {
    const created = await handler({ action: 'create', input: validInput })
    const otherUser = createTransactionsHandler({
      getOpenId: () => 'user-b',
      repository,
      now: () => '2026-10-09T13:00:00.000Z',
    })

    const listed = await otherUser({ action: 'list', monthKey: '2026-10' })
    expect(listed.data.items).toEqual([])

    const updated = await otherUser({ action: 'update', id: created.data.id, input: validInput })
    expect(updated).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } })

    const deleted = await otherUser({ action: 'delete', id: created.data.id })
    expect(deleted).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } })
    expect(repository.records).toHaveLength(1)
    expect(repository.records[0].ownerOpenId).toBe('user-a')
  })
})
