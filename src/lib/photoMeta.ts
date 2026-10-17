import exifr from 'exifr'
import type { GeoPoint } from '../domain/types'

/**
 * 사진의 촬영 시각과 위치.
 * EXIF가 있으면(앨범에서 고른 사진) 그것을, 없으면(뷰파인더로 바로 찍은 사진) 지금 시각과 현재 위치를 쓴다.
 */
export async function readPhotoMeta(file: Blob): Promise<{ takenAt: number; location?: GeoPoint }> {
  const exif = await exifr.parse(file, { pick: ['DateTimeOriginal', 'latitude', 'longitude'], gps: true }).catch(() => undefined)
  const takenAt = exif?.DateTimeOriginal instanceof Date ? exif.DateTimeOriginal.getTime() : Date.now()
  if (typeof exif?.latitude === 'number' && typeof exif?.longitude === 'number') {
    return { takenAt, location: { lat: exif.latitude, lng: exif.longitude } }
  }
  return { takenAt, location: await currentPosition() }
}

export function currentPosition(): Promise<GeoPoint | undefined> {
  if (!('geolocation' in navigator)) return Promise.resolve(undefined)
  return new Promise((resolve) =>
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(undefined),
      { timeout: 5000, maximumAge: 60_000 },
    ),
  )
}
