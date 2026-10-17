import { formatTime } from '../lib/format'
import styles from './NoteBlock.module.css'

/** NoteBlock — 해석. 나만의 도슨트, 감정, 해석. 비어 있으면 쓰기를 권한다(단계 2). */
export function NoteBlock({ note, updatedAt, onWrite }: { note?: string; updatedAt?: number; onWrite?: () => void }) {
  return (
    <section className={styles.block}>
      <header className={styles.header}>
        <span className={styles.dot} />
        <span className={styles.label}>나의 노트</span>
      </header>
      {note ? (
        <p className={styles.text}>{note}</p>
      ) : (
        <button type="button" className={styles.empty} onClick={onWrite}>
          이 앞에서 무엇을 느꼈나요?
        </button>
      )}
      {note && updatedAt && <span className={styles.time}>{formatTime(updatedAt)} 작성</span>}
    </section>
  )
}
