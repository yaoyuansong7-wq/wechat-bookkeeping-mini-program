import type { BookkeepingService, ServiceResult } from '@/services/contracts'

export async function deleteTransaction(
  service: BookkeepingService,
  id: string,
  confirmed: boolean,
): Promise<ServiceResult<{ id: string }> | null> {
  if (!confirmed) return null
  return service.remove(id)
}
