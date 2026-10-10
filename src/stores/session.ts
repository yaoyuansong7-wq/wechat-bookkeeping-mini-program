import { reactive } from 'vue'
import type { IdentityService, ServiceError, UserSession } from '../services/contracts'

export type SessionStatus = 'idle' | 'loading' | 'authenticated' | 'error'

export interface SessionState {
  status: SessionStatus
  session: UserSession | null
  error: ServiceError | null
}

export function createSessionStore(identityService: IdentityService) {
  const state = reactive<SessionState>({
    status: 'idle',
    session: null,
    error: null,
  })

  async function load(): Promise<void> {
    state.status = 'loading'
    state.error = null
    const result = await identityService.getSession()
    if (result.ok) {
      state.session = result.data
      state.status = 'authenticated'
      return
    }
    state.session = null
    state.error = result.error
    state.status = 'error'
  }

  return { state, load, retry: load }
}
