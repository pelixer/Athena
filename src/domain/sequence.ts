import type { ID, Obje } from './types'

/**
 * 관람 내 순번 ("그 관람 동안 몇 번째로 찍은 사진인지").
 * 저장하지 않고 촬영 시각 순서에서 매번 계산한다 — 사진을 나중에 순서 없이 올려도 맞게 나온다.
 */
export function sequenceOf(objes: Obje[]): Map<ID, number> {
  const ordered = [...objes].sort((a, b) => a.takenAt - b.takenAt || a.createdAt - b.createdAt)
  return new Map(ordered.map((o, i) => [o.id, i + 1]))
}
