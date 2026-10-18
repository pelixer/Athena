import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db } from '../data/db'
import { useLive } from '../data/hooks'
import { createVisit } from '../data/repo'
import type { Folder } from '../domain/types'
import { Screen } from '../components/Screen'
import { IconButton } from '../components/IconButton'
import { Icon } from '../components/Icon'
import { NewCollectionSheet } from '../components/NewCollectionSheet'
import { formatCount, formatDateWeekday } from '../lib/format'
import { CollectionList, useCollections } from './CollectionList'
import styles from './HomePage.module.css'

/**
 * 홈 — 나만의 미감 저장소. 컬렉션 목록(고정 → 모으는 중 → 최근) + 폴더 + 새 컬렉션.
 * 컬렉션 줄을 왼쪽으로 밀면 지우기·폴더로, 오른쪽으로 밀면 고정 (CollectionList).
 * 단계 2. 첫 실행 화면은 단계 3으로 디자인 대기.
 */
export function HomePage() {
  const navigate = useNavigate()
  const [starting, setStarting] = useState(false)
  const close = useCallback(() => setStarting(false), [])
  const rows = useCollections(undefined)
  const folders = useLive(async () => {
    const all = await db.folders.orderBy('createdAt').toArray()
    const visits = await db.visits.toArray()
    return all.map((f) => ({ ...f, count: visits.filter((v) => v.folderId === f.id).length }))
  }, [])

  async function start(title: string, venue?: string) {
    const visit = await createVisit({ title, venue })
    navigate(`/visit/${visit.id}`)
  }

  return (
    <Screen bottom={<IconButton icon="add" surface="accent" size={54} aria-label="새 컬렉션" onClick={() => setStarting(true)} />}>
      <main className={styles.page}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>{formatDateWeekday(Date.now())}</span>
          <h1 className={styles.wordmark}>Athena</h1>
          <span className={styles.tagline}>나만의 미감 저장소</span>
        </header>

        {((rows && rows.length > 0) || (folders && folders.length > 0)) && (
          <section className={styles.list}>
            <span className={styles.label}>컬렉션</span>
            {folders?.map((f) => <FolderRow key={f.id} folder={f} />)}
            {rows && <CollectionList rows={rows} folders={folders ?? []} />}
          </section>
        )}
      </main>

      <NewCollectionSheet open={starting} onClose={close} onStart={start} />
    </Screen>
  )
}

function FolderRow({ folder }: { folder: Folder & { count: number } }) {
  return (
    <Link to={`/folder/${folder.id}`} className={styles.folderRow}>
      <span className={styles.folderIcon}>
        <Icon name="folder" size={24} />
      </span>
      <span className={styles.folderText}>
        <span className={styles.folderName}>{folder.name}</span>
        <span className={styles.meta}>폴더 · 컬렉션 {formatCount(folder.count)}</span>
      </span>
    </Link>
  )
}
