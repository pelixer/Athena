import { useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../data/db'
import { useLive, usePhotoUrl } from '../data/hooks'
import { createFolder, deleteVisit, moveToFolder, setPinned } from '../data/repo'
import { orderCollections } from '../domain/collections'
import type { Folder, ID, Visit } from '../domain/types'
import { formatCount, formatDateWeekday } from '../lib/format'
import { SwipeRow } from '../components/SwipeRow'
import { Sheet } from '../components/Sheet'
import { FolderPickSheet, type FolderChoice } from '../components/FolderPickSheet'
import { Icon } from '../components/Icon'
import styles from './CollectionList.module.css'

export type CollectionRow = Visit & { count: number; coverPhotoId?: ID }

/** 컬렉션들과 각각의 오브제 수·표지 사진 (폴더 하나, 또는 폴더 밖 전부) */
export function useCollections(folderId: ID | undefined): CollectionRow[] | undefined {
  return useLive(async () => {
    const all = await db.visits.toArray()
    const here = all.filter((v) => (folderId ? v.folderId === folderId : !v.folderId))
    const rows = await Promise.all(
      here.map(async (v) => {
        const objes = await db.objes.where('visitId').equals(v.id).sortBy('takenAt')
        return { ...v, count: objes.length, coverPhotoId: objes[0]?.photoId }
      }),
    )
    return orderCollections(rows)
  }, [folderId])
}

/**
 * 컬렉션 목록 (홈·폴더 공용). 줄을 왼쪽으로 밀면 지우기·폴더로, 오른쪽으로 밀면 고정.
 */
export function CollectionList({ rows, folders, folderId }: { rows: CollectionRow[]; folders: Folder[]; folderId?: ID }) {
  const [deleting, setDeleting] = useState<CollectionRow>()
  const [moving, setMoving] = useState<CollectionRow>()

  async function move(choice: FolderChoice) {
    if (!moving) return
    const target = 'folderId' in choice ? choice.folderId : 'newName' in choice ? (await createFolder(choice.newName)).id : undefined
    await moveToFolder(moving.id, target)
    setMoving(undefined)
  }

  return (
    <>
      {rows.map((v) => (
        <SwipeRow
          key={v.id}
          start={[{ icon: 'pin', label: v.pinnedAt ? '고정 풀기' : '맨 위에 고정', accent: true, onAction: () => setPinned(v.id, !v.pinnedAt) }]}
          end={[
            { icon: 'folder', label: '폴더로 옮기기', onAction: () => setMoving(v) },
            { icon: 'delete', label: '컬렉션 지우기', onAction: () => setDeleting(v) },
          ]}
        >
          <CollectionRowLink row={v} />
        </SwipeRow>
      ))}

      <Sheet
        open={!!deleting}
        title="컬렉션을 지울까요?"
        confirmLabel="지우기"
        onClose={() => setDeleting(undefined)}
        onConfirm={async () => {
          if (deleting) await deleteVisit(deleting.id)
          setDeleting(undefined)
        }}
      >
        <p className={styles.note}>〈{deleting?.title}〉의 오브제 {deleting?.count}개와 사진·캡션·나의 노트가 함께 지워져요. 되돌릴 수 없어요.</p>
      </Sheet>
      <FolderPickSheet open={!!moving} folders={folders} currentFolderId={folderId} onPick={move} onClose={() => setMoving(undefined)} />
    </>
  )
}

function CollectionRowLink({ row }: { row: CollectionRow }) {
  const cover = usePhotoUrl(row.coverPhotoId)
  return (
    <Link to={`/visit/${row.id}`} className={styles.row} draggable={false}>
      <span className={styles.thumb} style={cover ? { backgroundImage: `url(${cover})` } : undefined} />
      <span className={styles.text}>
        <span className={styles.meta}>
          {row.pinnedAt && (
            <span className={styles.pin} aria-label="고정됨">
              <Icon name="pin" size={14} />
            </span>
          )}
          {!row.endedAt && (
            <>
              <span className={styles.dot} />
              모으는 중 ·{' '}
            </>
          )}
          {formatDateWeekday(row.startedAt)}
          {row.venue && ` · ${row.venue}`}
        </span>
        <span className={styles.title}>{row.title}</span>
        <span className={styles.meta}>오브제 {formatCount(row.count)}</span>
      </span>
    </Link>
  )
}
