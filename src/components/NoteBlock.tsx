import { formatTime } from '../lib/format'
import styles from './NoteBlock.module.css'

/**
 * NoteBlock — 나의 노트 (D2·D3, R15). 위아래 결 선, 최소 높이 200, 오른쪽 위 큰 따옴표(roman 64, sky-300), 노트는 serif 18.
 * 자리 전체를 누르면 쓰기/고치기.
 */
export function NoteBlock({ note, updatedAt, onWrite }: { note?: string; updatedAt?: number; onWrite?: () => void }) {
  const body = (
    <>
      <span className={styles.label}>나의 노트</span>
      {note && (
        <span className={styles.quote} aria-hidden>
          ”
        </span>
      )}
      {note ? <span className={styles.text}>{note}</span> : <span className={styles.empty}>이 앞에서 무엇을 느꼈나요?</span>}
      {note && updatedAt && <span className={styles.time}>{formatTime(updatedAt)} 작성</span>}
    </>
  )
  return onWrite ? (
    <button type="button" className={styles.block} onClick={onWrite} aria-label={note ? '나의 노트 고치기' : '나의 노트 쓰기'}>
      {body}
    </button>
  ) : (
    <section className={styles.block}>{body}</section>
  )
}
