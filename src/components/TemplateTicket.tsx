import { forwardRef } from 'react'
import { AthenaLogo } from './AthenaLogo'
import { DoubleRule } from './Stoa'
import styles from './TemplateTicket.module.css'

export interface TemplateTicketProps {
  title: string
  /** 날짜 · 시간 · 장소 · 기록 */
  rows: [label: string, value: string][]
  /** "N° 01—04" */
  range: string
  /** 고른 순서대로 앞 4장 */
  thumbs: (string | undefined)[]
  note?: string
  /** "N° 04 · 나의 노트" */
  noteLabel?: string
}

/**
 * 입장권 · TemplateTicket (v2.3 E4, 9:16 · 300×533 → 내보낼 때 1080×1920).
 * 하늘 바탕 위 대리석 입장권: ADMIT ONE · N° 범위 → 제목(serif 21) → 이중 박공선 → 표 → 사진 4장.
 * 절취선(양옆 반원 파냄) 아래 그루터기는 1번 오브제의 나의 노트와 서명.
 */
export const TemplateTicket = forwardRef<HTMLDivElement, TemplateTicketProps>(function TemplateTicket(p, ref) {
  return (
    <div ref={ref} className={styles.ticket}>
      <div className={styles.main}>
        <div className={styles.eyebrow}>
          <span>ADMIT ONE</span>
          <span>{p.range}</span>
        </div>
        <div className={styles.title}>{p.title}</div>
        <DoubleRule />
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
          <AthenaLogo size={16} />
        </div>
      </div>
    </div>
  )
})
