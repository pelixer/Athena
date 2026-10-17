import { formatDate, formatTime } from '../lib/format'
import styles from './MetaLine.module.css'

/** MetaLine — 2026.10.17 · 14:32 / 장소 */
export function MetaLine({ takenAt, place }: { takenAt: number; place?: string }) {
  return (
    <p className={styles.meta}>
      {formatDate(takenAt)} · {formatTime(takenAt)}
      {place && (
        <>
          <br />
          {place}
        </>
      )}
    </p>
  )
}
