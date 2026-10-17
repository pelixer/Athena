import { db } from './db'
import { toDocent, workTitle } from '../domain/docent'
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

/** 도슨트 사진 + 추출 텍스트를 오브제에 붙인다. 오브제 제목이 비어 있으면 작품명으로 채운다. */
export async function attachDocent(objeId: ID, photo: Blob, rawText: string): Promise<void> {
  const photoId = newId()
  const docent = toDocent(rawText, photoId)
  await db.transaction('rw', db.objes, db.photos, async () => {
    const obje = await db.objes.get(objeId)
    if (!obje) throw new Error(`obje ${objeId} not found`)
    await db.photos.add({ id: photoId, blob: photo })
    await db.objes.update(objeId, { docent, title: obje.title ?? workTitle(docent) })
  })
}

/** 관람에서 가장 최근에 찍은 오브제 — 도슨트를 붙일 대상 */
export async function latestObje(visitId: ID): Promise<Obje | undefined> {
  const objes = await db.objes.where('visitId').equals(visitId).sortBy('takenAt')
  return objes.at(-1)
}

export async function updateObje(id: ID, changes: Partial<Pick<Obje, 'title' | 'place' | 'tags' | 'docent'>>): Promise<void> {
  await db.objes.update(id, changes)
}

export async function updateNote(id: ID, note: string): Promise<void> {
  await db.objes.update(id, { note: note.trim() || undefined, noteUpdatedAt: Date.now() })
}
