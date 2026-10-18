/**
 * PaddleOCR(DB 검출 + CTC 인식) 후처리 — OpenCV 없이 순수 JS로.
 * OpenCV.js는 내부에서 eval을 써서 CSP(script-src 'self' 'wasm-unsafe-eval')에 막힌다.
 */

export type Pt = [number, number]
/** 회전 사각형: 중심, 긴 변(글줄 방향) 단위벡터, 너비·높이 */
export type RotRect = { cx: number; cy: number; ux: number; uy: number; w: number; h: number }

/** 확률 지도에서 thresh를 넘는 점들의 연결 요소(4방향). 요소마다 점 목록(인덱스)과 평균 확률 */
export function components(prob: Float32Array, width: number, height: number, thresh: number) {
  const label = new Int32Array(width * height)
  const out: { pixels: number[]; score: number }[] = []
  const stack: number[] = []
  for (let start = 0; start < prob.length; start++) {
    if (label[start] || prob[start] <= thresh) continue
    const pixels: number[] = []
    let sum = 0
    label[start] = out.length + 1
    stack.push(start)
    while (stack.length) {
      const i = stack.pop()!
      pixels.push(i)
      sum += prob[i]
      const x = i % width
      const y = (i - x) / width
      const near = [x > 0 ? i - 1 : -1, x < width - 1 ? i + 1 : -1, y > 0 ? i - width : -1, y < height - 1 ? i + width : -1]
      for (const j of near) {
        if (j >= 0 && !label[j] && prob[j] > thresh) {
          label[j] = out.length + 1
          stack.push(j)
        }
      }
    }
    out.push({ pixels, score: sum / pixels.length })
  }
  return out
}

/** 픽셀(칸)들을 감싸는 최소 넓이 회전 사각형 — 볼록 껍질 + 회전 캘리퍼스 */
export function minAreaRect(pixels: number[], width: number): RotRect {
  // 각 픽셀은 한 칸이므로 칸의 네 모서리로 껍질을 만든다
  const pts: Pt[] = []
  for (const i of pixels) {
    const x = i % width
    const y = (i - x) / width
    pts.push([x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1])
  }
  const hull = convexHull(pts)
  let best: RotRect = { cx: 0, cy: 0, ux: 1, uy: 0, w: 0, h: 0 }
  let bestArea = Infinity
  for (let k = 0; k < hull.length; k++) {
    const [ax, ay] = hull[k]
    const [bx, by] = hull[(k + 1) % hull.length]
    const len = Math.hypot(bx - ax, by - ay)
    if (!len) continue
    const ux = (bx - ax) / len
    const uy = (by - ay) / len
    let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity
    for (const [x, y] of hull) {
      const u = x * ux + y * uy
      const v = -x * uy + y * ux
      if (u < minU) minU = u
      if (u > maxU) maxU = u
      if (v < minV) minV = v
      if (v > maxV) maxV = v
    }
    const area = (maxU - minU) * (maxV - minV)
    if (area < bestArea) {
      bestArea = area
      const cu = (minU + maxU) / 2
      const cv = (minV + maxV) / 2
      best = { cx: cu * ux - cv * uy, cy: cu * uy + cv * ux, ux, uy, w: maxU - minU, h: maxV - minV }
    }
  }
  return lineOriented(best)
}

/** 긴 변을 글줄 방향으로, 방향은 오른쪽을 향하게 */
function lineOriented(r: RotRect): RotRect {
  let { ux, uy, w, h } = r
  if (h > w) {
    ;[ux, uy] = [-uy, ux]
    ;[w, h] = [h, w]
  }
  if (ux < 0 || (ux === 0 && uy < 0)) {
    ux = -ux
    uy = -uy
  }
  return { ...r, ux, uy, w, h }
}

function convexHull(points: Pt[]): Pt[] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower: Pt[] = []
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop()
    lower.push(p)
  }
  const upper: Pt[] = []
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop()
    upper.push(p)
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)]
}

/** DB 후처리의 unclip: 넓이×비율/둘레만큼 사방으로 넓힌다 (사각형이면 정확히 이 식) */
export function unclip(r: RotRect, ratio: number): RotRect {
  const d = (r.w * r.h * ratio) / (2 * (r.w + r.h))
  return { ...r, w: r.w + 2 * d, h: r.h + 2 * d }
}

/** 네 꼭짓점: 왼위, 오른위, 오른아래, 왼아래 (글줄 방향 기준) */
export function corners(r: RotRect): Pt[] {
  const { cx, cy, ux, uy } = r
  const hw = r.w / 2
  const hh = r.h / 2
  const vx = -uy
  const vy = ux
  return [
    [cx - ux * hw - vx * hh, cy - uy * hw - vy * hh],
    [cx + ux * hw - vx * hh, cy + uy * hw - vy * hh],
    [cx + ux * hw + vx * hh, cy + uy * hw + vy * hh],
    [cx - ux * hw + vx * hh, cy - uy * hw + vy * hh],
  ]
}

/** CTC 디코딩: 칸마다 가장 높은 글자, 반복과 공백(0번)을 뺀다. 글자 확률의 평균을 점수로 */
export function ctcDecode(logits: Float32Array, steps: number, classes: number, charset: string[]) {
  let text = ''
  let prev = -1
  let sum = 0
  let n = 0
  for (let t = 0; t < steps; t++) {
    let best = 0
    let bestP = -Infinity
    const off = t * classes
    for (let c = 0; c < classes; c++) {
      const p = logits[off + c]
      if (p > bestP) {
        bestP = p
        best = c
      }
    }
    if (best !== 0 && best !== prev) {
      text += charset[best - 1] ?? ''
      sum += bestP
      n++
    }
    prev = best
  }
  return { text, score: n ? sum / n : 0 }
}
