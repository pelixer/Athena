import { IndexBadge } from './IndexBadge'
import styles from './ObjeCard.module.css'

/** ObjeCard — 관람 보기 그리드의 한 칸: 사진 + 순번 · 시각 · 붙은 것 · 제목 */
export function ObjeCard({ src, index, time, attachment, title }: { src?: string; index: number; time: string; attachment: string; title: string }) {
  return (
    <figure className={styles.card}>
      <div className={styles.photo} style={src ? { backgroundImage: `url(${src})` } : undefined}>
        <span className={styles.badge}>
          <IndexBadge index={index} variant="small" />
        </span>
      </div>
      <figcaption className={styles.caption}>
        <span className={styles.meta}>
          <span>{time}</span>
          <span className={attachment === '—' ? undefined : styles.attached}>{attachment}</span>
        </span>
        <span className={styles.title}>{title}</span>
      </figcaption>
    </figure>
  )
}
