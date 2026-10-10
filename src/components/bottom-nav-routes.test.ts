import { describe, expect, it } from 'vitest'
import { routeForTab } from './bottom-nav-routes'

describe('bottom navigation routes', () => {
  it('maps every main tab to an accessible page', () => {
    expect(routeForTab('home')).toBe('/pages/index/index')
    expect(routeForTab('records')).toBe('/pages/records/index')
    expect(routeForTab('statistics')).toBe('/pages/statistics/index')
    expect(routeForTab('profile')).toBe('/pages/profile/index')
  })
})
