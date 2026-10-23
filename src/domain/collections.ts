import type { Visit } from './types'

export type CollectionSort = 'recent' | 'name' | 'count'

/**
 * 홈·폴더의 컬렉션 순서 (A2 정렬: 최근 추가 / 이름 / 오브제 수).
 * 최근 추가: 모으는 중인 것 → 나머지, 각각 최근에 시작한 것부터. 고정은 홈에서 따로 "I 고정" 구획으로 뺀다.
 */
export function orderCollections<T extends Pick<Visit, 'startedAt' | 'endedAt' | 'title'> & { count?: number }>(visits: T[], sort: CollectionSort = 'recent'): T[] {
  const byRecent = (a: T, b: T) => (a.endedAt ? 1 : 0) - (b.endedAt ? 1 : 0) || b.startedAt - a.startedAt
  return [...visits].sort((a, b) =>
    sort === 'name' ? a.title.localeCompare(b.title, 'ko') : sort === 'count' ? (b.count ?? 0) - (a.count ?? 0) || byRecent(a, b) : byRecent(a, b),
  )
}

/** 검색어: 이름·장소에 들어 있으면 (대소문자·띄어쓰기 무시) */
export function matchesQuery(v: Pick<Visit, 'title' | 'venue'>, query: string): boolean {
  const q = query.replace(/\s+/g, '').toLowerCase()
  if (!q) return true
  return `${v.title}${v.venue ?? ''}`.replace(/\s+/g, '').toLowerCase().includes(q)
}
