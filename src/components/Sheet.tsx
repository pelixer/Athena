import { useEffect, type ReactNode } from 'react'
import styles from './Sheet.module.css'

/** 아래에서 올라오는 시트 (노트 수정, 라벨 추가, 제목 수정). 단계 2 — radius md(시트) 규칙으로 구성. */
export function Sheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className={styles.scrim} onClick={onClose}>
      <section role="dialog" aria-modal="true" aria-label={title} className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>{title}</header>
        {children}
      </section>
    </div>
  )
}
