import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './Page.module.css'

/** 모든 화면의 공통 틀: 상단 제목 + 본문 */
export function Page({ title, back, children }: { title: string; back?: string; children: ReactNode }) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        {back && (
          <Link to={back} className={styles.back} aria-label="뒤로">
            ←
          </Link>
        )}
        <h1 className={styles.title}>{title}</h1>
      </header>
      {children}
    </main>
  )
}
