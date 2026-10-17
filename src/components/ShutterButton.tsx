import styles from './ShutterButton.module.css'

/** ShutterButton — 오브제(흰색) / 도슨트(하늘) */
export function ShutterButton({ mode, onPress, disabled }: { mode: 'obje' | 'docent'; onPress: () => void; disabled?: boolean }) {
  return (
    <button type="button" className={styles.shutter} onClick={onPress} disabled={disabled} aria-label={mode === 'obje' ? '오브제 찍기' : '도슨트 찍기'}>
      <span className={`${styles.fill} ${mode === 'docent' ? styles.docent : ''}`} />
    </button>
  )
}
