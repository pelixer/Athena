import styles from './TextBlock.module.css'

/** 현장 설명문(추출 텍스트) — 기록 */
export function DocentBlock({ text }: { text: string }) {
  return (
    <section className={`${styles.block} ${styles.docent}`}>
      <h3 className={styles.label}>Docent</h3>
      <p className={styles.text}>{text}</p>
    </section>
  )
}

/** 나만의 도슨트, 감정, 해석 — 해석 */
export function NoteBlock({ text }: { text: string }) {
  return (
    <section className={`${styles.block} ${styles.note}`}>
      <h3 className={styles.label}>My note</h3>
      <p className={styles.text}>{text}</p>
    </section>
  )
}
