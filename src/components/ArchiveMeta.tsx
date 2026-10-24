import type { ArchiveCandidate } from '../domain/types'
import { MetaTable } from './MetaTable'
import { SectionHead } from './Stoa'
import styles from './ArchiveMeta.module.css'

/**
 * ArchiveMeta — 꼬리표를 누르면 열리는 메타 시트의 몸 (표시 전용).
 * 표: 작가 · 작업 기간 · 화법 · 화풍 · 근원지 (· 분류), 작가 쪽에서 보탠 값은 괄호. 출처. 아래 다른 후보(누르면 그 작품으로 바꾼다).
 */
export function ArchiveMeta({
  rows,
  workId,
  candidates,
  linked,
  onPick,
}: {
  rows?: [string, string][]
  workId?: string
  candidates?: ArchiveCandidate[]
  /** 작품까지 맞췄는지 (아니면 후보 제목이 "이 작품인가요?") */
  linked?: boolean
  onPick: (c: ArchiveCandidate) => void
}) {
  return (
    <div className={styles.meta}>
      {rows && <MetaTable variant="text" rows={rows} />}
      {workId && (
        <a className={styles.source} href={`https://www.wikidata.org/wiki/${workId}`} target="_blank" rel="noreferrer">
          출처 Wikidata {workId} · CC0
        </a>
      )}
      {!!candidates?.length && (
        <section className={styles.candidates}>
          <SectionHead name={linked ? '다른 작품인가요?' : '이 작품인가요?'} />
          <div className={styles.list}>
            {candidates.map((c) => (
              <button key={`${c.artistId}-${c.workId}`} type="button" className={styles.row} onClick={() => onPick(c)}>
                <span className={styles.rowTitle}>{c.title}</span>
                <span className={styles.rowMeta}>{c.meta}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
