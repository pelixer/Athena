import { useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../data/db'
import { useLive, usePhotoUrl, usePhotoUrls } from '../data/hooks'
import { createFolder, deleteFolder, deleteVisit, moveToFolder, restoreVisit, setPinned } from '../data/repo'
import { orderCollections, type CollectionSort } from '../domain/collections'
import type { Folder, ID, Visit } from '../domain/types'
import { formatCount, formatDate } from '../lib/format'
import { useToast } from '../lib/toast'
import { SwipeRow } from '../components/SwipeRow'
import { FolderPickSheet, type FolderChoice, type FolderOption } from '../components/FolderPickSheet'
import { DeleteSheet } from '../components/DeleteSheet'
import { CoverFrame, RowStatus } from '../components/Stoa'
import styles from './CollectionList.module.css'

export type CollectionRow = Visit & { count: number; captions: number; notes: number; coverPhotoId?: ID }
export type FolderRow = Folder & { count: number; objes: number; mosaic: ID[] }

/** 컬렉션(오브제·캡션·노트 수, 표지)과 폴더(컬렉션 수, 모자이크용 표지 4장)를 한 번에 */
export function useLibrary(sort: CollectionSort = 'recent') {
  return useLive(async () => {
    const [visits, objes, folders] = await Promise.all([db.visits.toArray(), db.objes.toArray(), db.folders.orderBy('createdAt').toArray()])
    const rows: CollectionRow[] = visits.map((v) => {
      const mine = objes.filter((o) => o.visitId === v.id).sort((a, b) => a.takenAt - b.takenAt)
      return {
        ...v,
        count: mine.length,
        captions: mine.filter((o) => o.docent).length,
        notes: mine.filter((o) => o.note?.trim()).length,
        coverPhotoId: mine[0]?.photoId,
      }
    })
    const folderRows: FolderRow[] = folders.map((f) => {
      const inside = orderCollections(
        rows.filter((r) => r.folderId === f.id),
        'recent',
      )
      return { ...f, count: inside.length, objes: inside.reduce((n, r) => n + r.count, 0), mosaic: inside.flatMap((r) => (r.coverPhotoId ? [r.coverPhotoId] : [])).slice(0, 4) }
    })
    return { rows: orderCollections(rows, sort), folders: folderRows }
  }, [sort])
}

/**
 * 컬렉션 줄들 (홈·폴더 공용, A2–A4). 왼쪽으로 밀면 폴더로·지우기, 오른쪽으로 밀면 고정.
 * 지우면 숫자로 확인(B5)하고, 지운 뒤 4초 동안 "되돌리기".
 */
export function CollectionRows({ rows, folders, folderId }: { rows: CollectionRow[]; folders: FolderRow[]; folderId?: ID }) {
  const [deleting, setDeleting] = useState<CollectionRow>()
  const [moving, setMoving] = useState<CollectionRow>()
  const toast = useToast()

  async function move(choice: FolderChoice) {
    if (!moving) return
    const target = 'folderId' in choice ? choice.folderId : 'newName' in choice ? (await createFolder(choice.newName)).id : undefined
    await moveToFolder(moving.id, target)
    setMoving(undefined)
    toast({ kind: 'done', text: target ? '폴더로 옮겼어요' : '폴더에서 뺐어요' })
  }

  async function remove() {
    if (!deleting) return
    const gone = await deleteVisit(deleting.id)
    setDeleting(undefined)
    if (gone) toast({ kind: 'done', text: '컬렉션을 지웠어요', action: { label: '되돌리기', onAction: () => restoreVisit(gone) } })
  }

  return (
    <>
      {rows.map((v) => (
        <SwipeRow
          key={v.id}
          start={[{ icon: 'pin', label: v.pinnedAt ? '고정 풀기' : '맨 위에 고정', onAction: () => setPinned(v.id, !v.pinnedAt) }]}
          end={[
            { icon: 'folder', label: '폴더로 옮기기', onAction: () => setMoving(v) },
            { icon: 'delete', label: '컬렉션 지우기', onAction: () => setDeleting(v) },
          ]}
        >
          <CollectionRowLink row={v} />
        </SwipeRow>
      ))}

      <DeleteSheet
        open={!!deleting}
        title="컬렉션을 지울까요?"
        description={deleting && `〈${deleting.title}〉과 안의 모든 것이 지워져요. 되돌릴 수 없어요.`}
        stats={deleting ? [[deleting.count, '오브제'], [deleting.captions, '캡션'], [deleting.notes, '나의 노트']] : []}
        onConfirm={remove}
        onClose={() => setDeleting(undefined)}
      />
      <FolderPickSheet open={!!moving} subject={moving?.title} folders={folders.map(toOption)} currentFolderId={folderId} onPick={move} onClose={() => setMoving(undefined)} />
    </>
  )
}

/** 폴더 줄들 (A2): 2×2 모자이크 액자 + 폴더 표식. 왼쪽으로 밀면 지우기(안의 컬렉션은 홈으로) */
export function FolderRows({ folders }: { folders: FolderRow[] }) {
  const [deleting, setDeleting] = useState<FolderRow>()
  const toast = useToast()
  return (
    <>
      {folders.map((f) => (
        <SwipeRow key={f.id} end={[{ icon: 'delete', label: '폴더 지우기', onAction: () => setDeleting(f) }]}>
          <FolderRowLink folder={f} />
        </SwipeRow>
      ))}
      <DeleteSheet
        open={!!deleting}
        title="폴더를 지울까요?"
        description={deleting && `〈${deleting.name}〉 폴더만 지워져요. 안의 컬렉션은 홈으로 옮겨져요.`}
        stats={deleting ? [[deleting.count, '컬렉션'], [deleting.objes, '오브제']] : []}
        onConfirm={async () => {
          if (deleting) await deleteFolder(deleting.id)
          setDeleting(undefined)
          toast({ kind: 'done', text: '폴더를 지웠어요' })
        }}
        onClose={() => setDeleting(undefined)}
      />
    </>
  )
}

export function toOption(f: FolderRow): FolderOption {
  return { id: f.id, name: f.name, count: f.count, mosaic: f.mosaic }
}

function CollectionRowLink({ row }: { row: CollectionRow }) {
  const cover = usePhotoUrl(row.coverPhotoId)
  return (
    <Link to={`/visit/${row.id}`} className={styles.row} draggable={false}>
      <CoverFrame src={row.coverPhotoId ? cover : undefined} />
      <span className={styles.text}>
        <span className={styles.meta}>
          <RowStatus pinned={!!row.pinnedAt} collecting={!row.endedAt} />
          {(row.pinnedAt || !row.endedAt) && <span className={styles.bar}>|</span>}
          <span className={styles.data}>{formatDate(row.startedAt)}</span>
        </span>
        <span className={styles.title}>{row.title}</span>
        <span className={styles.sub}>
          오브제 {formatCount(row.count)}
          {row.venue && ` · ${row.venue}`}
        </span>
      </span>
    </Link>
  )
}

function FolderRowLink({ folder }: { folder: FolderRow }) {
  const urls = usePhotoUrls(folder.mosaic)
  return (
    <Link to={`/folder/${folder.id}`} className={styles.row} draggable={false}>
      <CoverFrame mosaic={urls} folder />
      <span className={styles.text}>
        <span className={styles.meta}>
          <span className={styles.data}>폴더</span>
        </span>
        <span className={styles.title}>{folder.name}</span>
        <span className={styles.sub}>컬렉션 {formatCount(folder.count)}</span>
      </span>
    </Link>
  )
}
