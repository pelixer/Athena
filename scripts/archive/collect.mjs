// 아트 아카이브 원자료 수집: Wikidata(CC0)에서 작가가 있는 시각 작품 전부와 그 작가·용어를 TSV로 받는다.
// node scripts/archive/collect.mjs <출력 폴더>   (GitHub Actions archive-data 워크플로에서 실행)
// 질의는 정보 종류마다 따로 보낸다 — 한 질의에 다 묶으면 값 조합이 곱으로 불어난다.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { query } from './sparql.mjs'

const out = process.argv[2] ?? 'archive-raw'
mkdirSync(out, { recursive: true })

// 시각 작품(Q4502142)의 하위 분류 + 작가(P170). 익명·미상 작가는 뺀다 (사용자가 작가를 직접 쓰므로)
const WORKS = `?w wdt:P31/wdt:P279* wd:Q4502142 . ?w wdt:P170 ?c . FILTER(?c NOT IN (wd:Q4233718, wd:Q24238356))`
const LANG = `FILTER(LANG(?l) = "ko" || LANG(?l) = "en")`
// 작품 속성: 사조·장르(화풍), 재료·기법(화법), 나라·만든 곳(근원지)
const WORK_PROPS = { P135: 'm', P136: 'g', P186: 'mt', P2079: 'me', P495: 'o', P1071: 'l' }

const jobs = {
  'work-creator': `SELECT DISTINCT ?w ?c WHERE { ${WORKS} }`,
  'work-class': `SELECT DISTINCT ?w ?v WHERE { ${WORKS} ?w wdt:P31 ?v }`,
  'work-label': `SELECT DISTINCT ?w ?l (LANG(?l) AS ?lang) WHERE { ${WORKS} ?w rdfs:label ?l ${LANG} }`,
  'work-alt': `SELECT DISTINCT ?w ?l (LANG(?l) AS ?lang) WHERE { ${WORKS} ?w skos:altLabel ?l ${LANG} }`,
  // 날짜: 값 + 정밀도 (9 = 해, 8 = 10년, 7 = 100년). 시작·끝·가장 이른·가장 늦은 때도
  'work-date': `SELECT DISTINCT ?w ?prop ?t ?p WHERE { ${WORKS}
    VALUES (?prop ?ps ?psv) { ("P571" p:P571 psv:P571) ("P580" p:P580 psv:P580) ("P582" p:P582 psv:P582) ("P1319" p:P1319 psv:P1319) ("P1326" p:P1326 psv:P1326) }
    ?w ?ps ?st . ?st ?psv ?tv . ?tv wikibase:timeValue ?t ; wikibase:timePrecision ?p }`,
  ...Object.fromEntries(Object.keys(WORK_PROPS).map((P) => [`work-${P}`, `SELECT DISTINCT ?w ?v WHERE { ${WORKS} ?w wdt:${P} ?v }`])),
  // 작가
  'artist-label': `SELECT DISTINCT ?c ?l (LANG(?l) AS ?lang) WHERE { { SELECT DISTINCT ?c WHERE { ${WORKS} } } ?c rdfs:label ?l ${LANG} }`,
  'artist-alt': `SELECT DISTINCT ?c ?l (LANG(?l) AS ?lang) WHERE { { SELECT DISTINCT ?c WHERE { ${WORKS} } } ?c skos:altLabel ?l ${LANG} }`,
  'artist-life': `SELECT DISTINCT ?c ?prop ?t WHERE { { SELECT DISTINCT ?c WHERE { ${WORKS} } }
    VALUES ?prop { wdt:P569 wdt:P570 } ?c ?prop ?t }`,
  'artist-P27': `SELECT DISTINCT ?c ?v WHERE { { SELECT DISTINCT ?c WHERE { ${WORKS} } } ?c wdt:P27 ?v }`,
  'artist-P135': `SELECT DISTINCT ?c ?v WHERE { { SELECT DISTINCT ?c WHERE { ${WORKS} } } ?c wdt:P135 ?v }`,
  // 작품에 사조·근원지·날짜가 드물어(사조 2%, 나라 7%) 작가 쪽으로 보탠다: 활동한 곳, 활동 시작·끝
  'artist-P937': `SELECT DISTINCT ?c ?v WHERE { { SELECT DISTINCT ?c WHERE { ${WORKS} } } ?c wdt:P937 ?v }`,
  'artist-active': `SELECT DISTINCT ?c ?prop ?t WHERE { { SELECT DISTINCT ?c WHERE { ${WORKS} } }
    VALUES ?prop { wdt:P2031 wdt:P2032 } ?c ?prop ?t }`,
  // 용어 이름: 작품·작가가 가리키는 모든 값의 한국어·영어 이름
  vocab: `SELECT DISTINCT ?v ?l (LANG(?l) AS ?lang) WHERE {
    { ${WORKS} VALUES ?prop { wdt:P31 wdt:P135 wdt:P136 wdt:P186 wdt:P2079 wdt:P495 wdt:P1071 } ?w ?prop ?v }
    UNION { { SELECT DISTINCT ?c WHERE { ${WORKS} } } VALUES ?prop { wdt:P27 wdt:P135 wdt:P937 } ?c ?prop ?v }
    ?v rdfs:label ?l ${LANG} }`,
}

const only = process.argv.slice(3)
for (const [name, q] of Object.entries(jobs)) {
  if (only.length && !only.includes(name)) continue
  console.error(`→ ${name}`)
  const rows = await query(q)
  // TSV로 저장 (값 안의 탭·줄바꿈은 parseTsv가 이미 공백으로 바꿨다)
  const cols = Object.keys(rows[0] ?? {})
  writeFileSync(join(out, `${name}.tsv`), [cols.join('\t'), ...rows.map((r) => cols.map((c) => r[c]).join('\t'))].join('\n') + '\n')
  console.error(`  saved ${rows.length} rows`)
}
