import { useEffect, type ReactNode } from 'react'
import { IconButton } from './IconButton'
import type { IconName } from './Icon'
import styles from './Sheet.module.css'

/**
 * Sheet — 아래에서 올라오는 시트 (v2.3 System VII).
 * 손잡이 36×4 → 눈썹(roman, NEW·MOVE·CAPTION·NOTE·SAVE·SELECT·DELETE·COLLECTION) → 제목(serif 21) → 설명 → 내용 →
 * 버튼 줄: 취소(close) 왼쪽, 확인(check · 지우기는 delete) 오른쪽 끝. 글자 버튼 없음.
 * 키보드가 올라오면 키보드 바로 위에 붙는다(바닥은 키보드 뒤까지 이어진다 — R20).
 */
export function Sheet({
  open,
  eyebrow,
  title,
  description,
  aside,
  confirmIcon = 'check',
  confirmLabel = '확인',
  confirmDisabled,
  onConfirm,
  onClose,
  children,
}: {
  open: boolean
  eyebrow?: string
  title: string
  description?: ReactNode
  /** 제목 오른쪽 (예: 원문 사진 썸네일) */
  aside?: ReactNode
  confirmIcon?: IconName
  /** 확인 버튼의 이름 (글자 없이 aria-label·길게 누름 말풍선으로만) */
  confirmLabel?: string
  confirmDisabled?: boolean
  onConfirm?: () => void
  onClose: () => void
  children?: ReactNode
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
          <span className={styles.heading}>
            {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
            <span className={styles.title}>{title}</span>
            {description && <span className={styles.description}>{description}</span>}
          </span>
          {aside}
        </header>
        {children}
        <div className={styles.actions}>
          <IconButton icon="close" size={54} aria-label="취소" onClick={onClose} />
          {onConfirm && <IconButton icon={confirmIcon} size={54} aria-label={confirmLabel} disabled={confirmDisabled} onClick={onConfirm} className={styles.confirm} />}
        </div>
      </section>
    </div>
  )
}

/** 시트 안의 입력 묶음: 이름(sans 600 13) + 입력칸 */
export function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  )
}
