import { describe, expect, it } from 'vitest'
import type { Names } from '../../src/domain/archive'
import { addName, periodOf, spanOf, yearOf } from './compileLib'

describe('archive compile', () => {
  it('해 읽기 (기원전 포함)', () => {
    expect(yearOf('1889-06-01T00:00:00Z')).toBe(1889)
    expect(yearOf('-0480-01-01T00:00:00Z')).toBe(-480)
    expect(yearOf('t1234')).toBeUndefined()
  })
  it('정밀도: 해 · 10년 · 세기 · 그보다 넓으면 버림', () => {
    expect(spanOf('1889-01-01T00:00:00Z', 11)).toEqual({ from: 1889, to: 1889 })
    expect(spanOf('1650-01-01T00:00:00Z', 8)).toEqual({ from: 1650, to: 1659, c: 1 })
    expect(spanOf('1650-01-01T00:00:00Z', 7)).toEqual({ from: 1601, to: 1700, c: 1 })
    expect(spanOf('1000-01-01T00:00:00Z', 6)).toBeUndefined()
  })
  it('작업 기간: 시작·끝·가장 이른·가장 늦은 때를 합친다', () => {
    expect(periodOf([{ prop: 'P571', t: '1889-06-01T00:00:00Z', p: 11 }])).toEqual({ from: 1889, to: 1889 })
    expect(
      periodOf([
        { prop: 'P580', t: '1914-01-01T00:00:00Z', p: 9 },
        { prop: 'P582', t: '1926-01-01T00:00:00Z', p: 9 },
      ]),
    ).toEqual({ from: 1914, to: 1926 })
    expect(
      periodOf([
        { prop: 'P1319', t: '1640-01-01T00:00:00Z', p: 9 },
        { prop: 'P1326', t: '1650-01-01T00:00:00Z', p: 8 },
      ]),
    ).toEqual({ from: 1640, to: 1659, c: 1 })
    expect(periodOf([])).toBeUndefined()
  })
  it('이름: 언어 자리 → 다른 이름, 같은 글자는 한 번', () => {
    const n: Names = {}
    addName(n, 'The Starry Night', 'en')
    addName(n, '별이 빛나는 밤', 'ko')
    addName(n, 'the starry night', 'en')
    addName(n, 'De sterrennacht', 'en')
    addName(n, 'Starry Night', 'en', true)
    expect(n).toEqual({ en: 'The Starry Night', ko: '별이 빛나는 밤', alt: ['De sterrennacht', 'Starry Night'] })
  })
})
