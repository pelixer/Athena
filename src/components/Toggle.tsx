import styles from './Toggle.module.css'

/** 토글 (v2.3 E4 · R3 V4): 44×26, 바탕 없음. 꺼짐 = 돌 1px 테 + 왼쪽 빈 손잡이(돌 테), 켜짐 = 하늘 테 + 오른쪽 하늘 손잡이. 240ms */
export function Toggle({ on, label, onChange }: { on: boolean; label: string; onChange: (on: boolean) => void }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className={`${styles.toggle} ${on ? styles.on : ''}`} onClick={() => onChange(!on)} />
}
