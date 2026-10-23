import { Icon, type IconName } from './Icon'
import styles from './ShutterButton.module.css'

/** ShutterButton (C1–C3) — 78 링 3px + 62 속. 오브제는 대리석, 캡션은 sky-300. icon을 주면 가운데에 ✓ (첨부한 사진 추가) */
export function ShutterButton({ mode, onPress, disabled, icon, label }: { mode: 'obje' | 'docent'; onPress: () => void; disabled?: boolean; icon?: IconName; label?: string }) {
  return (
    <button type="button" className={styles.shutter} onClick={onPress} disabled={disabled} aria-label={label ?? (mode === 'obje' ? '오브제 찍기' : '캡션 찍기')}>
      <span className={`${styles.fill} ${mode === 'docent' ? styles.docent : ''}`}>{icon && <Icon name={icon} size={28} />}</span>
    </button>
  )
}
