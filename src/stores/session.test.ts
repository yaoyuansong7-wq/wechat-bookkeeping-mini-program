import { describe, expect, it } from 'vitest'
import type { IdentityService } from '../services/contracts'
import { createSessionStore } from './session'

describe('session store', () => {
  it('enters authenticated state after successful identity detection', async () => {
    const identity: IdentityService = {
      getSession: async () => ({ ok: true, data: { openId: 'user-a' } }),
    }
    const store = createSessionStore(identity)
    await store.load()
    expect(store.state).toMatchObject({ status: 'authenticated', session: { openId: 'user-a' }, error: null })
  })

  it('keeps personal data unavailable and supports retry after failure', async () => {
    let attempts = 0
    const identity: IdentityService = {
      getSession: async () => {
        attempts += 1
        return attempts === 1
          ? { ok: false, error: { code: 'AUTH_UNAVAILABLE', message: '请重试。' } }
          : { ok: true, data: { openId: 'user-a' } }
      },
    }
    const store = createSessionStore(identity)
    await store.load()
    expect(store.state).toMatchObject({ status: 'error', session: null })
    await store.retry()
    expect(store.state.status).toBe('authenticated')
  })
})
