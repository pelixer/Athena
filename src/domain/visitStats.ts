import type { Obje } from './types'

/** 관람 보기 상단의 숫자: 오브제 · 캡션 · 나의 노트 */
export function visitStats(objes: Obje[]) {
  return {
    objes: objes.length,
    docents: objes.filter((o) => o.docent).length,
    notes: objes.filter((o) => o.note?.trim()).length,
  }
}

/** 관람 시간: 첫 촬영 ~ 마지막 촬영 (관람 종료가 기록되어 있으면 그 시각까지) */
export function visitSpan(objes: Obje[], endedAt?: number): { start: number; end: number } | undefined {
  if (objes.length === 0) return undefined
  const times = objes.map((o) => o.takenAt)
  return { start: Math.min(...times), end: Math.max(endedAt ?? 0, ...times) }
}

/** 오브제에 무엇이 붙어 있는지: "캡션 · 노트" / "캡션" / "노트" / "—" */
export function attachmentLabel(obje: Pick<Obje, 'docent' | 'note'>): string {
  const parts = [obje.docent && '캡션', obje.note?.trim() && '노트'].filter(Boolean)
  return parts.length ? parts.join(' · ') : '—'
}
