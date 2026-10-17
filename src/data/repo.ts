import { db } from './db'
import type { Docent, GeoPoint, ID, Obje, Visit, VisitKind } from '../domain/types'

const newId = () => crypto.randomUUID()

export async function createVisit(input: { title: string; kind: VisitKind; venue?: string }): Promise<Visit> {
  const visit: Visit = { id: newId(), startedAt: Date.now(), ...input }
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
  tags: string[]
  note?: string
  docent?: { photo?: Blob; text: string }
}): Promise<Obje> {
  const photoId = newId()
  const docentPhotoId = input.docent?.photo ? newId() : undefined
  const docent: Docent | undefined = input.docent && { photoId: docentPhotoId, text: input.docent.text }
  const obje: Obje = {
    id: newId(),
    visitId: input.visitId,
    photoId,
    takenAt: input.takenAt,
    location: input.location,
    tags: input.tags,
    note: input.note,
    docent,
    createdAt: Date.now(),
  }
  await db.transaction('rw', db.objes, db.photos, async () => {
    await db.photos.add({ id: photoId, blob: input.photo })
    if (docentPhotoId && input.docent?.photo) await db.photos.add({ id: docentPhotoId, blob: input.docent.photo })
    await db.objes.add(obje)
  })
  return obje
}

export async function updateObje(id: ID, changes: Partial<Pick<Obje, 'tags' | 'note' | 'docent'>>): Promise<void> {
  await db.objes.update(id, changes)
}
