import type { Docent } from './types'

/** 캡션 카드 (D2): 제목 / 작가 / 표(재료·크기·연도). 나누지 못하면 원문 그대로 보여 준다 */
export type CaptionCard = { title?: string; artist?: string; rows: [string, string][] }

const MATERIAL = /(유채|캔버스|아크릴|수채|수묵|채색|먹|혼합|매체|종이|한지|비단|화선지|프린트|피그먼트|비디오|사진|조각|브론즈|설치|on canvas|on paper|media|print|oil|acrylic|ink|bronze|video|installation)/i
const SIZE = /\d+(?:\.\d+)?\s*[x×X*]\s*\d+(?:\.\d+)?(?:\s*[x×X*]\s*\d+(?:\.\d+)?)?\s*(?:cm|mm|in(?:ch)?)?|가변\s*크기|dimensions variable/i
const YEAR = /^(?:c\.\s*)?(1[5-9]\d\d|20\d\d)(?:\s*[-–—]\s*\d{2,4})?$/
const TITLE = /[〈《「『](.+?)[〉》」』]/
/** 한글 이름 + 로마자 이름, 또는 한글 2~4자 이름 */
const ARTIST = /^[가-힣]{2,4}(?:\s+[A-Z][A-Za-z.'-]*(?:[\s-][A-Z][A-Za-z.'-]*)*)?$/

export function parseCaption(docent: Pick<Docent, 'heading' | 'text'>): CaptionCard | undefined {
  const lines = [docent.heading, ...docent.text.split('\n')].map((l) => l?.trim() ?? '').filter(Boolean)
  if (lines.length < 2) return undefined
  const card: CaptionCard = { rows: [] }
  const rest: string[] = []
  for (const raw of lines) {
    // 한 줄에 "2020 | 24 X 54 | 아크릴에 유화"처럼 묶여 있으면 나눈다
    for (const line of raw.split(/\s+[|ㅣI]\s+/)) {
      const t = line.trim()
      if (!t) continue
      const title = t.match(TITLE)
      if (title && !card.title) card.title = title[1].trim()
      else if (YEAR.test(t) && !card.rows.some(([k]) => k === '연도')) card.rows.push(['연도', t])
      else if (SIZE.test(t) && t.length < 40 && !card.rows.some(([k]) => k === '크기')) card.rows.push(['크기', t.replace(/\s*([x×X*])\s*/g, ' × ')])
      else if (MATERIAL.test(t) && t.length < 40 && !card.rows.some(([k]) => k === '재료')) card.rows.push(['재료', t])
      else if (!card.artist && ARTIST.test(t)) card.artist = t
      else rest.push(t)
    }
  }
  // 꺾쇠 제목이 없으면 남은 첫 줄을 제목으로
  if (!card.title && rest.length) card.title = rest.shift()
  // 긴 설명문이 남으면 표로 나누지 않는다
  if (rest.some((l) => l.length > 40) || rest.length > 2) return undefined
  return card.rows.length || card.artist ? card : undefined
}
