// 브라우저 OCR 파일을 public/ocr로 모은다. 앱이 CDN 없이, 오프라인에서도 글자를 읽게 하려는 것.
// npm run dev / build 전에 자동으로 실행된다 (package.json의 predev, prebuild).
//
// 주 엔진: PaddleOCR PP-OCRv5 (글줄 검출 + 한국어·영어 인식). ONNX Runtime Web(wasm)으로 직접 돌린다 (src/lib/ocr.worker.ts).
//   모델은 npm에 없어 GitHub 릴리스에서 받아 .cache/ocr-models에 두고, 해시를 확인한다.
// 예비 엔진: Tesseract (한국어+영어). PaddleOCR를 못 불러올 때만 쓴다.
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'

const out = 'public/ocr'
const cache = '.cache/ocr-models'
mkdirSync(`${out}/lang`, { recursive: true })
mkdirSync(`${out}/ort`, { recursive: true })
mkdirSync(`${out}/models`, { recursive: true })
mkdirSync(cache, { recursive: true })

// ── PaddleOCR 모델 ─────────────────────────────────────────────
const RELEASE = 'https://github.com/GreatV/oar-ocr/releases/download/v0.3.0'
const MODELS = {
  'det.onnx': { url: `${RELEASE}/pp-ocrv5_mobile_det.onnx`, sha256: '1eb7b4f7ab657ebd1c66d5f79bca7497f29768a2e3c15e52daecbba1a8e4a039' },
  'rec.onnx': { url: `${RELEASE}/korean_pp-ocrv5_mobile_rec.onnx`, sha256: '2d7ed96308065a86103325d22af07a88c4d06afc009f21602a4882342c0cc054' },
  'dict.txt': { url: `${RELEASE}/ppocrv5_korean_dict.txt`, sha256: 'a88071c68c01707489baa79ebe0405b7beb5cca229f4fc94cc3ef992328802d7' },
}

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex')

async function fetchModel(name, { url, sha256: want }) {
  const path = `${cache}/${name}`
  if (existsSync(path) && sha256(readFileSync(path)) === want) return
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (sha256(buf) !== want) throw new Error('해시가 다릅니다')
      writeFileSync(path, buf)
      return
    } catch (e) {
      if (attempt >= 4) throw new Error(`OCR 모델을 받지 못했습니다: ${url} (${e.message})`)
      await new Promise((r) => setTimeout(r, 2000 * 2 ** (attempt - 1)))
    }
  }
}

await Promise.all(Object.entries(MODELS).map(([n, m]) => fetchModel(n, m)))
for (const name of Object.keys(MODELS)) copyFileSync(`${cache}/${name}`, `${out}/models/${name}`)

// ── ONNX Runtime Web (wasm, WebGPU 없는 기본판 — 14MB. jsep판은 28MB라 Cloudflare 파일 한도 25MB를 넘는다) ──
for (const f of ['ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.wasm']) {
  copyFileSync(`node_modules/onnxruntime-web/dist/${f}`, `${out}/ort/${f}`)
}

// ── 예비: Tesseract ─────────────────────────────────────────────
copyFileSync('node_modules/tesseract.js/dist/worker.min.js', `${out}/worker.min.js`)
// LSTM 엔진만 쓴다 (oem 1). 브라우저가 지원하는 SIMD 종류에 따라 tesseract.js가 하나를 고른다.
for (const f of readdirSync('node_modules/tesseract.js-core')) {
  if (f.endsWith('lstm.wasm.js')) copyFileSync(`node_modules/tesseract.js-core/${f}`, `${out}/${f}`)
}
// 정밀(best_int) 모델 — 한국어 1.5MB, 영어 가벼움
copyFileSync('node_modules/@tesseract.js-data/kor/4.0.0_best_int/kor.traineddata.gz', `${out}/lang/kor.traineddata.gz`)
copyFileSync('node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz', `${out}/lang/eng.traineddata.gz`)
