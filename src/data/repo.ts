import { db } from './db'
import { bodyToText, toDocent, workTitle } from '../domain/docent'
import type { GeoPoint, ID, Obje, Visit, VisitKind } from '../domain/types'

const newId = () => crypto.randomUUID()

export async function createVisit(input: { title: string; venue?: string; kind?: VisitKind }): Promise<Visit> {
  const visit: Visit = { id: newId(), kind: 'exhibition', startedAt: Date.now(), ...input }
  await db.visits.add(visit)
  return visit
}

export async function endVisit(id: ID): Promise<void> {
  await db.visits.update(id, { endedAt: Date.now() })
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
    await db.objes.update(objeId, { docent: { photoId, text: '' } })
  })
}

/** 도슨트 글(OCR 결과 또는 직접 고친 글)을 정리해 저장한다. 오브제 제목이 비어 있으면 작품명으로 채운다. */
export async function setDocentText(objeId: ID, raw: string): Promise<void> {
  await db.transaction('rw', db.objes, async () => {
    const obje = await db.objes.get(objeId)
    if (!obje) return
    const docent = toDocent(raw, obje.docent?.photoId)
    await db.objes.update(objeId, { docent, title: obje.title ?? workTitle(docent) })
  })
}

/** 관람을 지운다: 관람, 그 안의 오브제, 오브제·캡션 사진까지 모두. 되돌릴 수 없다. */
export async function deleteVisit(visitId: ID): Promise<void> {
  await db.transaction('rw', db.visits, db.objes, db.photos, async () => {
    const objes = await db.objes.where('visitId').equals(visitId).toArray()
    const photoIds = objes.flatMap((o) => [o.photoId, o.docent?.photoId]).filter((id): id is ID => !!id)
    await db.photos.bulkDelete(photoIds)
    await db.objes.bulkDelete(objes.map((o) => o.id))
    await db.visits.delete(visitId)
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
