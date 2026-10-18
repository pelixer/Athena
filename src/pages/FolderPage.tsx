import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../data/db'
import { useLive } from '../data/hooks'
import { createVisit, deleteFolder, renameFolder } from '../data/repo'
import { formatCount } from '../lib/format'
import { Screen } from '../components/Screen'
import { IconButton } from '../components/IconButton'
import { Sheet } from '../components/Sheet'
import { TextField } from '../components/TextField'
import { NewCollectionSheet } from '../components/NewCollectionSheet'
import { CollectionList, useCollections } from './CollectionList'
import styles from './HomePage.module.css'

type Editing = 'rename' | 'delete' | 'new' | undefined

/** 폴더 — 홈의 컬렉션 목록과 같은 모양. 이름을 누르면 바꾸고, 휴지통은 폴더만 지운다(안의 컬렉션은 홈으로). 단계 2. */
export function FolderPage() {
  const { folderId = '' } = useParams()
  const navigate = useNavigate()
  const [editing, setEditing] = useState<Editing>()
  const [name, setName] = useState('')
  const close = useCallback(() => setEditing(undefined), [])
  const folder = useLive(() => db.folders.get(folderId), [folderId])
  const folders = useLive(() => db.folders.orderBy('createdAt').toArray(), [])
  const rows = useCollections(folderId)

  if (folder === undefined && !folders) return null
  if (!folder) return <p className={styles.missing}>폴더를 찾을 수 없어요.</p>

  return (
    <Screen
      top={
        <>
          <IconButton icon="back" surface="marble" aria-label="뒤로" onClick={() => navigate('/')} />
          <IconButton icon="delete" surface="marble" aria-label="폴더 지우기" onClick={() => setEditing('delete')} />
        </>
      }
      bottom={<IconButton icon="add" surface="accent" size={54} aria-label="이 폴더에 새 컬렉션" onClick={() => setEditing('new')} />}
    >
      <main className={styles.page}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>폴더 · 컬렉션 {formatCount(rows?.length ?? 0)}</span>
          <button
            type="button"
            className={styles.folderTitle}
            onClick={() => {
              setName(folder.name)
              setEditing('rename')
            }}
          >
            {folder.name}
          </button>
        </header>
        {rows && rows.length > 0 ? (
          <section className={styles.list}>
            <span className={styles.label}>컬렉션</span>
            <CollectionList rows={rows} folders={folders ?? []} folderId={folder.id} />
          </section>
        ) : (
          <p className={styles.empty}>비어 있어요. 홈에서 컬렉션을 왼쪽으로 밀어 이 폴더로 옮기거나, + 로 새로 시작하세요.</p>
        )}
      </main>

      <Sheet open={editing === 'rename'} title="폴더 이름" onClose={close} confirmDisabled={!name.trim()} onConfirm={async () => (await renameFolder(folder.id, name), close())}>
        <TextField id="folder-rename" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
      </Sheet>
      <Sheet
        open={editing === 'delete'}
        title="폴더를 지울까요?"
        confirmLabel="지우기"
        onClose={close}
        onConfirm={async () => {
          await deleteFolder(folder.id)
          navigate('/', { replace: true })
        }}
      >
        <p className={styles.note}>폴더만 지워져요. 안의 컬렉션 {rows?.length ?? 0}개는 홈으로 옮겨져요.</p>
      </Sheet>
      <NewCollectionSheet
        open={editing === 'new'}
        onClose={close}
        onStart={async (title, venue) => {
          const visit = await createVisit({ title, venue, folderId: folder.id })
          navigate(`/visit/${visit.id}`)
        }}
      />
    </Screen>
  )
}
