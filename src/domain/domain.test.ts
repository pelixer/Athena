import { describe, expect, it } from 'vitest'
import { parseTags } from './tags'
import { sequenceOf } from './sequence'
import type { Obje } from './types'

describe('parseTags', () => {
  it('extracts hashtags without the #, deduplicated in order', () => {
    expect(parseTags('#데이비드호크니 다이빙 #수영장#다이빙 #데이비드호크니')).toEqual([
      '데이비드호크니',
      '수영장',
      '다이빙',
    ])
  })

  it('returns an empty list when there are no tags', () => {
    expect(parseTags('그냥 메모')).toEqual([])
  })
})

describe('sequenceOf', () => {
  const obje = (id: string, takenAt: number, createdAt = 0): Obje => ({
    id, takenAt, createdAt, visitId: 'v', photoId: id, tags: [],
  })

  it('numbers objes by capture time, not by upload order', () => {
    const seq = sequenceOf([obje('c', 300), obje('a', 100), obje('b', 200)])
    expect([seq.get('a'), seq.get('b'), seq.get('c')]).toEqual([1, 2, 3])
  })

  it('breaks capture-time ties by creation order', () => {
    const seq = sequenceOf([obje('late', 100, 2), obje('early', 100, 1)])
    expect(seq.get('early')).toBe(1)
  })
})
