import { useEffect, type ReactNode } from 'react'
import { Button } from './Button'
import styles from './Sheet.module.css'

/**
 * 아래에서 올라오는 시트 (새 관람, 노트·제목·라벨·도슨트 편집). R2: 위 모서리 radius-lg, 손잡이,
 * 하단 버튼은 화면 하단 버튼 줄과 같게 (neutral 취소 + accent 확인).
 */
export function Sheet({
  open,
  title,
  aside,
  confirmLabel = '저장',
  confirmDisabled,
  onConfirm,
  onClose,
  children,
}: {
  open: boolean
  title: string
  /** 헤더 오른쪽 (예: 원문 사진 썸네일) */
  aside?: ReactNode
  confirmLabel?: string
  confirmDisabled?: boolean
  onConfirm?: () => void
  onClose: () => void
  children: ReactNode
}) {
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
        <span className={styles.handle} aria-hidden />
        <header className={styles.header}>
          <span className={styles.title}>{title}</span>
          {aside}
        </header>
        {children}
        {onConfirm && (
          <div className={styles.actions}>
            <Button variant="neutral" className={styles.cancel} onClick={onClose}>
              취소
            </Button>
            <Button className={styles.confirm} disabled={confirmDisabled} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
