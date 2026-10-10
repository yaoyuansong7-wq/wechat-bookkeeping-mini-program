import { describe, expect, it } from 'vitest'
import {
  getShanghaiMonthRange,
  isValidIsoDate,
  normalizeDateInShanghai,
  toMonthKey,
} from './date'

describe('date rules', () => {
  it.each([
    ['2026-10-01', true],
    ['2026-10-31', true],
    ['2026-02-29', false],
    ['2024-02-29', true],
    ['2026-13-01', false],
  ])('validates %s', (date, expected) => {
    expect(isValidIsoDate(date)).toBe(expected)
  })

  it('creates the month key from a valid date', () => {
    expect(toMonthKey('2026-10-31')).toBe('2026-10')
  })

  it('normalizes instants in Asia/Shanghai', () => {
    expect(normalizeDateInShanghai(new Date('2026-10-08T16:30:00.000Z'))).toBe('2026-10-09')
  })

  it('creates Shanghai month boundaries', () => {
    expect(getShanghaiMonthRange('2026-10')).toEqual({
      monthKey: '2026-10',
      startInclusive: '2026-09-30T16:00:00.000Z',
      endExclusive: '2026-10-31T16:00:00.000Z',
    })
  })

  it('handles the year boundary', () => {
    expect(getShanghaiMonthRange('2026-12').endExclusive).toBe('2026-12-31T16:00:00.000Z')
  })
})
