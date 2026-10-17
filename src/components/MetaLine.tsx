import type { GeoPoint } from '../domain/types'
import { formatDate, formatGeo, formatSequence, formatTime } from '../lib/format'
import styles from './MetaLine.module.css'

/** 날짜 · 시각 · 관람 내 순번 · 위치 */
export function MetaLine({ takenAt, sequence, location }: { takenAt: number; sequence?: number; location?: GeoPoint }) {
  const parts = [
    formatDate(takenAt),
    formatTime(takenAt),
    sequence !== undefined ? formatSequence(sequence) : undefined,
    location ? formatGeo(location) : undefined,
  ].filter(Boolean)
  return <p className={styles.meta}>{parts.join('  ·  ')}</p>
}
