const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000

export interface MonthRange {
  monthKey: string
  startInclusive: string
  endExclusive: string
}

export function isValidIsoDate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
}

export function toMonthKey(date: string): string {
  if (!isValidIsoDate(date)) {
    throw new TypeError(`无效日期：${date}`)
  }

  return date.slice(0, 7)
}

export function normalizeDateInShanghai(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

export function getShanghaiMonthRange(monthKey: string): MonthRange {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey)
  if (!match) {
    throw new TypeError(`无效月份：${monthKey}`)
  }

  const year = Number(match[1])
  const month = Number(match[2])
  if (month < 1 || month > 12) {
    throw new TypeError(`无效月份：${monthKey}`)
  }

  const startUtc = Date.UTC(year, month - 1, 1) - SHANGHAI_OFFSET_MS
  const endUtc = Date.UTC(year, month, 1) - SHANGHAI_OFFSET_MS

  return {
    monthKey,
    startInclusive: new Date(startUtc).toISOString(),
    endExclusive: new Date(endUtc).toISOString(),
  }
}
