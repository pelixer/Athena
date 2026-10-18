import type { Worker } from 'tesseract.js'

/**
 * 도슨트 설명문 사진 → 텍스트. 서버 없이 브라우저 안에서 Tesseract(한국어 정밀 모델)로 읽는다.
 * 엔진·모델 파일은 public/ocr에서 받는다 (scripts/copy-ocr-assets.mjs). 처음 한 번 약 5MB를 받고,
 * 이후에는 브라우저에 캐시된다. 정확도는 서버형 OCR보다 낮으니 결과는 오브제 상세에서 고칠 수 있다.
 */

const base = `${import.meta.env.BASE_URL}ocr`
let worker: Promise<Worker> | undefined

function getWorker(): Promise<Worker> {
  worker ??= import('tesseract.js')
    .then(({ createWorker, OEM }) =>
      createWorker('kor', OEM.LSTM_ONLY, {
        workerPath: `${base}/worker.min.js`,
        corePath: base,
        langPath: `${base}/lang`,
        gzip: true,
      }),
    )
    .catch((e) => {
      worker = undefined // 오프라인 등으로 실패하면 다음 촬영 때 다시 시도
      throw e
    })
  return worker
}

/** 도슨트 모드로 바꾸는 순간 미리 불러 둔다 (첫 인식이 빨라진다) */
export function warmUpOcr() {
  getWorker().catch(() => {})
}

export async function extractText(photo: Blob): Promise<string> {
  const ocr = await getWorker()
  const { data } = await ocr.recognize(await downscale(photo, 2000))
  return data.text
}

/** 휴대폰 원본(12MP 이상)은 느리기만 하고 정확도는 비슷하다. 긴 변을 maxSide로 줄인다. */
async function downscale(photo: Blob, maxSide: number): Promise<Blob> {
  const bitmap = await createImageBitmap(photo)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  if (scale === 1) return photo
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? photo), 'image/jpeg', 0.92))
}
