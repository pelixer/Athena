import { sequenceOf } from './sequence'
import type { ID, Obje } from './types'

/** 템플릿에 처음 들어왔을 때 고른 상태: 모든 오브제(순번 순), 표지는 나의 노트가 있는 첫 오브제 */
export function defaultTemplateSelection(objes: Obje[]): { objeIds: ID[]; coverId?: ID } {
  const index = sequenceOf(objes)
  const ordered = [...objes].sort((a, b) => index.get(a.id)! - index.get(b.id)!)
  const cover = ordered.find((o) => o.note?.trim()) ?? ordered[0]
  return { objeIds: ordered.map((o) => o.id), coverId: cover?.id }
}

/** 고른 오브제를 순번 순으로 */
export function selectedInOrder(objes: Obje[], objeIds: ID[]): Obje[] {
  const index = sequenceOf(objes)
  const chosen = new Set(objeIds)
  return objes.filter((o) => chosen.has(o.id)).sort((a, b) => index.get(a.id)! - index.get(b.id)!)
}
