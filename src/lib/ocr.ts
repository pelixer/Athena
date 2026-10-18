import type { Worker as TesseractWorker } from 'tesseract.js'
import { layoutText, type OcrItem } from '../domain/ocrLayout'
import { cleanCaption } from '../domain/captionText'

/**
 * 도슨트 설명문 사진 → 텍스트. 서버 없이 브라우저 안에서 읽는다.
 * 주 엔진은 PaddleOCR PP-OCRv5(글줄 검출 + 한국어·영어 인식, ONNX Runtime wasm) — ocr.worker.ts에서 돈다.
 * 글줄을 먼저 찾으므로 비스듬한 캡션, 여러 장의 카드, 한·영 병기에 강하다.
 * 처음 한 번 약 20MB(압축 전송)를 받고 이후에는 브라우저에 캐시된다. 파일은 public/ocr (scripts/copy-ocr-assets.mjs).
 * PaddleOCR를 못 불러오면(오래된 브라우저 등) Tesseract(한국어+영어)로 읽는다.
 */

const base = `${location.origin}${import.meta.env.BASE_URL}ocr`
let worker: Worker | undefined
let seq = 0
const pending = new Map<number, { resolve: (items: OcrItem[]) => void; reject: (e: Error) => void }>()
let tesseract: Promise<TesseractWorker> | undefined

function paddle(image?: ImageData): Promise<OcrItem[]> {
  if (!worker) {
    worker = new Worker(new URL('./ocr.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = ({ data }: MessageEvent<{ id: number; items?: OcrItem[]; error?: string }>) => {
      const p = pending.get(data.id)
      pending.delete(data.id)
      if (data.error) p?.reject(new Error(data.error))
      else p?.resolve(data.items ?? [])
    }
    worker.onerror = () => {
      for (const p of pending.values()) p.reject(new Error('OCR 워커를 띄우지 못했어요'))
      pending.clear()
      worker?.terminate()
      worker = undefined // 다음 촬영 때 다시 시도
    }
  }
  const id = ++seq
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    worker!.postMessage({ id, base, image }, image ? [image.data.buffer] : [])
  })
}

function getTesseract(): Promise<TesseractWorker> {
  tesseract ??= import('tesseract.js')
    .then(({ createWorker, OEM }) =>
      createWorker(['kor', 'eng'], OEM.LSTM_ONLY, {
        workerPath: `${base}/worker.min.js`,
        corePath: base,
        langPath: `${base}/lang`,
        gzip: true,
        // 워커를 blob: 주소가 아니라 자기 주소에서 띄운다 (CSP worker-src 'self')
        workerBlobURL: false,
      }),
    )
    .catch((e) => {
      tesseract = undefined
      throw e
    })
  return tesseract
}

/** 도슨트 모드로 바꾸는 순간 미리 불러 둔다 (첫 인식이 빨라진다) */
export function warmUpOcr() {
  paddle().catch(() => {})
}

export async function extractText(photo: Blob): Promise<string> {
  const image = await toImageData(photo, 2000)
  let raw: string
  try {
    raw = layoutText(await paddle(new ImageData(new Uint8ClampedArray(image.data), image.width, image.height)))
  } catch (e) {
    console.warn('PaddleOCR를 쓰지 못해 Tesseract로 읽습니다', e)
    const ocr = await getTesseract()
    raw = (await ocr.recognize(toCanvas(image))).data.text
  }
  return cleanCaption(raw)
}

/** 휴대폰 원본(12MP 이상)은 느리기만 하고 정확도는 비슷하다. 긴 변을 maxSide로 줄여 픽셀로 푼다. */
async function toImageData(photo: Blob, maxSide: number): Promise<ImageData> {
  const bitmap = await createImageBitmap(photo)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

function toCanvas(image: ImageData): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  canvas.getContext('2d')!.putImageData(image, 0, 0)
  return canvas
}
