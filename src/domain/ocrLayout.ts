/**
 * OCR 글자 상자 → 읽는 순서의 글.
 * PaddleOCR는 글줄마다 상자(네 꼭짓점)와 글자를 준다. 사진이 기울었거나 캡션 카드가 여러 장이면
 * 상자 순서가 뒤섞이므로, 기울기를 펴고 → 가까운 상자끼리 카드로 묶고 → 카드 안에서 줄을 세운다.
 */

export type Point = [number, number]
export type OcrItem = { poly: Point[]; text: string; score: number }

type Box = { text: string; cx: number; cy: number; x0: number; x1: number; y0: number; y1: number; h: number }

const MIN_SCORE = 0.5

export function layoutText(items: OcrItem[]): string {
  const kept = items.filter((i) => i.score >= MIN_SCORE && i.poly.length >= 4 && hasContent(i.text))
  if (!kept.length) return ''
  const angle = dominantAngle(kept)
  const boxes = kept.map((i) => toBox(i, angle))
  const itemOf = new Map(boxes.map((b, k) => [b, kept[k]]))
  return groupBlocks(boxes)
    .map((block) => {
      // 카드마다 기울기가 다를 수 있다 (탁자 위에 흩어진 캡션). 카드 안에서 기울기를 다시 잰다
      const items = block.map((b) => itemOf.get(b)!)
      const own = dominantAngle(items)
      return groupLines(items.map((i) => toBox(i, own)))
        .map((line) => line.map((b) => b.text.trim()).join(' '))
        .join('\n')
    })
    .join('\n\n')
}

/** 한자가 사전에 없으면 "()"처럼 껍데기만 남는다. 글자나 숫자가 하나라도 있어야 쓴다. */
function hasContent(text: string) {
  return /[\p{L}\p{N}]/u.test(text)
}

/** 글줄 윗변 기울기의 중앙값(넓은 상자일수록 믿을 만하다) */
function dominantAngle(items: OcrItem[]): number {
  const angles = items
    .map(({ poly: [a, b] }) => ({ a: Math.atan2(b[1] - a[1], b[0] - a[0]), w: Math.hypot(b[0] - a[0], b[1] - a[1]) }))
    .sort((p, q) => p.a - q.a)
  const total = angles.reduce((s, p) => s + p.w, 0)
  let acc = 0
  for (const p of angles) {
    acc += p.w
    if (acc >= total / 2) return p.a
  }
  return 0
}

function toBox(item: OcrItem, angle: number): Box {
  const cos = Math.cos(-angle)
  const sin = Math.sin(-angle)
  const pts = item.poly.map(([x, y]) => [x * cos - y * sin, x * sin + y * cos] as const)
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const x0 = Math.min(...xs)
  const x1 = Math.max(...xs)
  const y0 = Math.min(...ys)
  const y1 = Math.max(...ys)
  return { text: item.text, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, x0, x1, y0, y1, h: y1 - y0 }
}

/** 가까운 상자끼리 한 덩어리(캡션 카드 한 장)로. 덩어리는 위에서 아래, 왼쪽에서 오른쪽 순서 */
function groupBlocks(boxes: Box[]): Box[][] {
  const parent = boxes.map((_, i) => i)
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])))
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]
      const b = boxes[j]
      const h = Math.max(a.h, b.h)
      const gapX = Math.max(0, Math.max(a.x0, b.x0) - Math.min(a.x1, b.x1))
      const gapY = Math.max(0, Math.max(a.y0, b.y0) - Math.min(a.y1, b.y1))
      if (gapY < h * 1.1 && gapX < h * 1.2) parent[find(i)] = find(j)
    }
  }
  const groups = new Map<number, Box[]>()
  boxes.forEach((b, i) => groups.set(find(i), [...(groups.get(find(i)) ?? []), b]))
  const blocks = [...groups.values()].map((bs) => ({
    bs,
    top: Math.min(...bs.map((b) => b.y0)),
    left: Math.min(...bs.map((b) => b.x0)),
    h: median(bs.map((b) => b.h)),
  }))
  // 같은 높이 줄에 나란한 카드는 왼쪽부터
  blocks.sort((p, q) => (Math.abs(p.top - q.top) < Math.max(p.h, q.h) * 2 ? p.left - q.left : p.top - q.top))
  return blocks.map((b) => b.bs)
}

/** 덩어리 안에서 높이가 겹치고 바짝 붙은 상자를 한 줄로, 줄 안에서는 왼쪽부터.
 *  멀리 떨어진 상자(오른쪽 정렬된 날짜 등)는 같은 높이여도 따로 둔다. */
function groupLines(boxes: Box[]): Box[][] {
  const lines: { cy: number; h: number; x1: number; bs: Box[] }[] = []
  for (const b of [...boxes].sort((p, q) => p.x0 - q.x0)) {
    const line = lines.find((l) => Math.abs(l.cy - b.cy) < Math.min(l.h, b.h) * 0.5 && b.x0 - l.x1 < Math.max(l.h, b.h) * 1.5)
    if (line) {
      line.bs.push(b)
      line.cy = (line.cy * (line.bs.length - 1) + b.cy) / line.bs.length
      line.x1 = Math.max(line.x1, b.x1)
    } else lines.push({ cy: b.cy, h: b.h, x1: b.x1, bs: [b] })
  }
  return lines.sort((p, q) => p.cy - q.cy || p.bs[0].x0 - q.bs[0].x0).map((l) => l.bs)
}

function median(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)] ?? 0
}
