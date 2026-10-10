'use strict'

const TYPES = new Set(['income', 'expense'])
const CATEGORIES = new Map([
  ['food', 'expense'], ['transport', 'expense'], ['shopping', 'expense'],
  ['housing', 'expense'], ['entertainment', 'expense'], ['healthcare', 'expense'],
  ['education', 'expense'], ['other-expense', 'expense'], ['salary', 'income'],
  ['bonus', 'income'], ['investment', 'income'], ['gift', 'income'],
  ['other-income', 'income'],
])

function monthKeyOf(date) {
  return date.slice(0, 7)
}

function validate(input) {
  const issues = []
  if (!TYPES.has(input?.type)) issues.push({ field: 'type', message: '请选择收入或支出。' })
  if (!Number.isSafeInteger(input?.amountFen) || input.amountFen <= 0) {
    issues.push({ field: 'amountFen', message: '金额必须是大于零的整数分。' })
  }
  const categoryType = CATEGORIES.get(input?.categoryId)
  if (!categoryType) issues.push({ field: 'categoryId', message: '请选择有效分类。' })
  else if (categoryType !== input.type) issues.push({ field: 'categoryId', message: '分类与收支类型不匹配。' })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input?.occurredAt ?? '')) {
    issues.push({ field: 'occurredAt', message: '请选择有效日期。' })
  }
  if ((input?.note?.length ?? 0) > 100) issues.push({ field: 'note', message: '备注不能超过 100 个字符。' })
  return issues
}

function failure(code, message, details) {
  return { ok: false, error: { code, message, ...(details ? { details } : {}) } }
}

function createTransactionsHandler({ getOpenId, repository, now = () => new Date().toISOString() }) {
  return async function handle(event = {}) {
    const ownerOpenId = getOpenId()
    if (!ownerOpenId) return failure('AUTH_REQUIRED', '无法识别微信用户身份，请重试。')

    if (event.action === 'create') {
      const issues = validate(event.input)
      if (issues.length) return failure('VALIDATION_FAILED', '账目信息不完整或无效。', issues)
      const timestamp = now()
      const created = await repository.create({
        ...event.input,
        note: event.input.note?.trim() || '',
        ownerOpenId,
        monthKey: monthKeyOf(event.input.occurredAt),
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      return { ok: true, data: created }
    }

    if (event.action === 'list') {
      if (!/^\d{4}-\d{2}$/.test(event.monthKey ?? '')) return failure('VALIDATION_FAILED', '月份格式无效。')
      const pageSize = Math.min(Math.max(Number(event.pageSize) || 20, 1), 50)
      const offset = Math.max(Number(event.cursor) || 0, 0)
      const result = await repository.listByMonth(ownerOpenId, event.monthKey, offset, pageSize)
      return { ok: true, data: { items: result.items, nextCursor: result.hasMore ? String(offset + pageSize) : null } }
    }

    if (event.action === 'update') {
      if (!event.id) return failure('VALIDATION_FAILED', '缺少账目 ID。')
      const issues = validate(event.input)
      if (issues.length) return failure('VALIDATION_FAILED', '账目信息不完整或无效。', issues)
      const updated = await repository.updateOwned(event.id, ownerOpenId, {
        ...event.input,
        note: event.input.note?.trim() || '',
        monthKey: monthKeyOf(event.input.occurredAt),
        updatedAt: now(),
      })
      return updated ? { ok: true, data: updated } : failure('NOT_FOUND', '账目不存在或无权操作。')
    }

    if (event.action === 'delete') {
      if (!event.id) return failure('VALIDATION_FAILED', '缺少账目 ID。')
      const deleted = await repository.deleteOwned(event.id, ownerOpenId)
      return deleted ? { ok: true, data: { id: event.id } } : failure('NOT_FOUND', '账目不存在或无权操作。')
    }

    return failure('UNKNOWN_ACTION', '不支持的账目操作。')
  }
}

module.exports = { createTransactionsHandler, validate }
