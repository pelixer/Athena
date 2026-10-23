import styles from './Toggle.module.css'

/** 토글 (v2.3 E4): 44×26, 바탕 없음 + 하늘 1px 테. 켜짐 = 오른쪽 하늘 동그라미 20, 꺼짐 = 왼쪽 빈 동그라미 */
export function Toggle({ on, label, onChange }: { on: boolean; label: string; onChange: (on: boolean) => void }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className={`${styles.toggle} ${on ? styles.on : ''}`} onClick={() => onChange(!on)} />
}
