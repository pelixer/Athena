import { describe, expect, it } from 'vitest'
import { foldKo, foldLatin, levenshtein, nameSimilarity } from './fuzzyName'
import { queryShardKeys } from './archive'

describe('fuzzyName · 틀리게 써도 연결', () => {
  it('한글 접기: 된소리·거센소리, 헷갈리는 모음, 받침 대표음', () => {
    expect(foldKo('뒤샹')).toBe(foldKo('뒤상'))
    expect(foldKo('뒤쌍')).toBe(foldKo('뒤샹'))
    expect(foldKo('마르셸')).toBe(foldKo('마르셀'))
    expect(foldKo('피까소')).toBe(foldKo('피카소'))
    expect(foldKo('모내')).toBe(foldKo('모네'))
  })
  it('라틴 접기: 악센트·겹글자', () => {
    expect(foldLatin('Dalí')).toBe('dali')
    expect(foldLatin('Pissarro')).toBe(foldLatin('Pisaro'))
  })
  it('편집 거리', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3)
    expect(levenshtein('abc', 'abcdefgh', 2)).toBe(3)
  })
  it('마르셀 뒤샹: 틀린 표기 셋이 모두 이어진다', () => {
    for (const q of ['마르셀 뒤상', '마르셸 뒤샹', '마르세 뒤쌍', '뒤쌍']) expect(nameSimilarity(q, '마르셀 뒤샹')).toBeGreaterThanOrEqual(0.6)
    expect(nameSimilarity('마르셀 뒤샹', '마르셀 뒤샹')).toBe(1)
  })
  it('영어 오타도', () => {
    expect(nameSimilarity('Marcel Duchamps', 'Marcel Duchamp')).toBeGreaterThan(0.8)
    expect(nameSimilarity('Pikasso', 'Pablo Picasso')).toBeGreaterThanOrEqual(0.6)
  })
  it('다른 이름은 이어지지 않는다', () => {
    expect(nameSimilarity('모네', '마네')).toBeLessThan(0.6)
    expect(nameSimilarity('피카소', '모네')).toBe(0)
    expect(nameSimilarity('Monet', '마네')).toBe(0)
  })
  it('받을 조각: 가장 긴 낱말 하나, 한글은 헷갈리는 초성 갈래까지', () => {
    expect(queryShardKeys('Marcel Duchamps')).toEqual(['d'])
    expect(queryShardKeys('고흐')).toEqual(['h0', 'h15'])
    expect(queryShardKeys('마르셀 뒤샹')).toEqual(['h6'])
  })
})
