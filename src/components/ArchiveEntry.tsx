import { displayName, entryRows, formatPeriod, secondaryName, type ArchiveArtist, type ArchiveWork, type Vocab } from '../domain/archive'
import { DoubleRule } from './Stoa'
import { MetaTable } from './MetaTable'
import styles from './ArchiveEntry.module.css'

/**
 * ArchiveEntry — 아카이브 작품 한 점 (표시 전용). 단계 2: 오브제 상세의 라벨 형식(제목 serif · 이중 박공선 · 표)을 그대로 따른다.
 * 표: 작가 · 작업 기간 · 화법 · 화풍 · 근원지 (· 분류). 작가 쪽에서 보탠 값은 괄호로 밝힌다. 아래 출처(Wikidata).
 */
export function ArchiveEntry({ artist, work, vocab }: { artist: ArchiveArtist; work: ArchiveWork; vocab: Vocab }) {
  const sub = secondaryName(work.n)
  return (
    <article className={styles.entry}>
      <header className={styles.head}>
        <span className={styles.eyebrow}>ARCHIVE</span>
        <h2 className={styles.title}>{displayName(work.n) || '제목 없음'}</h2>
        {sub && <span className={styles.sub}>{sub}</span>}
      </header>
      <DoubleRule />
      <MetaTable variant="text" rows={entryRows(artist, work, vocab)} />
      <a className={styles.source} href={`https://www.wikidata.org/wiki/${work.id}`} target="_blank" rel="noreferrer">
        출처 Wikidata {work.id} · CC0
      </a>
    </article>
  )
}

/** 작품 목록 한 줄 (작가의 다른 작품·다른 후보): 제목 · 기간 */
export function ArchiveWorkRow({ work, artist, onSelect }: { work: ArchiveWork; artist?: ArchiveArtist; onSelect: () => void }) {
  const period = formatPeriod(work.y)
  return (
    <button type="button" className={styles.row} onClick={onSelect}>
      <span className={styles.rowTitle}>{displayName(work.n) || '제목 없음'}</span>
      <span className={styles.rowMeta}>{[artist && displayName(artist.n), period].filter(Boolean).join(' · ')}</span>
    </button>
  )
}
