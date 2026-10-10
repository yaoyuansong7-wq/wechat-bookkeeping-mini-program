import type {
  MonthlyFinancialInsights,
  TransactionInput,
  TransactionPage,
  TransactionRecord,
} from '../domain/models'

export type ServiceErrorCode =
  | 'AUTH_REQUIRED'
  | 'AUTH_UNAVAILABLE'
  | 'VALIDATION_FAILED'
  | 'NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'

export interface ServiceError {
  code: ServiceErrorCode
  message: string
  details?: unknown
}

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ServiceError }

export interface UserSession {
  openId: string
}

export interface IdentityService {
  getSession(): Promise<ServiceResult<UserSession>>
}

export interface BookkeepingService {
  create(input: TransactionInput): Promise<ServiceResult<TransactionRecord>>
  list(monthKey: string, cursor?: string): Promise<ServiceResult<TransactionPage>>
  update(id: string, input: TransactionInput): Promise<ServiceResult<TransactionRecord>>
  remove(id: string): Promise<ServiceResult<{ id: string }>>
}

export interface InsightsService {
  getMonthly(monthKey: string): Promise<ServiceResult<MonthlyFinancialInsights>>
}
