import { services } from '../services'
import { createSessionStore } from './session'

export const sessionStore = createSessionStore(services.identity)
