import styles from './OptionChip.module.css'

/** 카드에 넣을 항목을 켜고 끄는 칩 (CardPage). 단계 2 — 시안의 칩을 컴포넌트로 묶은 것. */
export function OptionChip({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button type="button" aria-pressed={on} className={`${styles.chip} ${on ? styles.on : ''}`} onClick={onToggle}>
      {label}
    </button>
  )
}
