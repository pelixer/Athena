import styles from './ObjeCard.module.css'

/** ObjeCard (B2) — 컬렉션 격자의 한 칸: 사진 4:5(반경 2) → N° + 붙은 것(하늘) → 제목 한 줄. 검은 순번 배지는 없앴다 */
export function ObjeCard({ src, index, attachment, title }: { src?: string; index: string; attachment?: string; title?: string }) {
  return (
    <figure className={styles.card}>
      <div className={styles.photo} style={src ? { backgroundImage: `url(${src})` } : undefined} />
      <figcaption className={styles.caption}>
        <span className={styles.meta}>
          <span className={styles.index}>{index}</span>
          <span className={styles.attached}>{attachment}</span>
        </span>
        <span className={title ? styles.title : `${styles.title} ${styles.untitled}`}>{title ?? '제목 없음'}</span>
      </figcaption>
    </figure>
  )
}
