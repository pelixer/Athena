import Dexie, { type EntityTable } from 'dexie'
import { dexieOptions } from './backend'
import type { Folder, Obje, Photo, Visit } from '../domain/types'

// 로컬 우선: 모든 기록은 브라우저 IndexedDB에 저장된다. (계정/동기화는 추후 결정)
export const db = new Dexie('athena', dexieOptions) as Dexie & {
  visits: EntityTable<Visit, 'id'>
  objes: EntityTable<Obje, 'id'>
  photos: EntityTable<Photo, 'id'>
  folders: EntityTable<Folder, 'id'>
}

db.version(1).stores({
  visits: 'id, startedAt',
  objes: 'id, visitId, takenAt, *tags',
  photos: 'id',
})
// v2: 폴더, 컬렉션의 폴더·고정
db.version(2).stores({
  visits: 'id, startedAt, folderId',
  folders: 'id, createdAt',
})
