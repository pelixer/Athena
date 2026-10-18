import { useEffect, useState } from 'react'
import type { Folder, ID } from '../domain/types'
import { Sheet } from './Sheet'
import { TextField } from './TextField'
import { Icon } from './Icon'
import styles from './FolderPickSheet.module.css'

export type FolderChoice = { folderId: ID } | { newName: string } | { out: true }

/** FolderPickSheet — 컬렉션을 옮길 폴더 고르기: 있는 폴더 / 새 폴더 / (폴더 안이면) 폴더에서 빼기 */
export function FolderPickSheet({
  open,
  folders,
  currentFolderId,
  onPick,
  onClose,
}: {
  open: boolean
  folders: Folder[]
  currentFolderId?: ID
  onPick: (choice: FolderChoice) => void
  onClose: () => void
}) {
  const [picked, setPicked] = useState<ID | 'new' | 'out'>()
  const [name, setName] = useState('')
  useEffect(() => {
    if (open) {
      setPicked(folders.length ? undefined : 'new')
      setName('')
    }
  }, [open, folders.length])

  const choice: FolderChoice | undefined =
    picked === 'new' ? (name.trim() ? { newName: name.trim() } : undefined) : picked === 'out' ? { out: true } : picked ? { folderId: picked } : undefined

  return (
    <Sheet open={open} title="폴더로 옮기기" confirmLabel="옮기기" confirmDisabled={!choice} onConfirm={() => choice && onPick(choice)} onClose={onClose}>
      <div className={styles.list} role="radiogroup" aria-label="폴더">
        {folders
          .filter((f) => f.id !== currentFolderId)
          .map((f) => (
            <button key={f.id} type="button" role="radio" aria-checked={picked === f.id} className={styles.option} onClick={() => setPicked(f.id)}>
              <Icon name="folder" size={20} />
              <span className={styles.name}>{f.name}</span>
              {picked === f.id && <Icon name="check" size={20} />}
            </button>
          ))}
        {currentFolderId && (
          <button type="button" role="radio" aria-checked={picked === 'out'} className={styles.option} onClick={() => setPicked('out')}>
            <Icon name="back" size={20} />
            <span className={styles.name}>폴더에서 빼기</span>
            {picked === 'out' && <Icon name="check" size={20} />}
          </button>
        )}
        <button type="button" role="radio" aria-checked={picked === 'new'} className={styles.option} onClick={() => setPicked('new')}>
          <Icon name="add" size={20} />
          <span className={styles.name}>새 폴더</span>
          {picked === 'new' && <Icon name="check" size={20} />}
        </button>
      </div>
      {picked === 'new' && <TextField id="folder-name" autoFocus placeholder="폴더 이름 — 여름 여행, 좋아하는 조각" value={name} onChange={(e) => setName(e.target.value)} />}
    </Sheet>
  )
}
