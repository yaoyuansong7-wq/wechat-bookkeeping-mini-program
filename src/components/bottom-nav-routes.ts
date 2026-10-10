export type MainTab = 'home' | 'records' | 'statistics' | 'profile'

export const MAIN_TAB_ROUTES: Record<MainTab, string> = {
  home: '/pages/index/index',
  records: '/pages/records/index',
  statistics: '/pages/statistics/index',
  profile: '/pages/profile/index',
}

export function routeForTab(tab: MainTab): string {
  return MAIN_TAB_ROUTES[tab]
}
