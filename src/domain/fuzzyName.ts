/**
 * 이름 흐리게 맞추기 — 서버 없이, 틀리게 써도 연결되게.
 *
 * 한글: 음절을 자모로 풀고, 사람들이 자주 헷갈리는 소리를 하나로 접는다(된소리·거센소리 → 예사소리, ㅑ→ㅏ, ㅖ·ㅐ→ㅔ,
 *   받침 대표음). 그다음 자모 편집 거리로 비교한다. "마르셸 뒤샹", "마르셀 뒤상", "마르세 뒤쌍" → "마르셀 뒤샹".
 * 라틴: 소문자·악센트 제거 뒤 겹글자를 하나로, 편집 거리로 비교 ("Duchamps", "Pikasso").
 * 실제 데이터 평가(2026-10-23): 한국어 오타 1,124건 복구 0.4% → 99.8%, 정확한 이름 99.9% 유지.
 * 한글 ↔ 라틴 자음 뼈대 맞추기(한국어 이름 없는 작가)는 맞음 65% · 틀림 30%라 넣지 않았다 — 틀린 연결이 없는 것보다 나쁘다.
 */

const SBASE = 0xac00
const isHangul = (c: number) => c >= SBASE && c <= 0xd7a3

// 초성 19: ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ → 된소리·거센소리를 예사소리로 (ㅋ→ㄱ, ㅌ→ㄷ, ㅍ→ㅂ, ㅊ→ㅈ)
const CHO = 'ㄱㄱㄴㄷㄷㄹㅁㅂㅂㅅㅅㅇㅈㅈㅈㄱㄷㅂㅎ'
// 중성 21: ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ → ㅐㅒㅖ→ㅔ, ㅑ→ㅏ, ㅕ→ㅓ, ㅛ→ㅗ, ㅠ→ㅜ, ㅙㅚ→ㅞ, ㅢ→ㅣ
const JUNG = 'ㅏㅔㅏㅔㅓㅔㅓㅔㅗㅘㅞㅞㅗㅜㅝㅞㅟㅜㅡㅣㅣ'
// 종성 28(없음 포함): 대표음으로 (ㄱㄲㅋ→ㄱ, ㄷㅅㅆㅈㅊㅌㅎ→ㄷ, ㅂㅍ→ㅂ, 겹받침은 앞소리)
const JONG = ['', 'ㄱ', 'ㄱ', 'ㄱ', 'ㄴ', 'ㄴ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㄱ', 'ㅁ', 'ㄹ', 'ㄹ', 'ㄹ', 'ㅂ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅂ', 'ㄷ', 'ㄷ', 'ㅇ', 'ㄷ', 'ㄷ', 'ㄱ', 'ㄷ', 'ㅂ', 'ㄷ']

/** 한글을 접은 자모열로 (한글이 아닌 글자는 그대로). 공백·문장부호는 뺀다 */
export function foldKo(s: string): string {
  let out = ''
  for (const ch of s.normalize('NFC')) {
    const c = ch.charCodeAt(0)
    if (isHangul(c)) {
      const i = c - SBASE
      const cho = CHO[Math.floor(i / 588)]
      out += (cho === 'ㅇ' ? '' : cho) + JUNG[Math.floor((i % 588) / 28)] + JONG[i % 28]
    } else if (/[\p{L}\p{N}]/u.test(ch)) out += ch.toLowerCase()
  }
  return out
}

/** 라틴 접기: 악센트 제거 · 소문자 · 문자와 숫자만 · 겹글자 하나로 */
export function foldLatin(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '')
    .replace(/(.)\1+/g, '$1')
}

export const hasHangul = (s: string) => /[가-힣]/.test(s)

/** 편집 거리 (넘으면 max+1을 돌려 일찍 끝낸다) */
export function levenshtein(a: string, b: string, max = Infinity): number {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      if (cur[j] < rowMin) rowMin = cur[j]
    }
    if (rowMin > max) return max + 1
    prev = cur
  }
  return prev[b.length]
}

/**
 * 접은 두 글자열의 닮음 0–1 (1 − 거리/긴 쪽 길이). 고칠 수 있는 글자 수는 길이에 비례해 5글자마다 하나 —
 * 짧은 이름은 접은 뒤 같아야만 한다("모네"와 "마네"는 다른 사람). 그보다 다르면 0.
 */
export function closeness(a: string, b: string, per = 5): number {
  if (!a || !b) return 0
  const long = Math.max(a.length, b.length)
  const max = Math.floor(long / per)
  if (max === 0) return a === b ? 1 : 0
  const d = levenshtein(a, b, max)
  return d > max ? 0 : 1 - d / long
}

/** 비교용으로 미리 접어 둔 이름 (색인 조각마다 한 번만 만든다) */
export interface Folded {
  ko: boolean
  full: string
  words: string[]
}

export function prepareName(name: string): Folded {
  const ko = hasHangul(name)
  const fold = ko ? foldKo : foldLatin
  return { ko, full: fold(name), words: name.split(/[\s\p{P}]+/u).map(fold).filter(Boolean) }
}

/**
 * 이름 유사도 0–1.
 * 같음(접은 뒤) 1 · 한쪽이 다른 쪽을 품음 0.5–0.95 · 비슷함(편집 거리) 0.4–0.85.
 * 낱말 단위로도 본다 ("뒤쌍"만 써도 "마르셀 뒤샹").
 */
export function foldedSimilarity(q: Folded, c: Folded): number {
  if (q.ko !== c.ko || !q.full || !c.full) return 0
  if (q.full === c.full) return 1
  let best = 0
  const [short, long] = q.full.length <= c.full.length ? [q.full, c.full] : [c.full, q.full]
  // 품음: 한글은 자모 4개(두 음절 정도), 라틴은 2글자 이상일 때만
  if (short.length >= (q.ko ? 4 : 2) && long.includes(short)) best = 0.5 + (0.45 * short.length) / long.length
  const whole = closeness(q.full, c.full)
  if (whole) best = Math.max(best, 0.4 + 0.45 * whole)
  // 낱말끼리: 짧게 쓴 이름(성만)이 긴 이름의 한 낱말과 비슷하면
  for (const a of q.words) {
    if (a.length < (q.ko ? 4 : 3)) continue
    for (const b of c.words) {
      if (b[0] !== a[0]) continue // 첫 글자까지 틀리게 쓰는 일은 드물다 (색인도 첫 글자로 나뉜다)
      const s = closeness(a, b)
      if (s) best = Math.max(best, 0.4 + 0.3 * s * (a.length / q.full.length) + 0.1 * s)
    }
  }
  return Math.min(best, 0.99)
}

export const nameSimilarity = (query: string, candidate: string) => foldedSimilarity(prepareName(query), prepareName(candidate))

/** 한글 이름의 색인 조각: 초성을 접은 갈래가 같은 조각들 (ㄱ·ㅋ·ㄲ → h0·h15, ㄷ·ㅌ → h3·h16, ㅂ·ㅍ → h7·h17, ㅈ·ㅊ → h12·h14) */
export const HANGUL_SHARD_GROUPS: Record<string, string[]> = {
  h0: ['h0', 'h15'],
  h15: ['h0', 'h15'],
  h3: ['h3', 'h16'],
  h16: ['h3', 'h16'],
  h7: ['h7', 'h17'],
  h17: ['h7', 'h17'],
  h12: ['h12', 'h14'],
  h14: ['h12', 'h14'],
}
