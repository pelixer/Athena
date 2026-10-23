import { useEffect, useState } from 'react'
import type { ID } from '../domain/types'
import { Sheet } from './Sheet'
import { TextField } from './TextField'
import { Icon } from './Icon'
import { CoverFrame } from './Stoa'
import styles from './FolderPickSheet.module.css'

export type FolderChoice = { folderId: ID } | { newName: string } | { out: true }
export type FolderOption = { id: ID; name: string; count: number; mosaic: (string | undefined)[] }

/** FolderPickSheet (A7) — "어느 폴더에 둘까요?": 폴더 목록(모자이크 액자) · 새 폴더 · (폴더 안이면) 폴더에서 빼기 */
export function FolderPickSheet({
  open,
  subject,
  folders,
  currentFolderId,
  onPick,
  onClose,
}: {
  open: boolean
  /** 옮길 컬렉션 이름 */
  subject?: string
  folders: FolderOption[]
  currentFolderId?: ID
  onPick: (choice: FolderChoice) => void
  onClose: () => void
}) {
  const [picked, setPicked] = useState<ID | 'new' | 'out'>()
  const [name, setName] = useState('')
  useEffect(() => {
    if (open) {
      setPicked(undefined)
      setName('')
    }
  }, [open])

  const choice: FolderChoice | undefined =
    picked === 'new' ? (name.trim() ? { newName: name.trim() } : undefined) : picked === 'out' ? { out: true } : picked ? { folderId: picked } : undefined

  return (
    <Sheet
      open={open}
      eyebrow="MOVE"
      title="어느 폴더에 둘까요?"
      description={subject && `〈${subject}〉`}
      confirmLabel="옮기기"
      confirmDisabled={!choice}
      onConfirm={() => choice && onPick(choice)}
      onClose={onClose}
    >
      <div className={styles.list} role="radiogroup" aria-label="폴더">
        {folders
          .filter((f) => f.id !== currentFolderId)
          .map((f) => (
            <button key={f.id} type="button" role="radio" aria-checked={picked === f.id} className={styles.folder} onClick={() => setPicked(f.id)}>
              <CoverFrame small mosaic={f.mosaic} folder />
              <span className={styles.text}>
                <span className={styles.name}>{f.name}</span>
                <span className={styles.count}>컬렉션 {String(f.count).padStart(2, '0')}</span>
              </span>
              <span className={styles.check}>{picked === f.id && <Icon name="check" size={22} />}</span>
            </button>
          ))}
        <button type="button" role="radio" aria-checked={picked === 'new'} className={`${styles.line} ${styles.new}`} onClick={() => setPicked('new')}>
          <Icon name="add" size={20} />
          새 폴더
        </button>
        {picked === 'new' && <TextField id="folder-name" autoFocus placeholder="폴더 이름 — 여름 여행, 좋아하는 조각" value={name} onChange={(e) => setName(e.target.value)} className={styles.input} />}
        {currentFolderId && (
          <button type="button" role="radio" aria-checked={picked === 'out'} className={`${styles.line} ${styles.out}`} onClick={() => setPicked('out')}>
            <Icon name="unfolder" size={20} />
            폴더에서 빼기
            {picked === 'out' && <Icon name="check" size={22} />}
          </button>
        )}
      </div>
    </Sheet>
  )
}
