import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createVisit, deleteFolder, renameFolder } from '../data/repo'
import { usePhotoUrls } from '../data/hooks'
import { formatCount } from '../lib/format'
import { useToast } from '../lib/toast'
import { Screen } from '../components/Screen'
import { IconButton } from '../components/IconButton'
import { Field, Sheet } from '../components/Sheet'
import { TextField } from '../components/TextField'
import { NewCollectionSheet } from '../components/NewCollectionSheet'
import { DeleteSheet } from '../components/DeleteSheet'
import { MenuList } from '../components/MenuList'
import { SectionHead } from '../components/Stoa'
import { CollectionRows, useLibrary } from './CollectionList'
import styles from './FolderPage.module.css'

type Editing = 'more' | 'rename' | 'delete' | 'new' | undefined

/** 폴더 (A6): 대표 사진 3장 표지 · FOLDER · 이름 · 컬렉션/오브제 수 · I 컬렉션 목록. 이름 바꾸기·지우기는 ⋯ 시트로. 단계 2 */
export function FolderPage() {
  const { folderId = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [editing, setEditing] = useState<Editing>()
  const [name, setName] = useState('')
  const close = useCallback(() => setEditing(undefined), [])
  const library = useLibrary()
  const folder = library?.folders.find((f) => f.id === folderId)
  const covers = usePhotoUrls(folder?.mosaic.slice(0, 3) ?? [])

  if (!library) return null
  if (!folder) return <p className={styles.missing}>폴더를 찾을 수 없어요.</p>
  const rows = library.rows.filter((r) => r.folderId === folder.id)

  return (
    <Screen
      left={<IconButton icon="back" aria-label="뒤로" onClick={() => navigate('/')} />}
      right={<IconButton icon="more" aria-label="더 보기" onClick={() => setEditing('more')} />}
      bottom={<IconButton icon="add" size={54} aria-label="이 폴더에 새 컬렉션" onClick={() => setEditing('new')} />}
    >
      <main className={styles.page}>
        <div className={styles.hero} aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className={styles.heroTile} style={covers[i] ? { backgroundImage: `url(${covers[i]})` } : undefined} />
          ))}
        </div>
        <header className={styles.head}>
          <span className={styles.eyebrow}>FOLDER</span>
          <h1 className={styles.title}>{folder.name}</h1>
          <span className={styles.data}>
            컬렉션 {formatCount(folder.count)} · 오브제 {formatCount(folder.objes)}
          </span>
        </header>
        {rows.length > 0 ? (
          <section className={styles.list}>
            <SectionHead numeral="I" name="컬렉션" count={formatCount(rows.length)} />
            <CollectionRows rows={rows} folders={library.folders} folderId={folder.id} />
          </section>
        ) : (
          <p className={styles.empty}>비어 있어요. 홈에서 컬렉션을 왼쪽으로 밀어 이 폴더로 옮기거나, + 로 새로 시작하세요.</p>
        )}
      </main>

      <Sheet open={editing === 'more'} eyebrow="FOLDER" title={folder.name} onClose={close}>
        <MenuList
          items={[
            {
              icon: 'write',
              label: '이름 바꾸기',
              onSelect: () => {
                setName(folder.name)
                setEditing('rename')
              },
            },
            { icon: 'delete', label: '폴더 지우기', onSelect: () => setEditing('delete') },
          ]}
        />
      </Sheet>
      <Sheet open={editing === 'rename'} eyebrow="FOLDER" title="폴더 이름" onClose={close} confirmLabel="저장" confirmDisabled={!name.trim()} onConfirm={async () => (await renameFolder(folder.id, name), close())}>
        <Field label="이름" htmlFor="folder-rename">
          <TextField id="folder-rename" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
      </Sheet>
      <DeleteSheet
        open={editing === 'delete'}
        title="폴더를 지울까요?"
        description={`〈${folder.name}〉 폴더만 지워져요. 안의 컬렉션은 홈으로 옮겨져요.`}
        stats={[
          [folder.count, '컬렉션'],
          [folder.objes, '오브제'],
        ]}
        onClose={close}
        onConfirm={async () => {
          await deleteFolder(folder.id)
          toast({ kind: 'done', text: '폴더를 지웠어요' })
          navigate('/', { replace: true })
        }}
      />
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
