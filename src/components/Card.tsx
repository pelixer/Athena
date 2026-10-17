import { forwardRef } from 'react'
import marble from '../assets/marble.jpg'
import styles from './Card.module.css'

export type CardStyle = 'sky' | 'marble' | 'photo'
export type CardField = 'note' | 'meta' | 'docent' | 'tags'

export interface CardProps {
  style: CardStyle
  fields: Set<CardField>
  photo?: string
  note?: string
  /** "No.07 · 2026.10.17 14:32" */
  stamp: string
  place?: string
  docentHeading?: string
  tags: string[]
}

/**
 * Card — 공유 카드 (280×420). 이 DOM이 그대로 이미지로 내보내진다.
 * 하늘·대리석: 사진을 위에 넣고 아래에 글. 사진: 사진을 배경으로 깔고 글을 아래로.
 * 도슨트·라벨 항목의 배치는 단계 2 (시안에는 칩만 있음).
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(p, ref) {
  const inset = p.style !== 'photo'
  const background =
    p.style === 'marble'
      ? { backgroundImage: `url(${marble})` }
      : p.style === 'photo' && p.photo
        ? { backgroundImage: `var(--gradient-photo), url(${p.photo})` }
        : undefined
  const show = (f: CardField) => p.fields.has(f)
  // 도슨트·라벨이 함께 켜지면 노트를 줄여 카드 안에 맞춘다
  const extras = (show('docent') && p.docentHeading ? 1 : 0) + (show('tags') && p.tags.length ? 1 : 0)
  const noteLines = inset ? 3 - Math.min(extras, 1) : 7 - extras

  return (
    <div ref={ref} className={`${styles.card} ${styles[p.style]}`} style={background}>
      {inset && <div className={styles.inset} style={p.photo ? { backgroundImage: `url(${p.photo})` } : undefined} />}
      {!inset && <div className={styles.spacer} />}
      {show('docent') && p.docentHeading && <p className={styles.docent}>{p.docentHeading}</p>}
      {show('note') && p.note && (
        <p className={styles.note} style={{ WebkitLineClamp: noteLines }}>
          {p.note}
        </p>
      )}
      {show('tags') && p.tags.length > 0 && <p className={styles.tags}>{p.tags.map((t) => `#${t}`).join(' ')}</p>}
      {inset && <div className={styles.spacer} />}
      <footer className={styles.footer}>
        <span className={styles.meta}>
          {show('meta') && (
            <>
              {p.stamp}
              {p.place && (
                <>
                  <br />
                  {p.place}
                </>
              )}
            </>
          )}
        </span>
        <span className={styles.wordmark}>Athena</span>
      </footer>
    </div>
  )
})
