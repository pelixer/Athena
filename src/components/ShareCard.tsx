import { forwardRef } from 'react'
import { formatDate, formatSequence } from '../lib/format'
import { formatTag } from '../domain/tags'
import styles from './ShareCard.module.css'

export interface ShareCardProps {
  src?: string
  takenAt: number
  sequence?: number
  visitTitle?: string
  note?: string
  tags: string[]
}

/** 공유 카드. 이 DOM이 그대로 이미지로 내보내진다 (내보내기는 추후). */
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { src, takenAt, sequence, visitTitle, note, tags },
  ref,
) {
  return (
    <div ref={ref} className={styles.card}>
      {src ? <img className={styles.photo} src={src} alt="" /> : <div className={styles.photo} />}
      {note && <blockquote className={styles.note}>{note}</blockquote>}
      <footer className={styles.footer}>
        <span>{visitTitle}</span>
        <span>
          {formatDate(takenAt)}
          {sequence !== undefined && ` · ${formatSequence(sequence)}`}
        </span>
      </footer>
      {tags.length > 0 && <p className={styles.tags}>{tags.map(formatTag).join(' ')}</p>}
    </div>
  )
})
