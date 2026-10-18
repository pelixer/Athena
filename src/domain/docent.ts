import type { Docent } from './types'

const WORK_TITLE = /[〈<「『](.+?)[〉>」』]/

/**
 * OCR 원문 → 도슨트.
 * - 첫 줄이 "작가, 〈작품명〉, 연도" 형태면 heading으로 분리한다 (OCR이 읽은 <> 는 〈〉 로 바꾼다).
 * - 설명문은 사진 속 줄바꿈대로 읽히므로, 빈 줄로 나뉜 문단 안의 줄은 한 줄로 잇는다.
 */
export function toDocent(raw: string, photoId?: string): Docent {
  const paragraphs = paragraphsOf(raw)

  let heading: string | undefined
  const first = paragraphs[0]?.[0]
  const hasBody = paragraphs.length > 1 || (paragraphs[0]?.length ?? 0) > 1
  if (first && hasBody && WORK_TITLE.test(first)) {
    heading = first.replace(/<(.+?)>/, '〈$1〉')
    paragraphs[0] = paragraphs[0].slice(1)
  }
  const text = joinParagraphs(paragraphs)
  return heading ? { photoId, heading, text } : { photoId, text }
}

/** 고치기 시트의 본문 칸 → 저장할 글. 빈 줄로 문단을 나누고, 문단 안의 줄은 잇는다. */
export function bodyToText(body: string): string {
  return joinParagraphs(paragraphsOf(body))
}

/** 저장된 글 → 고치기 시트의 본문 칸 (문단 사이 빈 줄) */
export function textToBody(text: string): string {
  return text.split('\n').join('\n\n')
}

function paragraphsOf(raw: string): string[][] {
  return raw
    .replace(/\r/g, '')
    .split(/\n\s*\n/)
    .map((p) =>
      p
        .split('\n')
        .map((line) => line.trim().replace(/\s+/g, ' '))
        .filter(Boolean),
    )
    .filter((p) => p.length > 0)
}

function joinParagraphs(paragraphs: string[][]): string {
  return paragraphs
    .filter((p) => p.length > 0)
    .map((p) => p.join(' '))
    .join('\n')
}

/** 도슨트를 한 덩어리 글로 펼친다: heading과 문단을 빈 줄로 나눈다 (toDocent로 다시 읽으면 같은 도슨트). */
export function docentToText(docent: Docent): string {
  return [docent.heading, ...docent.text.split('\n')].filter(Boolean).join('\n\n')
}

/** heading의 〈작품명〉 부분. 오브제 제목이 비어 있을 때 쓴다. */
export function workTitle(docent: Docent | undefined): string | undefined {
  return docent?.heading?.match(WORK_TITLE)?.[1]
}
