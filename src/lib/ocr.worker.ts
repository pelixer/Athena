/// <reference lib="webworker" />
import * as ort from 'onnxruntime-web'
import { components, corners, ctcDecode, minAreaRect, unclip, type RotRect } from './ocrGeometry'

/**
 * PaddleOCR PP-OCRv5 전용 워커 — 글줄 검출(DB) → 글줄마다 잘라 인식(CTC, 한국어 모델).
 * ONNX Runtime(wasm)으로 모델을 직접 돌린다. 화면이 멈추지 않도록 워커에서.
 * 메인 스레드는 사진을 ImageData로 풀어 넘기고, 글줄 상자와 글자를 돌려받는다.
 */

type Request = { id: number; base: string; image?: ImageData }
type Engine = { det: ort.InferenceSession; rec: ort.InferenceSession; charset: string[] }

const DET_LIMIT = 1280 // 검출 해상도(긴 변). 휴대폰 사진 속 캡션이 작아 기본 960보다 올린다
const DET_THRESH = 0.3
const BOX_THRESH = 0.6
const UNCLIP_RATIO = 1.5
const REC_H = 48
const MEAN = [0.485, 0.456, 0.406]
const STD = [0.229, 0.224, 0.225]

let engine: Promise<Engine> | undefined

function getEngine(base: string): Promise<Engine> {
  engine ??= (async () => {
    ort.env.wasm.wasmPaths = `${base}/ort/`
    ort.env.wasm.numThreads = 1 // 교차 출처 격리 없이 쓰므로 스레드 하나
    const opts: ort.InferenceSession.SessionOptions = { executionProviders: ['wasm'] }
    const [det, rec, dict] = await Promise.all([
      ort.InferenceSession.create(`${base}/models/det.onnx`, opts),
      ort.InferenceSession.create(`${base}/models/rec.onnx`, opts),
      fetch(`${base}/models/dict.txt`).then((r) => r.text()),
    ])
    // 사전 + 띄어쓰기 한 칸 (0번은 CTC 공백)
    const charset = [...dict.split('\n').map((l) => l.replace(/\r$/, '')).filter((c) => c !== ''), ' ']
    return { det, rec, charset }
  })().catch((e) => {
    engine = undefined
    throw e
  })
  return engine
}

self.onmessage = async ({ data }: MessageEvent<Request>) => {
  try {
    const e = await getEngine(data.base)
    if (!data.image) return self.postMessage({ id: data.id, items: [] }) // 미리 불러 두기만
    self.postMessage({ id: data.id, items: await recognize(e, data.image) })
  } catch (err) {
    self.postMessage({ id: data.id, error: err instanceof Error ? err.message : String(err) })
  }
}

async function recognize(e: Engine, image: ImageData) {
  const source = new OffscreenCanvas(image.width, image.height)
  source.getContext('2d')!.putImageData(image, 0, 0)
  const boxes = await detect(e, source)
  const items = []
  for (const box of boxes) {
    const { text, score } = await readLine(e, source, box)
    if (text.trim()) items.push({ poly: corners(box), text, score })
  }
  return items
}

/** 글줄 검출: 32의 배수 크기로 줄여 확률 지도를 얻고, 덩어리마다 회전 사각형 */
async function detect(e: Engine, source: OffscreenCanvas): Promise<RotRect[]> {
  const ratio = Math.min(1, DET_LIMIT / Math.max(source.width, source.height))
  const w = Math.max(32, Math.round((source.width * ratio) / 32) * 32)
  const h = Math.max(32, Math.round((source.height * ratio) / 32) * 32)
  const px = draw(w, h, (ctx) => ctx.drawImage(source, 0, 0, w, h))
  const input = new Float32Array(3 * w * h)
  for (let i = 0; i < w * h; i++) {
    // PaddleOCR는 BGR 순서로 정규화한다
    for (let c = 0; c < 3; c++) input[c * w * h + i] = (px[i * 4 + (2 - c)] / 255 - MEAN[c]) / STD[c]
  }
  const out = await e.det.run({ [e.det.inputNames[0]]: new ort.Tensor('float32', input, [1, 3, h, w]) })
  const prob = out[e.det.outputNames[0]].data as Float32Array
  const sx = source.width / w
  const sy = source.height / h
  const boxes: RotRect[] = []
  for (const comp of components(prob, w, h, DET_THRESH)) {
    if (comp.pixels.length < 6 || comp.score < BOX_THRESH) continue
    const r = minAreaRect(comp.pixels, w)
    if (Math.min(r.w, r.h) < 3) continue
    const u = unclip(r, UNCLIP_RATIO)
    if (Math.min(u.w, u.h) < 5) continue
    boxes.push(scale(u, sx, sy))
  }
  return boxes
}

/** 회전 사각형을 원본 좌표로 (가로세로 비율이 같지 않을 수 있어 꼭짓점 기준으로 다시 잰다) */
function scale(r: RotRect, sx: number, sy: number): RotRect {
  const ux = r.ux * sx
  const uy = r.uy * sy
  const ul = Math.hypot(ux, uy)
  const vx = -r.uy * sx
  const vy = r.ux * sy
  return { cx: r.cx * sx, cy: r.cy * sy, ux: ux / ul, uy: uy / ul, w: r.w * ul, h: r.h * Math.hypot(vx, vy) }
}

/** 글줄 하나를 바로 세워 높이 48로 잘라 읽는다 */
async function readLine(e: Engine, source: OffscreenCanvas, box: RotRect) {
  const outW = Math.max(REC_H, Math.min(3200, Math.ceil((REC_H * box.w) / box.h)))
  const padW = Math.max(320, outW)
  const px = draw(outW, REC_H, (ctx) => {
    const k = REC_H / box.h
    // 사각형의 왼위 꼭짓점을 (0,0), 글줄 방향을 x축으로
    const [x0, y0] = corners(box)[0]
    ctx.setTransform(box.ux * k, -box.uy * k, box.uy * k, box.ux * k, 0, 0)
    ctx.translate(-x0, -y0)
    ctx.drawImage(source, 0, 0)
  })
  const input = new Float32Array(3 * REC_H * padW) // 남는 오른쪽은 0(회색)
  for (let y = 0; y < REC_H; y++) {
    for (let x = 0; x < outW; x++) {
      const i = y * outW + x
      for (let c = 0; c < 3; c++) input[c * REC_H * padW + y * padW + x] = (px[i * 4 + (2 - c)] / 255 - 0.5) / 0.5
    }
  }
  const out = await e.rec.run({ [e.rec.inputNames[0]]: new ort.Tensor('float32', input, [1, 3, REC_H, padW]) })
  const t = out[e.rec.outputNames[0]]
  const [, steps, classes] = t.dims
  return ctcDecode(t.data as Float32Array, steps, classes, e.charset)
}

function draw(w: number, h: number, paint: (ctx: OffscreenCanvasRenderingContext2D) => void) {
  const canvas = new OffscreenCanvas(w, h)
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.imageSmoothingQuality = 'high'
  paint(ctx)
  return ctx.getImageData(0, 0, w, h).data
}
