import type { Docent } from '../domain/types'
import styles from './DocentBlock.module.css'

/** DocentBlock — 기록. 현장 설명문 원문. */
export function DocentBlock({ docent, onShowPhoto, onEdit }: { docent: Docent; onShowPhoto?: () => void; onEdit?: () => void }) {
  return (
    <section className={styles.block}>
      <header className={styles.header}>
        <span className={styles.label}>도슨트 · 원문</span>
        <span className={styles.actions}>
          {onEdit && (
            <button type="button" className={styles.action} onClick={onEdit}>
              고치기
            </button>
          )}
          {onShowPhoto && (
            <button type="button" className={styles.action} onClick={onShowPhoto}>
              사진 보기
            </button>
          )}
        </span>
      </header>
      {docent.heading && <p className={styles.heading}>{docent.heading}</p>}
      {docent.text ? <p className={styles.text}>{docent.text}</p> : <p className={styles.empty}>설명문 사진은 붙었지만 글자를 아직 읽지 못했어요.</p>}
    </section>
  )
}
