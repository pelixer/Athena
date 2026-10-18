import { forwardRef } from 'react'
import styles from './TemplateTicket.module.css'

export interface TemplateTicketProps {
  title: string
  /** 날짜 · 시간 · 장소 · 기록 */
  rows: [label: string, value: string][]
  /** "No.01—12" */
  range: string
  /** 고른 오브제 앞 4장 */
  thumbs: (string | undefined)[]
  note?: string
  /** "No.07 · 나의 노트" */
  noteLabel?: string
}

/**
 * 1b 입장권 · TemplateTicket (9:16, 360×640 → 내보낼 때 1080×1920).
 * 하늘 바탕 위 대리석 입장권. 절취선 위는 관람 기록, 아래 그루터기는 표지 오브제의 나의 노트.
 */
export const TemplateTicket = forwardRef<HTMLDivElement, TemplateTicketProps>(function TemplateTicket(p, ref) {
  return (
    <div ref={ref} className={styles.ticket}>
      <div className={styles.main}>
        <div className={styles.eyebrow}>
          <span>입장권 · 미감 기록</span>
          <span>{p.range}</span>
        </div>
        <div className={styles.title}>{p.title}</div>
        <dl className={styles.table}>
          {p.rows.map(([label, value]) => (
            <div key={label} className={styles.row}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className={styles.spacer} />
        <div className={styles.thumbs}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={styles.thumb} style={p.thumbs[i] ? { backgroundImage: `url(${p.thumbs[i]})` } : undefined} />
          ))}
        </div>
      </div>
      <div className={styles.perforation} />
      <div className={styles.stub}>
        {p.note && <div className={styles.note}>{p.note}</div>}
        <div className={styles.footer}>
          <span className={styles.noteLabel}>{p.note ? p.noteLabel : ''}</span>
          <span className={styles.wordmark}>Athena</span>
        </div>
      </div>
    </div>
  )
})
