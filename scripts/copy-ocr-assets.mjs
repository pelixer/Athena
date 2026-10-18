// 브라우저 OCR(Tesseract) 파일을 public/ocr로 복사한다. 앱이 CDN 없이, 오프라인에서도 글자를 읽게 하려는 것.
// npm run dev / build 전에 자동으로 실행된다 (package.json의 predev, prebuild).
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs'

const out = 'public/ocr'
mkdirSync(`${out}/lang`, { recursive: true })
copyFileSync('node_modules/tesseract.js/dist/worker.min.js', `${out}/worker.min.js`)
// LSTM 엔진만 쓴다 (oem 1). 브라우저가 지원하는 SIMD 종류에 따라 tesseract.js가 하나를 고른다.
for (const f of readdirSync('node_modules/tesseract.js-core')) {
  if (f.endsWith('lstm.wasm.js')) copyFileSync(`node_modules/tesseract.js-core/${f}`, `${out}/${f}`)
}
// 한국어 정밀(best_int) 모델 — 1.5MB, 기본 모델보다 작고 설명문 인식이 더 정확했다.
copyFileSync('node_modules/@tesseract.js-data/kor/4.0.0_best_int/kor.traineddata.gz', `${out}/lang/kor.traineddata.gz`)
