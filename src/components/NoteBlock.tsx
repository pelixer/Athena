import { formatTime } from '../lib/format'
import styles from './NoteBlock.module.css'

/**
 * NoteBlock — 해석. 나만의 도슨트, 감정, 해석. 비어 있으면 쓰기를 권한다(단계 2).
 * roomy: 오브제 상세에서 노트가 짧거나 비어도 넉넉한 자리를 차지한다. 자리 전체를 누르면 쓰기/고치기.
 */
export function NoteBlock({ note, updatedAt, onWrite, roomy }: { note?: string; updatedAt?: number; onWrite?: () => void; roomy?: boolean }) {
  const body = note ? <p className={styles.text}>{note}</p> : <span className={styles.empty}>이 앞에서 무엇을 느꼈나요?</span>
  return (
    <section className={`${styles.block} ${roomy ? styles.roomy : ''}`}>
      <header className={styles.header}>
        <span className={styles.dot} />
        <span className={styles.label}>나의 노트</span>
      </header>
      {onWrite ? (
        <button type="button" className={styles.area} onClick={onWrite} aria-label={note ? '노트 고치기' : '노트 쓰기'}>
          {body}
        </button>
      ) : (
        body
      )}
      {note && updatedAt && <span className={styles.time}>{formatTime(updatedAt)} 작성</span>}
    </section>
  )
}
