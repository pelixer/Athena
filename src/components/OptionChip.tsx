import { Icon } from './Icon'
import styles from './OptionChip.module.css'

/** 카드에 넣을 항목 칩 (v2.3 E1). 켜짐 = 바탕 없음 + 먹 테 + 하늘 글자 + ✓, 꺼짐 = 대리석 바탕 + 결 테 + 돌 글자 */
export function OptionChip({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button type="button" aria-pressed={on} className={`${styles.chip} ${on ? styles.on : ''}`} onClick={onToggle}>
      {on && <Icon name="check" size={16} />}
      {label}
    </button>
  )
}
