import type { Visit } from './types'

/**
 * 홈·폴더의 컬렉션 순서: 고정한 것(최근에 고정한 것부터) → 모으는 중인 것 → 나머지(최근에 시작한 것부터).
 */
export function orderCollections<T extends Pick<Visit, 'startedAt' | 'endedAt' | 'pinnedAt'>>(visits: T[]): T[] {
  const rank = (v: T) => (v.pinnedAt ? 0 : !v.endedAt ? 1 : 2)
  return [...visits].sort((a, b) => rank(a) - rank(b) || (b.pinnedAt ?? 0) - (a.pinnedAt ?? 0) || b.startedAt - a.startedAt)
}
