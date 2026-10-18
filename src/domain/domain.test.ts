import { describe, expect, it } from 'vitest'
import { parseTagInput, parseTags } from './tags'
import { sequenceOf } from './sequence'
import { attachmentLabel, visitSpan, visitStats } from './visitStats'
import { bodyToText, docentToText, textToBody, toDocent, workTitle } from './docent'
import type { Obje } from './types'

const obje = (id: string, takenAt: number, extra: Partial<Obje> = {}): Obje => ({
  id, takenAt, createdAt: 0, visitId: 'v', photoId: id, tags: [], ...extra,
})

describe('parseTags', () => {
  it('extracts hashtags without the #, deduplicated in order', () => {
    expect(parseTags('#흰절벽 바다 #하늘#흰절벽 #한서윤')).toEqual(['흰절벽', '하늘', '한서윤'])
  })

  it('returns an empty list when there are no tags', () => {
    expect(parseTags('그냥 메모')).toEqual([])
  })

  it('accepts words without # in the tag input', () => {
    expect(parseTagInput(' 흰절벽  #바다 하늘 ')).toEqual(['흰절벽', '바다', '하늘'])
  })
})

describe('sequenceOf', () => {
  it('numbers objes by capture time, not by upload order', () => {
    const seq = sequenceOf([obje('c', 300), obje('a', 100), obje('b', 200)])
    expect([seq.get('a'), seq.get('b'), seq.get('c')]).toEqual([1, 2, 3])
  })

  it('breaks capture-time ties by creation order', () => {
    const seq = sequenceOf([obje('late', 100, { createdAt: 2 }), obje('early', 100, { createdAt: 1 })])
    expect(seq.get('early')).toBe(1)
  })
})

describe('visit stats', () => {
  const objes = [
    obje('a', 100, { docent: { text: 'x' }, note: '좋았다' }),
    obje('b', 300, { docent: { text: 'y' } }),
    obje('c', 200, { note: '  ' }),
  ]

  it('counts objes, docents and non-empty notes', () => {
    expect(visitStats(objes)).toEqual({ objes: 3, docents: 2, notes: 1 })
  })

  it('spans first to last capture, extended by the end of the visit', () => {
    expect(visitSpan(objes)).toEqual({ start: 100, end: 300 })
    expect(visitSpan(objes, 500)).toEqual({ start: 100, end: 500 })
    expect(visitSpan([])).toBeUndefined()
  })

  it('labels what is attached to an obje', () => {
    expect(objes.map(attachmentLabel)).toEqual(['도슨트 · 노트', '도슨트', '—'])
  })
})

describe('toDocent', () => {
  it('splits an artwork caption heading from the body', () => {
    const d = toDocent('한서윤, 〈남쪽 해안, 오후 3시〉, 2019\n피그먼트 프린트. 작가는…')
    expect(d.heading).toBe('한서윤, 〈남쪽 해안, 오후 3시〉, 2019')
    expect(d.text).toBe('피그먼트 프린트. 작가는…')
    expect(workTitle(d)).toBe('남쪽 해안, 오후 3시')
  })

  it('keeps plain text whole', () => {
    expect(toDocent('그냥 설명문')).toEqual({ photoId: undefined, text: '그냥 설명문' })
  })

  it('cleans Tesseract output: <> titles, wrapped lines, blank-line paragraphs', () => {
    const ocr = '한서윤, <남쪽 해안, 오후 3시>, 2019\n피그먼트 프린트, 120 × 180 cm\n\n작가는 같은 절벽을 일 년 동안   같은 시각에 촬영했다.\n백악질 절벽은 계절과 빛에 따라 회색에서\n푸른빛까지 색을 바꾼다.\n'
    const d = toDocent(ocr, 'p1')
    expect(d.heading).toBe('한서윤, 〈남쪽 해안, 오후 3시〉, 2019')
    expect(d.text).toBe('피그먼트 프린트, 120 × 180 cm\n작가는 같은 절벽을 일 년 동안 같은 시각에 촬영했다. 백악질 절벽은 계절과 빛에 따라 회색에서 푸른빛까지 색을 바꾼다.')
    expect(workTitle(d)).toBe('남쪽 해안, 오후 3시')
    expect(toDocent(docentToText(d), 'p1')).toEqual(d)
  })

  it('round-trips the body field of the edit sheet', () => {
    const text = '피그먼트 프린트, 120 × 180 cm\n작가는 같은 절벽을 촬영했다.'
    expect(bodyToText(textToBody(text))).toBe(text)
    expect(bodyToText('첫 줄이\n이어진다.\n\n  다음 문단  ')).toBe('첫 줄이 이어진다.\n다음 문단')
  })

  it('returns empty text for empty OCR output', () => {
    expect(toDocent('  \n\n ')).toEqual({ photoId: undefined, text: '' })
  })
})
