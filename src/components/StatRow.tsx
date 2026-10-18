import { formatCount } from '../lib/format'
import styles from './StatRow.module.css'

/** 관람 보기 상단 숫자 (오브제 · 캡션 · 나의 노트). 단계 2 — 시안에 이름이 없어 코드에서 붙인 이름. */
export function StatRow({ stats }: { stats: [label: string, value: number][] }) {
  return (
    <div className={styles.row}>
      {stats.map(([label, value]) => (
        <div key={label} className={styles.stat}>
          <span className={styles.value}>{formatCount(value)}</span>
          <span className={styles.label}>{label}</span>
        </div>
      ))}
    </div>
  )
}
