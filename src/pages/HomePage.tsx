import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createVisit } from '../data/repo'
import { matchesQuery, type CollectionSort } from '../domain/collections'
import { formatCount, formatDateWeekday } from '../lib/format'
import { Screen } from '../components/Screen'
import { IconButton } from '../components/IconButton'
import { AthenaLogo } from '../components/AthenaLogo'
import { NewCollectionSheet } from '../components/NewCollectionSheet'
import { SectionHead } from '../components/Stoa'
import { Sheet } from '../components/Sheet'
import { Icon } from '../components/Icon'
import { CollectionRows, FolderRows, useLibrary } from './CollectionList'
import styles from './HomePage.module.css'

const ROMAN = ['I', 'II', 'III']
const SORTS: [CollectionSort, string][] = [
  ['recent', '최근 추가'],
  ['name', '이름'],
  ['count', '오브제 수'],
]

function savedSort(): CollectionSort {
  try {
    const s = localStorage.getItem('athena.sort')
    if (s === 'name' || s === 'count') return s
  } catch {
    /* 저장소를 못 쓰면 기본값 */
  }
  return 'recent'
}

/**
 * 홈 (A1–A4) — 나만의 미감 저장소.
 * 첫 실행: 세로형 로고 + 한 문장 + 첫 컬렉션 시작. 목록: I 고정 / II 컬렉션(폴더 → 컬렉션). 위 오른쪽 검색·정렬.
 */
export function HomePage() {
  const navigate = useNavigate()
  const [starting, setStarting] = useState(false)
  const [sort, setSort] = useState<CollectionSort>(savedSort)
  const [sorting, setSorting] = useState(false)
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  const close = useCallback(() => setStarting(false), [])
  const library = useLibrary(sort)

  async function start(title: string, venue?: string) {
    const visit = await createVisit({ title, venue })
    navigate(`/visit/${visit.id}`)
  }
  function chooseSort(s: CollectionSort) {
    setSort(s)
    setSorting(false)
    try {
      localStorage.setItem('athena.sort', s)
    } catch {
      /* 저장소를 못 쓰면 이번만 */
    }
  }

  if (!library) return null
  const home = library.rows.filter((r) => !r.folderId && matchesQuery(r, query))
  const pinned = home.filter((r) => r.pinnedAt).sort((a, b) => (b.pinnedAt ?? 0) - (a.pinnedAt ?? 0))
  const rest = home.filter((r) => !r.pinnedAt)
  const folders = library.folders.filter((f) => matchesQuery({ title: f.name }, query))
  const empty = library.rows.length === 0 && library.folders.length === 0
  const sections = [pinned.length > 0 && 'pinned', (rest.length > 0 || folders.length > 0) && 'all'].filter(Boolean) as string[]

  const sheet = <NewCollectionSheet open={starting} onClose={close} onStart={start} />

  if (empty)
    return (
      <div className={styles.first}>
        <div className={styles.firstBody}>
          <AthenaLogo variant="stacked" size={132} className={styles.logo} />
          <p className={styles.lead}>
            전시장에서 마음에 남은 것을
            <br />한 점씩 모아 두는 곳
          </p>
          <p className={styles.sublead}>
            작품을 찍고, 옆의 캡션을 붙이고,
            <br />그 앞에서 느낀 것을 적어 두세요.
          </p>
        </div>
        <div className={styles.firstAction}>
          <IconButton icon="add" size={54} aria-label="첫 컬렉션 시작" onClick={() => setStarting(true)} />
          <span className={styles.date}>{formatDateWeekday(Date.now())}</span>
        </div>
        {sheet}
      </div>
    )

  return (
    <Screen bottom={<IconButton icon="add" size={54} aria-label="새 컬렉션" onClick={() => setStarting(true)} />}>
      <main className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headLine}>
            <span className={styles.date}>{formatDateWeekday(Date.now())}</span>
            <span className={styles.tools}>
              <IconButton icon="search" size={40} aria-label="찾기" onClick={() => setSearching((s) => !s)} />
              <IconButton icon="sort" size={40} aria-label="정렬" onClick={() => setSorting(true)} />
            </span>
          </div>
          <div className={styles.brand}>
            <AthenaLogo size={40} className={styles.logo} />
            <span className={styles.tagline}>나만의 미감 저장소</span>
          </div>
          {searching && (
            <label className={styles.search}>
              <Icon name="search" size={20} />
              <input autoFocus type="search" placeholder="이름이나 장소로 찾기" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && (setQuery(''), setSearching(false))} />
            </label>
          )}
        </header>

        {sections.includes('pinned') && (
          <section className={styles.list}>
            <SectionHead numeral={ROMAN[0]} name="고정" count={formatCount(pinned.length)} />
            <CollectionRows rows={pinned} folders={library.folders} />
          </section>
        )}
        {sections.includes('all') && (
          <section className={styles.list}>
            <SectionHead numeral={ROMAN[sections.indexOf('all')]} name="컬렉션" count={formatCount(folders.length + rest.length)} />
            <FolderRows folders={folders} />
            <CollectionRows rows={rest} folders={library.folders} />
          </section>
        )}
        {query && sections.length === 0 && <p className={styles.none}>〈{query}〉에 맞는 컬렉션이 없어요.</p>}
      </main>

      {sheet}
      <Sheet open={sorting} eyebrow="SORT" title="어떤 순서로 볼까요?" onClose={() => setSorting(false)}>
        <div className={styles.sorts} role="radiogroup" aria-label="정렬">
          {SORTS.map(([value, label]) => (
            <button key={value} type="button" role="radio" aria-checked={sort === value} className={styles.sort} onClick={() => chooseSort(value)}>
              {label}
              {sort === value && <Icon name="check" size={22} />}
            </button>
          ))}
        </div>
      </Sheet>
    </Screen>
  )
}
