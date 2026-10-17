// dist-preview/preview.html → dist-preview/athena-components.html
// Artifact 게시용: 게시 시 문서 골격(doctype/html/head/body)이 씌워지므로 내용만 남긴다.
import { readFileSync, writeFileSync } from 'node:fs'

const html = readFileSync('dist-preview/preview.html', 'utf8')
const content = html
  .replace(/<!doctype html>/i, '')
  .replace(/<\/?(html|head|body)[^>]*>/gi, '')
  .replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>/gi, '')
  .trim()
writeFileSync('dist-preview/athena-components.html', content + '\n')
