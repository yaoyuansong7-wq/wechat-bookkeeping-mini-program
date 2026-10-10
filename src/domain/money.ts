const YUAN_PATTERN = /^\d+(?:\.\d{1,2})?$/

export function yuanTextToFen(value: string): number | null {
  const normalized = value.trim()

  if (!YUAN_PATTERN.test(normalized)) {
    return null
  }

  const [yuanPart, decimalPart = ''] = normalized.split('.')
  const fen = Number(yuanPart) * 100 + Number(decimalPart.padEnd(2, '0'))

  if (!Number.isSafeInteger(fen) || fen <= 0) {
    return null
  }

  return fen
}

export function formatFenAsCny(amountFen: number): string {
  if (!Number.isSafeInteger(amountFen)) {
    throw new TypeError('金额必须是安全整数分。')
  }

  const sign = amountFen < 0 ? '-' : ''
  const absoluteFen = Math.abs(amountFen)
  const yuan = Math.floor(absoluteFen / 100)
  const fen = String(absoluteFen % 100).padStart(2, '0')

  return `${sign}¥${yuan.toLocaleString('zh-CN')}.${fen}`
}
