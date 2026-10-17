import { formatSequence } from '../lib/format'
import styles from './ObjeThumb.module.css'

/** 관람 보기의 그리드 한 칸: 사진 + 순번 */
export function ObjeThumb({ src, sequence, alt = '' }: { src?: string; sequence: number; alt?: string }) {
  return (
    <figure className={styles.thumb}>
      {src ? <img src={src} alt={alt} /> : <div className={styles.placeholder} />}
      <figcaption>{formatSequence(sequence)}</figcaption>
    </figure>
  )
}
