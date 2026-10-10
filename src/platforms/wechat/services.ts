import type { TransactionInput } from '../../domain/models'
import type {
  BookkeepingService,
  IdentityService,
  InsightsService,
  ServiceError,
  ServiceResult,
} from '../../services/contracts'

export interface CloudResponse<T> {
  ok: boolean
  data?: T
  error?: ServiceError
}

export type CloudCaller = <T>(name: string, data?: Record<string, unknown>) => Promise<CloudResponse<T>>

function unknownError(error: unknown): ServiceError {
  const message = error instanceof Error ? error.message : '网络连接失败，请稍后重试。'
  return { code: 'NETWORK_ERROR', message }
}

async function invoke<T>(caller: CloudCaller, name: string, data?: Record<string, unknown>): Promise<ServiceResult<T>> {
  try {
    const response = await caller<T>(name, data)
    if (response.ok && response.data !== undefined) return { ok: true, data: response.data }
    return {
      ok: false,
      error: response.error ?? { code: 'UNKNOWN_ERROR', message: '云服务返回了未知错误。' },
    }
  } catch (error) {
    return { ok: false, error: unknownError(error) }
  }
}

export function createWechatServices(caller: CloudCaller): {
  identity: IdentityService
  bookkeeping: BookkeepingService
  insights: InsightsService
} {
  return {
    identity: {
      getSession: () => invoke(caller, 'get-session'),
    },
    bookkeeping: {
      create: (input: TransactionInput) => invoke(caller, 'transactions', { action: 'create', input }),
      list: (monthKey: string, cursor?: string) => invoke(caller, 'transactions', { action: 'list', monthKey, cursor }),
      update: (id: string, input: TransactionInput) => invoke(caller, 'transactions', { action: 'update', id, input }),
      remove: (id: string) => invoke(caller, 'transactions', { action: 'delete', id }),
    },
    insights: {
      getMonthly: (monthKey: string) => invoke(caller, 'monthly-insights', { monthKey }),
    },
  }
}
