import type { ReactNode } from 'react'
import styles from './Screen.module.css'

/** 화면 틀: 스크롤 본문 + 위에 뜨는 버튼 줄 + 아래 고정 버튼 줄. 시안의 390×844 프레임 배치를 기기 안전 영역에 맞춘 것. */
export function Screen({ top, bottom, fade, tone = 'marble', children }: { top?: ReactNode; bottom?: ReactNode; fade?: boolean; tone?: 'marble' | 'sunken' | 'dark'; children: ReactNode }) {
  return (
    <div className={`${styles.screen} ${styles[tone]}`}>
      {children}
      {fade && <div className={styles.fade} />}
      {top && <div className={styles.top}>{top}</div>}
      {bottom && <div className={styles.bottom}>{bottom}</div>}
    </div>
  )
}
