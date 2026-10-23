// Wikidata SPARQL 클라이언트 (수집 스크립트 공용). 이 컨테이너가 아니라 GitHub Actions에서 돈다.
// QLever(시간 제한 600초, 큰 결과에 강함)를 먼저 쓰고, 안 되면 Wikidata Query Service(60초)로.
// WDQS는 큰 질의에서 504로 끊긴다 (2026-10-23 probe: 전체 개수 세기도 시간 초과). 예비로만 둔다
const ENDPOINTS = [
  { name: 'qlever', url: 'https://qlever.cs.uni-freiburg.de/api/wikidata' },
  { name: 'wdqs', url: 'https://query.wikidata.org/sparql' },
]
const UA = 'AthenaArchive/0.1 (https://github.com/pelixer/Athena; art archive build)'

export const PREFIXES = `PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX ps: <http://www.wikidata.org/prop/statement/>
PREFIX psv: <http://www.wikidata.org/prop/statement/value/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX schema: <http://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
`

/** TSV 응답 한 줄의 값: <http://www.wikidata.org/entity/Q1> → Q1, "x"@ko → x, "1889-01-01T00:00:00Z"^^xsd:dateTime → 그 글자 */
export function cell(v) {
  if (v === undefined || v === '') return ''
  const iri = v.match(/^<http:\/\/www\.wikidata\.org\/entity\/(.+)>$/)
  if (iri) return iri[1]
  if (v.startsWith('<') && v.endsWith('>')) return v.slice(1, -1)
  const lit = v.match(/^"([\s\S]*)"(?:@[\w-]+|\^\^\S+)?$/)
  if (lit) return lit[1].replace(/\\t/g, ' ').replace(/\\n/g, ' ').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  return v
}

export function parseTsv(text) {
  const lines = text.split('\n').filter(Boolean)
  const head = (lines.shift() ?? '').split('\t').map((h) => h.replace(/^\?/, ''))
  return lines.map((l) => {
    const cols = l.split('\t')
    return Object.fromEntries(head.map((h, i) => [h, cell(cols[i])]))
  })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** 질의 → 행 배열. endpoint를 고르면 그것만 쓴다 */
export async function query(sparql, { only, tries = 3, timeoutMs = 900_000 } = {}) {
  const body = PREFIXES + sparql
  let last
  for (const ep of ENDPOINTS.filter((e) => !only || e.name === only)) {
    for (let i = 0; i < tries; i++) {
      const started = Date.now()
      try {
        const res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'text/tab-separated-values', 'User-Agent': UA },
          body: new URLSearchParams({ query: body }),
          signal: AbortSignal.timeout(timeoutMs),
        })
        const text = await res.text()
        if (!res.ok) throw new Error(`${ep.name} HTTP ${res.status}: ${text.slice(0, 300)}`)
        const rows = parseTsv(text)
        console.error(`  ${ep.name} ${rows.length} rows in ${((Date.now() - started) / 1000).toFixed(1)}s`)
        return rows
      } catch (e) {
        last = e
        console.error(`  ${ep.name} try ${i + 1} failed: ${String(e.message).slice(0, 300)}`)
        await sleep(5000 * (i + 1))
      }
    }
  }
  throw last
}
