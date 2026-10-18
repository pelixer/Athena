import { Icon, type IconName } from './Icon'
import styles from './ShutterButton.module.css'

/** ShutterButton — 오브제(흰색) / 캡션(하늘). icon을 주면 가운데에 아이콘(첨부한 사진 추가 등) */
export function ShutterButton({ mode, onPress, disabled, icon, label }: { mode: 'obje' | 'docent'; onPress: () => void; disabled?: boolean; icon?: IconName; label?: string }) {
  return (
    <button type="button" className={styles.shutter} onClick={onPress} disabled={disabled} aria-label={label ?? (mode === 'obje' ? '오브제 찍기' : '캡션 찍기')}>
      <span className={`${styles.fill} ${mode === 'docent' ? styles.docent : ''}`}>{icon && <Icon name={icon} size={30} />}</span>
    </button>
  )
}
