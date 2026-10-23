import styles from './TabBar.module.css'

/** 컬렉션의 보기 탭 (순번 · 라벨 · 노트, B2). sans 15, 고른 탭은 먹 600 + 2px 밑줄 */
export function TabBar<T extends string>({ tabs, value, onChange }: { tabs: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className={styles.bar} role="tablist">
      {tabs.map((t) => (
        <button key={t.value} type="button" role="tab" aria-selected={t.value === value} className={`${styles.tab} ${t.value === value ? styles.active : ''}`} onClick={() => onChange(t.value)}>
          {t.label}
        </button>
      ))}
    </div>
  )
}
