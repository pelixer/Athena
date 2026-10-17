import type { GeoPoint } from '../domain/types'

const pad = (n: number) => String(n).padStart(2, '0')
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

/** 2026.10.17 */
export const formatDate = (t: number) => {
  const d = new Date(t)
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

/** 2026.10.17 토 */
export const formatDateWeekday = (t: number) => `${formatDate(t)} ${WEEKDAYS[new Date(t).getDay()]}`

/** 14:32 */
export const formatTime = (t: number) => {
  const d = new Date(t)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 14:32:18 */
export const formatTimeSeconds = (t: number) => `${formatTime(t)}:${pad(new Date(t).getSeconds())}`

/** 순번: 7 → "No.07" */
export const formatIndex = (n: number) => `No.${pad(n)}`

/** 숫자 칸: 5 → "05" */
export const formatCount = (n: number) => pad(n)

/** 37.5788°N 126.9800°E */
export const formatGeo = ({ lat, lng }: GeoPoint) =>
  `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`

/** 2h 15m */
export const formatDuration = (ms: number) => {
  const m = Math.round(ms / 60000)
  return m >= 60 ? `${Math.floor(m / 60)}h ${pad(m % 60)}m` : `${m}m`
}
