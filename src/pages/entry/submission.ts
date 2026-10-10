import type { TransactionInput, TransactionRecord } from '@/domain/models'
import type { BookkeepingService, ServiceResult } from '@/services/contracts'

export interface SaveTransactionOptions {
  transactionId?: string
}

export function saveTransaction(
  service: BookkeepingService,
  input: TransactionInput,
  options: SaveTransactionOptions = {},
): Promise<ServiceResult<TransactionRecord>> {
  if (options.transactionId) {
    return service.update(options.transactionId, input)
  }
  return service.create(input)
}
