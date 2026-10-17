import type { Docent } from '../domain/types'
import styles from './DocentBlock.module.css'

/** DocentBlock — 기록. 현장 설명문 원문. */
export function DocentBlock({ docent, onShowPhoto }: { docent: Docent; onShowPhoto?: () => void }) {
  return (
    <section className={styles.block}>
      <header className={styles.header}>
        <span className={styles.label}>도슨트 · 원문</span>
        {onShowPhoto && (
          <button type="button" className={styles.action} onClick={onShowPhoto}>
            사진 보기
          </button>
        )}
      </header>
      {docent.heading && <p className={styles.heading}>{docent.heading}</p>}
      {docent.text ? <p className={styles.text}>{docent.text}</p> : <p className={styles.empty}>설명문 사진은 붙었지만 텍스트를 아직 읽지 못했어요.</p>}
    </section>
  )
}
