import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

const backend = fileURLToPath(new URL('./src/data/backend.ts', import.meta.url))
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
        build: { outDir: 'dist-preview', rollupOptions: { input: 'preview.html' } },
      }
    : { plugins: [react()] },
)
