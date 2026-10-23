// 어떤 endpoint가 되는지, 시각 작품(visual artwork Q4502142의 하위 분류)이 분류별로 몇 점인지 본다.
import { query } from './sparql.mjs'

const tasks = {
  total: `SELECT (COUNT(DISTINCT ?w) AS ?n) WHERE { ?w wdt:P31/wdt:P279* wd:Q4502142 . ?w wdt:P170 ?c }`,
  byClass: `SELECT ?cls (COUNT(DISTINCT ?w) AS ?n) WHERE { ?w wdt:P31 ?cls . ?cls wdt:P279* wd:Q4502142 . ?w wdt:P170 ?c } GROUP BY ?cls ORDER BY DESC(?n) LIMIT 40`,
  creators: `SELECT (COUNT(DISTINCT ?c) AS ?n) WHERE { ?w wdt:P31/wdt:P279* wd:Q4502142 . ?w wdt:P170 ?c }`,
  fields: `SELECT (COUNT(DISTINCT ?a) AS ?inception) (COUNT(DISTINCT ?b) AS ?movement) (COUNT(DISTINCT ?d) AS ?material) (COUNT(DISTINCT ?e) AS ?origin) (COUNT(DISTINCT ?f) AS ?genre) WHERE {
    ?w wdt:P31/wdt:P279* wd:Q4502142 . ?w wdt:P170 ?c .
    OPTIONAL { ?w wdt:P571 ?x . BIND(?w AS ?a) } OPTIONAL { ?w wdt:P135 ?y . BIND(?w AS ?b) }
    OPTIONAL { ?w wdt:P186 ?z . BIND(?w AS ?d) } OPTIONAL { ?w wdt:P495 ?u . BIND(?w AS ?e) } OPTIONAL { ?w wdt:P136 ?v . BIND(?w AS ?f) } }`,
  koLabels: `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> SELECT (COUNT(DISTINCT ?w) AS ?n) WHERE { ?w wdt:P31/wdt:P279* wd:Q4502142 . ?w wdt:P170 ?c . ?w rdfs:label ?l FILTER(LANG(?l) = "ko") }`,
}

for (const only of ['qlever', 'wdqs']) {
  console.log(`\n=== ${only} ===`)
  for (const [name, q] of Object.entries(tasks)) {
    try {
      const rows = await query(q, { only, tries: 1, timeoutMs: 300_000 })
      console.log(name, JSON.stringify(rows.slice(0, 40)))
    } catch (e) {
      console.log(name, 'FAILED', String(e.message).slice(0, 200))
    }
    if (only === 'wdqs') break // WDQS는 접속만 확인 (큰 질의는 60초에 끊긴다)
  }
}
