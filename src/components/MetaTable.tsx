import styles from './MetaTable.module.css'

/** 오브제 상세의 자동 기록 표 (시각 · 장소 · 좌표). 단계 2 — 시안에 이름이 없어 코드에서 붙인 이름. */
export function MetaTable({ rows }: { rows: [label: string, value: string][] }) {
  return (
    <dl className={styles.table}>
      {rows.map(([label, value]) => (
        <div key={label} className={styles.row}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
