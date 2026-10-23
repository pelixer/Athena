// 아카이브 묶기의 순수한 부분 (테스트: compile.test.ts). 파일 읽기·쓰기는 compile.ts.
import type { ArchiveArtist, ArchiveWork, Names, Period, Qid } from '../../src/domain/archive'
import { normalize } from '../../src/domain/archive'

/** "1889-06-01T00:00:00Z" → 1889, "-0480-01-01T00:00:00Z" → -480 */
export function yearOf(t: string): number | undefined {
  const m = t.match(/^([+-]?)(\d{1,})-/)
  if (!m) return undefined
  const y = Number(m[2]) * (m[1] === '-' ? -1 : 1)
  return Number.isFinite(y) ? y : undefined
}

/**
 * 날짜 하나 + 정밀도 → 기간. 9(해) 이상은 그 해, 8(10년)은 그 10년, 7(100년)은 그 세기(대략).
 * 6 이하(천 년 등)는 너무 넓어 버린다.
 */
export function spanOf(t: string, precision: number): Period | undefined {
  const y = yearOf(t)
  if (y === undefined) return undefined
  if (precision >= 9) return { from: y, to: y }
  if (precision === 8) {
    const d = Math.floor(y / 10) * 10
    return { from: d, to: d + 9, c: 1 }
  }
  if (precision === 7) {
    // Wikidata는 세기를 그 세기 안의 해로 적는다 (17세기 = 1601–1700 사이의 어느 해)
    const c = Math.floor((y - 1) / 100)
    return { from: c * 100 + 1, to: c * 100 + 100, c: 1 }
  }
  return undefined
}

export type DateClaim = { prop: string; t: string; p: number }

/** 작품의 날짜 주장들 → 작업 기간. 시작 쪽(제작·시작·가장 이른)의 가장 이른 해 ~ 끝 쪽(제작·끝·가장 늦은)의 가장 늦은 해 */
export function periodOf(claims: DateClaim[]): Period | undefined {
  let from: number | undefined
  let to: number | undefined
  let approx = false
  for (const { prop, t, p } of claims) {
    const s = spanOf(t, p)
    if (!s) continue
    if (s.c) approx = true
    if (prop !== 'P582' && prop !== 'P1326') from = from === undefined ? s.from : Math.min(from, s.from!)
    if (prop !== 'P580' && prop !== 'P1319') to = to === undefined ? s.to : Math.max(to, s.to!)
  }
  if (from === undefined && to === undefined) return undefined
  if (from !== undefined && to !== undefined && to < from) to = from
  return approx ? { from, to, c: 1 } : { from, to }
}

/** 이름 넣기: 같은 언어 이름이 이미 있으면 다른 이름으로, 같은 글자(정규화 기준)는 한 번만, 다른 이름은 최대 4개 */
export function addName(n: Names, text: string, lang: string, alt = false) {
  if (!text) return
  const seen = new Set([n.ko, n.en, ...(n.alt ?? [])].filter(Boolean).map((x) => normalize(x!)))
  if (seen.has(normalize(text))) return
  if (!alt && lang === 'ko' && !n.ko) n.ko = text
  else if (!alt && lang === 'en' && !n.en) n.en = text
  else if ((n.alt ??= []).length < 4) n.alt.push(text)
}

/** 배열 필드에 값 더하기 (중복 없이) */
export function push<T extends object>(o: T, key: keyof T, v: Qid) {
  const arr = ((o[key] as unknown as Qid[] | undefined) ??= [] as Qid[]) as Qid[]
  if (!arr.includes(v)) arr.push(v)
  ;(o as Record<string, unknown>)[key as string] = arr
}

/** 빈 필드를 지워 파일을 줄인다 */
export function compact<T extends ArchiveWork | ArchiveArtist>(o: T): T {
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || (Array.isArray(v) && v.length === 0 && k !== 'w')) delete (o as Record<string, unknown>)[k]
    if (k === 'n' && v && typeof v === 'object' && Array.isArray((v as Names).alt) && !(v as Names).alt!.length) delete (v as Names).alt
  }
  return o
}
