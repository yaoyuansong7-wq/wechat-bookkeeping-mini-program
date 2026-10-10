import { CATEGORIES, type TransactionInput } from './models'
import { isValidIsoDate } from './date'

export type TransactionField = 'type' | 'amountFen' | 'categoryId' | 'occurredAt' | 'note'

export interface ValidationIssue {
  field: TransactionField
  message: string
}

export function validateTransactionInput(input: Partial<TransactionInput>): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (input.type !== 'income' && input.type !== 'expense') {
    issues.push({ field: 'type', message: '请选择收入或支出。' })
  }

  if (!Number.isSafeInteger(input.amountFen) || (input.amountFen ?? 0) <= 0) {
    issues.push({ field: 'amountFen', message: '请输入大于零且最多两位小数的金额。' })
  }

  const category = CATEGORIES.find((item) => item.id === input.categoryId)
  if (!category) {
    issues.push({ field: 'categoryId', message: '请选择有效分类。' })
  } else if (input.type && category.type !== input.type) {
    issues.push({ field: 'categoryId', message: '分类与收支类型不匹配。' })
  }

  if (!input.occurredAt || !isValidIsoDate(input.occurredAt)) {
    issues.push({ field: 'occurredAt', message: '请选择有效日期。' })
  }

  if ((input.note?.length ?? 0) > 100) {
    issues.push({ field: 'note', message: '备注不能超过 100 个字符。' })
  }

  return issues
}
