import { db } from './db'
import { bodyToText, toDocent, workTitle } from '../domain/docent'
import type { Folder, GeoPoint, ID, Obje, Photo, Visit, VisitKind } from '../domain/types'

const newId = () => crypto.randomUUID()

export async function createVisit(input: { title: string; venue?: string; kind?: VisitKind; folderId?: ID }): Promise<Visit> {
  const visit: Visit = { id: newId(), kind: 'exhibition', startedAt: Date.now(), ...input }
  await db.visits.add(visit)
  return visit
}

export async function endVisit(id: ID): Promise<void> {
  await db.visits.update(id, { endedAt: Date.now() })
}

/** 목록 맨 위에 고정 / 해제 */
export async function setPinned(id: ID, pinned: boolean): Promise<void> {
  await db.visits.where('id').equals(id).modify((v) => {
    if (pinned) v.pinnedAt = Date.now()
    else delete v.pinnedAt
  })
}

/** 폴더로 옮긴다. folderId가 없으면 폴더에서 빼서 홈으로. */
export async function moveToFolder(visitId: ID, folderId: ID | undefined): Promise<void> {
  await db.visits.where('id').equals(visitId).modify((v) => {
    if (folderId) v.folderId = folderId
    else delete v.folderId
  })
}

export async function createFolder(name: string): Promise<Folder> {
  const folder: Folder = { id: newId(), name: name.trim(), createdAt: Date.now() }
  await db.folders.add(folder)
  return folder
}

export async function renameFolder(id: ID, name: string): Promise<void> {
  await db.folders.update(id, { name: name.trim() })
}

/** 폴더를 지운다. 안의 컬렉션은 지우지 않고 홈으로 꺼낸다. */
export async function deleteFolder(id: ID): Promise<void> {
  await db.transaction('rw', db.visits, db.folders, async () => {
    await db.visits.where('folderId').equals(id).modify((v) => {
      delete v.folderId
    })
    await db.folders.delete(id)
  })
}

export async function addObje(input: {
  visitId: ID | null
  photo: Blob
  takenAt: number
  location?: GeoPoint
  place?: string
}): Promise<Obje> {
  const { photo, ...fields } = input
  const photoId = newId()
  const obje: Obje = { id: newId(), photoId, tags: [], createdAt: Date.now(), ...fields }
  await db.transaction('rw', db.objes, db.photos, async () => {
    await db.photos.add({ id: photoId, blob: photo })
    await db.objes.add(obje)
  })
  return obje
}

/** 도슨트 사진을 오브제에 붙인다. 글자는 비워 두고, 읽히면 setDocentText로 채운다. */
export async function attachDocent(objeId: ID, photo: Blob): Promise<void> {
  const photoId = newId()
  await db.transaction('rw', db.objes, db.photos, async () => {
    await db.photos.add({ id: photoId, blob: photo })
    await db.objes.update(objeId, { docent: { photoId, text: '', ocr: { state: 'reading', at: Date.now() } } })
  })
}

/** 도슨트 글(OCR 결과 또는 직접 고친 글)을 정리해 저장한다. 오브제 제목이 비어 있으면 작품명으로 채운다. */
export async function setDocentText(objeId: ID, raw: string): Promise<void> {
  await db.transaction('rw', db.objes, async () => {
    const obje = await db.objes.get(objeId)
    if (!obje) return
    const docent = toDocent(raw, obje.docent?.photoId)
    // 글자를 하나도 못 읽었으면 실패로 남겨 원본 사진과 고치기를 권한다 (D3)
    if (!raw.trim()) docent.ocr = { state: 'failed', at: Date.now() }
    await db.objes.update(objeId, { docent, title: obje.title ?? workTitle(docent) })
  })
}

/** 관람을 지운다: 관람, 그 안의 오브제, 오브제·캡션 사진까지 모두. 되돌릴 수 없다. */
export type DeletedVisit = { visit: Visit; objes: Obje[]; photos: Photo[] }

/** 지운 것을 돌려받아 "되돌리기"(4초)에 쓴다 */
export async function deleteVisit(visitId: ID): Promise<DeletedVisit | undefined> {
  return db.transaction('rw', db.visits, db.objes, db.photos, async () => {
    const visit = await db.visits.get(visitId)
    if (!visit) return undefined
    const objes = await db.objes.where('visitId').equals(visitId).toArray()
    const photoIds = objes.flatMap((o) => [o.photoId, o.docent?.photoId]).filter((id): id is ID => !!id)
    const photos = (await db.photos.bulkGet(photoIds)).filter((p): p is Photo => !!p)
    await db.photos.bulkDelete(photoIds)
    await db.objes.bulkDelete(objes.map((o) => o.id))
    await db.visits.delete(visitId)
    return { visit, objes, photos }
  })
}

/** 되돌리기: 지운 컬렉션을 그대로 돌려놓는다 */
export async function restoreVisit(d: DeletedVisit): Promise<void> {
  await db.transaction('rw', db.visits, db.objes, db.photos, async () => {
    await db.photos.bulkPut(d.photos)
    await db.objes.bulkPut(d.objes)
    await db.visits.put(d.visit)
  })
}

/** 마무리를 풀고 다시 모으기 (B4 ⋯ 시트) */
export async function reopenVisit(id: ID): Promise<void> {
  await db.visits.where('id').equals(id).modify((v) => {
    delete v.endedAt
  })
}

export async function updateVisit(id: ID, changes: { title: string; venue?: string }): Promise<void> {
  await db.visits.where('id').equals(id).modify((v) => {
    v.title = changes.title
    if (changes.venue) v.venue = changes.venue
    else delete v.venue
  })
}

/** 관람에서 가장 최근에 추가한 오브제 — 캡션을 붙일 대상.
 *  찍은 시각이 아니라 추가한 순서로 고른다 (사진첩에서 올린 예전 사진도 방금 추가했으면 대상이다). */
export async function latestObje(visitId: ID): Promise<Obje | undefined> {
  const objes = await db.objes.where('visitId').equals(visitId).toArray()
  return latestAdded(objes)
}

export function latestAdded<T extends { createdAt: number }>(objes: T[]): T | undefined {
  return objes.reduce<T | undefined>((a, o) => (!a || o.createdAt >= a.createdAt ? o : a), undefined)
}

export async function updateObje(id: ID, changes: Partial<Pick<Obje, 'title' | 'place' | 'tags' | 'docent'>>): Promise<void> {
  await db.objes.update(id, changes)
}

export async function updateNote(id: ID, note: string): Promise<void> {
  await db.objes.update(id, { note: note.trim() || undefined, noteUpdatedAt: Date.now() })
}

/** 고치기 시트에서 고친 도슨트: 첫 줄(작가 · 〈작품〉 · 연도)과 본문을 따로 받는다 (R10). */
export async function editDocent(objeId: ID, heading: string, body: string): Promise<void> {
  await db.transaction('rw', db.objes, async () => {
    const obje = await db.objes.get(objeId)
    if (!obje) return
    const h = heading.trim().replace(/\s+/g, ' ')
    const docent = { photoId: obje.docent?.photoId, ...(h && { heading: h }), text: bodyToText(body) }
    await db.objes.update(objeId, { docent, title: obje.title ?? workTitle(docent) })
  })
}
