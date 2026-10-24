import styles from './MetaTable.module.css'

/**
 * 작품 라벨 표 (D1): 오브제 상세의 자동 기록 표(시각 · 장소 · 좌표).
 * variant="text"는 아카이브처럼 값이 말(사조·재료 이름)인 표 — 머리 열 64, 값 sans (단계 2 · REVIEW A2).
 */
export function MetaTable({ rows, variant = 'data' }: { rows: [label: string, value: string][]; variant?: 'data' | 'text' }) {
  return (
    <dl className={`${styles.table} ${variant === 'text' ? styles.text : ''}`}>
      {rows.map(([label, value]) => (
        <div key={label} className={styles.row}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
