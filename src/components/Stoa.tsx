import type { ReactNode } from 'react'
import { AthenaLogo } from './AthenaLogo'
import { Icon } from './Icon'
import styles from './Stoa.module.css'

/**
 * v2 "Stoa" 작은 부품들 — 이중 박공선, 구획 머리, 표지 액자, 상태 알약.
 */

/** 이중 박공선 (--rule-double): 높이 3, 위아래 1px 먹 선. 로고 지붕의 이중선 */
export function DoubleRule({ className }: { className?: string }) {
  return <div className={`${styles.rule} ${className ?? ''}`} aria-hidden />
}

/** 구획 머리: 로마 숫자 · 이름 · 오른쪽 개수, 간격 8 아래 이중 박공선 */
export function SectionHead({ numeral, name, count }: { numeral?: string; name: string; count?: string }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionLine}>
        {numeral && <span className={styles.numeral}>{numeral}</span>}
        <span className={styles.sectionName}>{name}</span>
        <span className={styles.grow} />
        {count && <span className={styles.count}>{count}</span>}
      </div>
      <DoubleRule />
    </div>
  )
}

/** 목록 표지 액자 48×60: 흰 매트 2px + 결 선. 사진이 없으면 신전 심볼, 폴더면 2×2 모자이크 + 폴더 표식 */
export function CoverFrame({ src, mosaic, folder, small }: { src?: string; mosaic?: (string | undefined)[]; folder?: boolean; small?: boolean }) {
  const size = small ? styles.small : ''
  if (mosaic) {
    return (
      <span className={`${styles.cover} ${styles.mat} ${size}`}>
        <span className={styles.mosaic}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={styles.tile} style={mosaic[i] ? { backgroundImage: `url(${mosaic[i]})` } : undefined} />
          ))}
        </span>
        {folder && (
          <span className={styles.folderMark}>
            <Icon name="folder" size={12} />
          </span>
        )}
      </span>
    )
  }
  if (!src) {
    return (
      <span className={`${styles.cover} ${styles.empty} ${size}`}>
        <AthenaLogo variant="mark" size={22} />
      </span>
    )
  }
  return (
    <span className={`${styles.cover} ${styles.mat} ${size}`}>
      <span className={styles.photo} style={{ backgroundImage: `url(${src})` }} />
    </span>
  )
}

/** 상태 알약: "모으는 중"(하늘 점) / "마무리"(seal). 바탕 없음 + 결 선 + 하늘 글자 */
export function StatusPill({ sealed }: { sealed?: boolean }) {
  return (
    <span className={styles.pill}>
      {sealed ? <Icon name="seal" size={12} /> : <span className={styles.dot} />}
      {sealed ? '마무리' : '모으는 중'}
    </span>
  )
}

/** 목록 메타 줄의 상태: 고정(핀) · 모으는 중(점) — 바탕 없이 하늘 글자 */
export function RowStatus({ pinned, collecting }: { pinned?: boolean; collecting?: boolean }) {
  const parts: ReactNode[] = []
  if (pinned)
    parts.push(
      <span key="pin" className={styles.status}>
        <Icon name="pin" size={13} />
        고정
      </span>,
    )
  if (collecting)
    parts.push(
      <span key="live" className={`${styles.status} ${styles.live}`}>
        <span className={styles.dot} />
        모으는 중
      </span>,
    )
  return <>{parts.flatMap((p, i) => (i ? [<span key={`d${i}`} className={styles.bar}>|</span>, p] : [p]))}</>
}
