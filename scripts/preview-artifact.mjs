// dist-preview/preview.html → dist-preview/athena-gallery.html
// Artifact 게시용: 게시할 때 문서 골격(doctype/html/head/body)이 씌워지므로 head와 body의 내용만 남긴다.
import { readFileSync, writeFileSync } from 'node:fs'

const html = readFileSync('dist-preview/preview.html', 'utf8')
const headStart = html.indexOf('<head>') + '<head>'.length
const headEnd = html.indexOf('</head>')
const bodyStart = html.indexOf('<body>', headEnd) + '<body>'.length
const bodyEnd = html.lastIndexOf('</body>')
const head = html
  .slice(headStart, headEnd)
  .replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>/gi, '')
  .trim()
writeFileSync('dist-preview/athena-gallery.html', `${head}\n${html.slice(bodyStart, bodyEnd).trim()}\n`)
