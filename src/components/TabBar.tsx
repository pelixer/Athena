import styles from './TabBar.module.css'

/** 관람 보기의 정렬/보기 탭 (순번 · 라벨 · 노트만). 단계 2 — 시안에 이름이 없어 코드에서 붙인 이름. */
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
