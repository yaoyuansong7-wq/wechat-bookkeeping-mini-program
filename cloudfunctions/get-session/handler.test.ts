import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const { createSessionHandler } = require('./handler.js') as {
  createSessionHandler: (
    getContext: () => { OPENID?: string },
  ) => () => Promise<unknown>
}

describe('get-session cloud function', () => {
  it('returns the trusted OpenID from the WeChat context', async () => {
    const handler = createSessionHandler(() => ({ OPENID: 'user-open-id' }))
    await expect(handler()).resolves.toEqual({
      ok: true,
      data: { openId: 'user-open-id' },
    })
  })

  it('returns an authentication error when OpenID is unavailable', async () => {
    const handler = createSessionHandler(() => ({}))
    await expect(handler()).resolves.toEqual({
      ok: false,
      error: {
        code: 'AUTH_REQUIRED',
        message: '无法识别微信用户身份，请重试。',
      },
    })
  })

  it('returns a retryable error when context lookup fails', async () => {
    const handler = createSessionHandler(() => {
      throw new Error('context unavailable')
    })
    await expect(handler()).resolves.toMatchObject({
      ok: false,
      error: { code: 'AUTH_UNAVAILABLE' },
    })
  })
})
