import { describe, expect, it } from 'vitest'
import { maskOpenId } from './presenter'

describe('profile presenter', () => {
  it('masks a long WeChat OpenID', () => {
    expect(maskOpenId('o123456789abcdefgh')).toBe('o12345…efgh')
  })

  it('keeps a short development identity readable', () => {
    expect(maskOpenId('user-1')).toBe('user-1')
  })
})
