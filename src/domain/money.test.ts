import { describe, expect, it } from 'vitest'
import { formatFenAsCny, yuanTextToFen } from './money'

describe('yuanTextToFen', () => {
  it.each([
    ['', null],
    ['0', null],
    ['0.00', null],
    ['-1', null],
    ['1.001', null],
    ['abc', null],
    ['0.01', 1],
    ['8', 800],
    ['32.5', 3250],
    ['32.50', 3250],
  ])('converts %s to %s', (value, expected) => {
    expect(yuanTextToFen(value)).toBe(expected)
  })
})

describe('formatFenAsCny', () => {
  it('formats integer fen without floating-point arithmetic', () => {
    expect(formatFenAsCny(1)).toBe('¥0.01')
    expect(formatFenAsCny(4050)).toBe('¥40.50')
    expect(formatFenAsCny(850000)).toBe('¥8,500.00')
  })
})
