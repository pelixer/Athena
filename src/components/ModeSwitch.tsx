import styles from './ModeSwitch.module.css'

/** ModeSwitch — 사진 위 2단 전환 (오브제 / 도슨트) */
export function ModeSwitch<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className={styles.switch} role="tablist">
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={o.value === value} className={`${styles.option} ${o.value === value ? styles.active : ''}`} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
