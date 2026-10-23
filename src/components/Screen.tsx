import type { ReactNode } from 'react'
import styles from './Screen.module.css'

/**
 * 화면 틀 (v2.3): 스크롤 본문 + 위 막대(44 · 제목 · 44) + 하단 좌대 막대(PlinthBar).
 * 좌대 막대는 아래로 갈수록 대리석으로 짙어지는 바탕 위에 54 버튼을 가운데 모은다(주 동작이 오른쪽).
 * 본문 끝에는 좌대 높이만큼 여백을 두어 마지막 내용이 버튼에 가리지 않는다.
 */
export function Screen({
  left,
  title,
  right,
  bottom,
  fade,
  tone = 'marble',
  children,
}: {
  left?: ReactNode
  title?: ReactNode
  right?: ReactNode
  bottom?: ReactNode
  fade?: boolean
  tone?: 'marble' | 'wall'
  children: ReactNode
}) {
  return (
    <div className={`${styles.screen} ${styles[tone]} ${bottom ? styles.withPlinth : ''}`}>
      {children}
      {fade && <div className={styles.fade} />}
      {(left || title || right) && (
        <div className={styles.top}>
          <span className={styles.slot}>{left}</span>
          <span className={styles.title}>{title}</span>
          <span className={`${styles.slot} ${styles.end}`}>{right}</span>
        </div>
      )}
      {bottom && <PlinthBar tone={tone}>{bottom}</PlinthBar>}
    </div>
  )
}

/** PlinthBar — 하단 좌대 막대. 어두운 화면(촬영·사진 보기)에는 쓰지 않는다 */
export function PlinthBar({ tone = 'marble', children }: { tone?: 'marble' | 'wall'; children: ReactNode }) {
  return <div className={`${styles.plinth} ${tone === 'wall' ? styles.plinthWall : ''}`}>{children}</div>
}
