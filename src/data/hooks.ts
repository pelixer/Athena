import { useEffect, useState } from 'react'
import { liveQuery } from 'dexie'
import { db } from './db'
import type { ID } from '../domain/types'

/** Dexie liveQuery를 React 상태로. DB가 바뀌면 다시 렌더된다. */
export function useLive<T>(query: () => Promise<T>, deps: unknown[]): T | undefined {
  const [value, setValue] = useState<T>()
  useEffect(() => {
    const sub = liveQuery(query).subscribe({ next: setValue, error: console.error })
    return () => sub.unsubscribe()
  }, deps)
  return value
}

/** 저장된 사진 Blob을 object URL로. 언마운트 시 해제한다. */
export function usePhotoUrl(photoId: ID | undefined): string | undefined {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    if (!photoId) return
    let objectUrl: string | undefined
    let cancelled = false
    db.photos.get(photoId).then((photo) => {
      if (cancelled || !photo) return
      objectUrl = URL.createObjectURL(photo.blob)
      setUrl(objectUrl)
    })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [photoId])
  return url
}

/** 여러 사진을 object URL로 (템플릿 썸네일). 순서는 photoIds 그대로. */
export function usePhotoUrls(photoIds: ID[]): (string | undefined)[] {
  const key = photoIds.join(',')
  const [urls, setUrls] = useState<Record<ID, string>>({})
  useEffect(() => {
    let cancelled = false
    const made: string[] = []
    db.photos.bulkGet(photoIds).then((photos) => {
      if (cancelled) return
      const next: Record<ID, string> = {}
      photos.forEach((p) => {
        if (!p) return
        next[p.id] = URL.createObjectURL(p.blob)
        made.push(next[p.id])
      })
      setUrls(next)
    })
    return () => {
      cancelled = true
      made.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [key])
  return photoIds.map((id) => urls[id])
}
