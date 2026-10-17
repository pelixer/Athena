import type { Docent } from './types'

/**
 * OCR 원문 → 도슨트. 첫 줄이 "작가, 〈작품명〉, 연도" 형태면 heading으로 분리한다.
 */
export function toDocent(raw: string, photoId?: string): Docent {
  const lines = raw.trim().split(/\n+/)
  const first = lines[0]?.trim() ?? ''
  if (lines.length > 1 && /[〈<「『].+[〉>」』]/.test(first)) {
    return { photoId, heading: first, text: lines.slice(1).join('\n').trim() }
  }
  return { photoId, text: raw.trim() }
}

/** heading의 〈작품명〉 부분. 오브제 제목이 비어 있을 때 쓴다. */
export function workTitle(docent: Docent | undefined): string | undefined {
  return docent?.heading?.match(/[〈<「『](.+?)[〉>」』]/)?.[1]
}
