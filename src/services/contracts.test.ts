import { describe, expectTypeOf, it } from 'vitest'
import type { BookkeepingService, IdentityService, InsightsService } from './contracts'

describe('platform-independent service contracts', () => {
  it('are consumable without importing WeChat APIs', () => {
    expectTypeOf<IdentityService>().toBeObject()
    expectTypeOf<BookkeepingService>().toBeObject()
    expectTypeOf<InsightsService>().toBeObject()
  })
})
