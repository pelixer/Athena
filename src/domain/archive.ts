/**
 * 아트 아카이브 — 서버 없이 정적 파일로 담는 작품 정보 (출처: Wikidata, CC0).
 * 사용자가 작품 이름과 작가를 직접 쓰면, 작가 이름 색인 → 작가 묶음 → 작품 순으로 찾는다.
 * 보여 주는 것: 작가 · 작업 기간 · 화법(재료·기법) 및 화풍(사조·장르) · 근원지(지역).
 * 이 파일은 수집 스크립트(scripts/archive/compile.ts)와 앱이 함께 쓴다.
 */

/** Wikidata 항목 번호 (예: "Q45585") */
export type Qid = string

/** 이름: 한국어 · 영어(또는 원어) · 다른 이름들 */
export interface Names {
  ko?: string
  en?: string
  alt?: string[]
}

/** 작업 기간. 연도만 (음수 = 기원전). c = 대략(정밀도가 10년·100년 단위이거나 "무렵") */
export interface Period {
  from?: number
  to?: number
  c?: 1
}

export interface ArchiveWork {
  id: Qid
  n: Names
  y?: Period
  /** 사조 (화풍) */
  m?: Qid[]
  /** 장르 (화풍) */
  g?: Qid[]
  /** 재료 (화법) */
  mt?: Qid[]
  /** 제작 기법 (화법) */
  me?: Qid[]
  /** 근원지: 나라 */
  o?: Qid[]
  /** 근원지: 만든 곳 */
  l?: Qid[]
  /** 분류 (회화, 조각…) */
  k?: Qid[]
}

export interface ArchiveArtist {
  id: Qid
  n: Names
  /** 태어난 해 · 죽은 해 */
  b?: number
  d?: number
  /** 국적 */
  c?: Qid[]
  /** 작가의 사조 (작품에 사조가 없을 때 보탬) */
  m?: Qid[]
  /** 활동한 곳 (작품에 근원지가 없을 때 보탬) */
  wl?: Qid[]
  /** 활동 기간 (작품에 날짜가 없을 때 보탬) */
  a?: Period
  w: ArchiveWork[]
  /** 작품이 많아 따로 둔 작가: 작품은 archive/works/{id}.json (ArchiveWork[]) */
  x?: 1
}

/** 작가 묶음 파일: archive/artists/{bucket}.json */
export type ArtistBucket = Record<Qid, ArchiveArtist>
/** 이름 색인 파일 archive/names/{key}.json 의 한 줄: [정규화한 이름, 작가 Qid, 작품 수] */
export type NameEntry = [name: string, artist: Qid, works: number]
/** 용어 파일 archive/vocab.json: Qid → [한국어, 영어] */
export type Vocab = Record<Qid, [ko: string, en: string]>

export interface ArchiveManifest {
  version: string
  builtAt: string
  buckets: number
  counts: { works: number; artists: number; vocab: number }
  source: string
}

/** 작가 Qid → 묶음 번호 */
export const bucketOf = (id: Qid, buckets: number) => Number(id.slice(1)) % buckets

/**
 * 비교용 정규화: 유니코드 NFKC, 라틴 악센트 제거, 소문자, 공백·문장부호·괄호 표시 제거.
 * "Vincent van Gogh" → "vincentvangogh", "〈별이 빛나는 밤〉" → "별이빛나는밤"
 */
export function normalize(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]/gu, '')
}

/** 낱말로 나누기 (이름 색인을 낱말 첫 글자마다 넣기 위해) */
export const words = (s: string) => s.split(/[\s\p{P}]+/u).map(normalize).filter(Boolean)

/** 초성 19개 → 된소리는 예사소리 자리로 (ㄲ→ㄱ, ㄸ→ㄷ, ㅃ→ㅂ, ㅆ→ㅅ, ㅉ→ㅈ) */
const CHOSEONG_FOLD = [0, 0, 2, 3, 3, 5, 6, 7, 7, 9, 9, 11, 12, 12, 14, 15, 16, 17, 18]
/**
 * 색인 조각(파일) 이름 — 주소에 안전한 ASCII: 한글은 초성 번호 "h0"(ㄱ)…"h18"(ㅎ), 라틴은 글자, 그 밖은 "_".
 */
export function shardKey(normalized: string): string {
  const ch = normalized[0] ?? ''
  const code = ch.charCodeAt(0)
  if (code >= 0xac00 && code <= 0xd7a3) return `h${CHOSEONG_FOLD[Math.floor((code - 0xac00) / 588)]}`
  if (/[a-z]/.test(ch)) return ch
  return '_'
}

/** 이름이 들어갈 색인 조각들 (전체 이름의 첫 글자 + 낱말마다 첫 글자) */
export function shardKeysOf(name: string): string[] {
  return [...new Set([normalize(name), ...words(name)].filter(Boolean).map(shardKey))]
}

/** 이름 유사도 0–1: 같음 1, 한쪽이 다른 쪽을 품으면 길이 비율로 (짧은 쪽이 2글자 미만이면 0) */
export function similarity(query: string, candidate: string): number {
  const q = normalize(query)
  const c = normalize(candidate)
  if (!q || !c) return 0
  if (q === c) return 1
  const [short, long] = q.length <= c.length ? [q, c] : [c, q]
  if (short.length < 2 || !long.includes(short)) return 0
  return 0.5 + (0.45 * short.length) / long.length
}

const namesOf = (n: Names) => [n.ko, n.en, ...(n.alt ?? [])].filter((x): x is string => !!x)

export interface ArtistHit {
  id: Qid
  score: number
  works: number
}

/**
 * 이름 색인 줄들에서 작가 후보 고르기. 이름 유사도에 작품 수(알려진 정도)를 조금 더한다 —
 * "반 고흐"는 "테오 반 고흐"보다 짧게 겹쳐도 작품이 많은 빈센트 반 고흐가 먼저.
 */
export function rankArtists(query: string, entries: NameEntry[], limit = 5): ArtistHit[] {
  const best = new Map<Qid, ArtistHit>()
  for (const [name, id, works] of entries) {
    const match = similarity(query, name)
    if (match < 0.6) continue
    const score = match + 0.05 * Math.log10(1 + works)
    const prev = best.get(id)
    if (!prev || score > prev.score) best.set(id, { id, score, works })
  }
  return [...best.values()].sort((a, b) => b.score - a.score || b.works - a.works).slice(0, limit)
}

export interface WorkHit {
  artist: ArchiveArtist
  work: ArchiveWork
  score: number
}

/** 작가의 작품 가운데 제목이 맞는 것 (제목을 비우면 빈 배열) */
export function rankWorks(title: string, artist: ArchiveArtist, limit = 5): WorkHit[] {
  if (!normalize(title)) return []
  return artist.w
    .map((work) => ({ artist, work, score: Math.max(0, ...namesOf(work.n).map((n) => similarity(title, n))) }))
    .filter((h) => h.score >= 0.6)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/** 보여 줄 이름: 한국어가 있으면 한국어, 없으면 영어(원어) */
export const displayName = (n: Names) => n.ko ?? n.en ?? n.alt?.[0] ?? ''
/** 원어 이름이 한국어와 다르면 함께 */
export const secondaryName = (n: Names) => (n.ko && n.en && n.ko !== n.en ? n.en : undefined)

const year = (y: number) => (y < 0 ? `기원전 ${-y}` : String(y))
/** 작업 기간: "1889", "1914–1926", "1650년 무렵" */
export function formatPeriod(p?: Period): string {
  if (!p || (p.from === undefined && p.to === undefined)) return ''
  const from = p.from ?? p.to!
  const to = p.to ?? p.from!
  const span = from === to ? year(from) : `${year(from)}–${year(to)}`
  return p.c ? `${span}년 무렵` : span
}

/** 작가 생몰: "1853–1890" */
export function formatLife(a: Pick<ArchiveArtist, 'b' | 'd'>): string {
  if (a.b === undefined && a.d === undefined) return ''
  return `${a.b !== undefined ? year(a.b) : '?'}–${a.d !== undefined ? year(a.d) : ''}`
}

/** Qid 목록 → 용어 이름들 (한국어 우선) */
export const labels = (ids: Qid[] | undefined, vocab: Vocab) =>
  (ids ?? []).map((id) => vocab[id]?.[0] || vocab[id]?.[1]).filter((x): x is string => !!x)
