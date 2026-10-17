import type { GeoPoint } from '../domain/types'

export const formatDate = (t: number) =>
  new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(t)

export const formatTime = (t: number) =>
  new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(t)

/** 순번: 7 → "No. 07" */
export const formatSequence = (n: number) => `No. ${String(n).padStart(2, '0')}`

export const formatGeo = (g: GeoPoint) => g.label ?? `${g.lat.toFixed(4)}, ${g.lng.toFixed(4)}`
