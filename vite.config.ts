import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `--mode preview` builds the component gallery (preview.html) into one
// self-contained HTML file, so it can be published and reviewed by Claude Design.
export default defineConfig(({ mode }) =>
  mode === 'preview'
    ? {
        plugins: [react(), viteSingleFile()],
        build: {
          outDir: 'dist-preview',
          rollupOptions: { input: 'preview.html' },
        },
      }
    : { plugins: [react()] },
)
