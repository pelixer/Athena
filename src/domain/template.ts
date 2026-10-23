import { sequenceOf } from './sequence'
import type { ID, Obje } from './types'

/**
 * 입장권에 처음 들어왔을 때 고른 상태 (v2.3 E5: 누른 순서대로 놓이고 1번이 표지·노트의 오브제).
 * 나의 노트가 있는 첫 오브제를 1번에, 나머지는 순번 순으로.
 */
export function defaultTemplateSelection(objes: Obje[]): ID[] {
  const index = sequenceOf(objes)
  const ordered = [...objes].sort((a, b) => index.get(a.id)! - index.get(b.id)!)
  const cover = ordered.find((o) => o.note?.trim()) ?? ordered[0]
  return cover ? [cover.id, ...ordered.filter((o) => o !== cover).map((o) => o.id)] : []
}

/** 고른 오브제를 고른 순서 그대로 (없어진 오브제는 뺀다) */
export function selectedInOrder(objes: Obje[], objeIds: ID[]): Obje[] {
  const byId = new Map(objes.map((o) => [o.id, o]))
  return objeIds.flatMap((id) => byId.get(id) ?? [])
}

/** 고르기 시트에서 한 칸을 누름: 고른 것이면 빼고(뒤 번호가 당겨진다), 아니면 맨 뒤에 붙인다 */
export function togglePick(ids: ID[], id: ID): ID[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
}
