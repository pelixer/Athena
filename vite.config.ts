import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

const backend = fileURLToPath(new URL('./src/data/backend.ts', import.meta.url))
const ortWasm = fileURLToPath(new URL('./node_modules/onnxruntime-web/dist/ort.wasm.min.mjs', import.meta.url))
const previewBackend = fileURLToPath(new URL('./src/data/backend.preview.ts', import.meta.url))

// `--mode preview` builds the gallery (preview.html) into one self-contained HTML file
// for design review, with an in-memory IndexedDB so screens render with sample data.
export default defineConfig(({ mode }) =>
  mode === 'preview'
    ? {
        plugins: [
          react(),
          viteSingleFile(),
          {
            name: 'preview-backend',
            enforce: 'pre',
            async resolveId(source, importer, options) {
              const resolved = await this.resolve(source, importer, { ...options, skipSelf: true })
              return resolved?.id === backend ? previewBackend : null
            },
          },
        ],
        // public/(OCR 모델·아트 아카이브 수천 파일)은 갤러리에 필요 없다
        publicDir: false,
        build: { outDir: 'dist-preview', rollupOptions: { input: 'preview.html' } },
      }
    : {
        plugins: [react()],
        resolve: {
          // ONNX Runtime은 wasm 전용 판을 쓰고, wasm 파일은 번들하지 않고 public/ocr/ort에서 받는다
          // (기본 판은 28MB짜리 WebGPU용 wasm을 끌어들여 Cloudflare 파일 한도 25MB를 넘는다)
          alias: [{ find: /^onnxruntime-web$/, replacement: ortWasm }],
        },
        worker: { format: 'es' },
      },
)
