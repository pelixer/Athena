import { forwardRef } from 'react'
import marble from '../assets/marble.jpg'
import stucco from '../assets/t-stucco.jpg'
import shadow from '../assets/t-shadow.jpg'
import silkBeige from '../assets/t-silk-beige.jpg'
import water from '../assets/t-water.jpg'
import silkWhite from '../assets/t-silk-white.jpg'
import { AthenaLogo } from './AthenaLogo'
import styles from './Card.module.css'

export type CardStyle = 'sky' | 'marble' | 'photo' | 'plate'
export type CardBg = 'stucco' | 'shadow' | 'silk-beige' | 'water' | 'silk-white'
export type CardField = 'note' | 'meta' | 'docent' | 'tags'

/** 바탕 텍스처 5종 (v2.3 · 사용자 제공). 회벽만 음각 노트, 그림자·물은 흰 글자, 비단은 먹 글자 */
export const CARD_BGS: { bg: CardBg; label: string; src: string }[] = [
  { bg: 'stucco', label: '회벽', src: stucco },
  { bg: 'shadow', label: '야자 그림자', src: shadow },
  { bg: 'silk-beige', label: '비단 · 베이지', src: silkBeige },
  { bg: 'water', label: '물', src: water },
  { bg: 'silk-white', label: '비단 · 흰', src: silkWhite },
]
export const MARBLE_SRC = marble

export interface CardProps {
  style: CardStyle
  /** 바탕 텍스처. 하늘·대리석 배치(사진 위 · 글 아래)의 바탕을 바꾼다 */
  bg?: CardBg
  fields: Set<CardField>
  photo?: string
  note?: string
  /** "N° 04" */
  index: string
  /** "2026.10.18" */
  date: string
  place?: string
  /** 도록의 제목 줄 */
  title?: string
  docentHeading?: string
  tags: string[]
}

/**
 * Card — 공유 카드 280×420 (v2.3 E1·E2, 내보내기 1080×1620). 이 DOM이 그대로 이미지가 된다.
 * 하늘·대리석·바탕: 사진(170, 반경 6) 위 · 노트 아래. 사진: 사진을 깔고 글을 아래로. 도록: 대리석 매트에 건 사진 + N°·제목 + 음각 노트.
 * 아래 줄: 메타(모노 12 두 줄) · 가로형 로고 24, 메타 마지막 줄의 밑선을 신전 받침 밑선에 맞춘다.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(p, ref) {
  const tone = p.style === 'photo' || p.style === 'plate' ? p.style : (p.bg ?? p.style)
  const show = (f: CardField) => p.fields.has(f)
  const bgSrc = p.style === 'marble' || p.style === 'sky' ? CARD_BGS.find((b) => b.bg === p.bg)?.src : undefined
  const background = bgSrc
    ? { backgroundImage: `url(${bgSrc})` }
    : p.style === 'marble'
      ? { backgroundImage: `url(${marble})` }
      : p.style === 'photo' && p.photo
        ? { backgroundImage: `var(--gradient-photo), url(${p.photo})`, backgroundPosition: 'center' }
        : undefined
  const photo = p.photo ? { backgroundImage: `url(${p.photo})` } : undefined
  // 캡션·라벨이 함께 켜지면 노트를 줄여 카드 안에 맞춘다
  const extras = (show('docent') && p.docentHeading ? 1 : 0) + (show('tags') && p.tags.length ? 1 : 0)
  const noteLines = p.style === 'photo' ? 8 - extras : p.style === 'plate' ? 4 : 5 - extras

  return (
    <div ref={ref} className={`${styles.card} ${styles[tone]}`} style={background}>
      {p.style === 'photo' && <div className={styles.spacer} />}
      {p.style === 'plate' ? (
        <>
          <div className={styles.mat}>
            <div className={styles.hung} style={photo} />
          </div>
          {p.title && (
            <p className={styles.plateTitle}>
              <span className={styles.plateIndex}>{p.index}</span>
              <span className={styles.plateName}>{p.title}</span>
            </p>
          )}
        </>
      ) : (
        p.style !== 'photo' && <div className={styles.inset} style={photo} />
      )}
      {show('note') && p.note && (
        <p className={styles.note} style={{ WebkitLineClamp: noteLines }}>
          {p.note}
        </p>
      )}
      {/* R6: 캡션 첫 줄은 노트 바로 아래에 출처처럼, 라벨은 서명 바로 위 */}
      {show('docent') && p.docentHeading && <p className={styles.small}>— {p.docentHeading}</p>}
      {p.style !== 'photo' && <div className={styles.spacer} />}
      {show('tags') && p.tags.length > 0 && <p className={styles.small}>{p.tags.map((t) => `#${t}`).join(' ')}</p>}
      <footer className={styles.footer}>
        <span className={styles.meta}>
          {show('meta') && (
            <>
              {p.index} · {p.date}
              {p.place && (
                <>
                  <br />
                  {p.place}
                </>
              )}
            </>
          )}
        </span>
        <AthenaLogo size={24} baseline className={styles.logo} />
      </footer>
    </div>
  )
})
