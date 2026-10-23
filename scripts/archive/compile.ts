// 수집한 TSV(collect.mjs) → 앱이 나눠 받는 정적 파일 묶음.
// npx vite-node scripts/archive/compile.ts <원자료 폴더> <출력 폴더>
//   manifest.json                 판·개수
//   names/{초성|글자|_}.json       작가 이름 색인 [이름, 작가 Qid, 작품 수][]
//   artists/{0..BUCKETS-1}.json   작가 묶음 { Qid: 작가(+작품) }
//   works/{Qid}.json              작품이 많은 작가의 작품 (작가에 x: 1)
//   vocab.json                    용어 { Qid: [한국어, 영어] }
import { createReadStream, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createInterface } from 'node:readline'
import { bucketOf, shardKeysOf, type ArchiveArtist, type ArchiveManifest, type ArchiveWork, type NameEntry, type Qid, type Vocab } from '../../src/domain/archive'
import { addName, compact, periodOf, push, spanOf, type DateClaim } from './compileLib'

const [raw = 'archive-raw', out = 'archive-out'] = process.argv.slice(2)
const BUCKETS = 4096
/** 이보다 작품이 많은 작가는 작품을 따로 둔다 (묶음 파일이 커지지 않게) */
const BIG = 400

async function* rows(name: string): AsyncGenerator<Record<string, string>> {
  const file = join(raw, `${name}.tsv`)
  if (!existsSync(file)) {
    console.warn(`  (없음) ${name}`)
    return
  }
  let head: string[] | undefined
  for await (const line of createInterface({ input: createReadStream(file, 'utf8'), crlfDelay: Infinity })) {
    if (!line) continue
    const cols = line.split('\t')
    if (!head) {
      head = cols
      continue
    }
    yield Object.fromEntries(head.map((h, i) => [h, cols[i] ?? '']))
  }
}

const works = new Map<Qid, ArchiveWork>()
const creatorsOf = new Map<Qid, Qid[]>()
const artists = new Map<Qid, ArchiveArtist>()
const dates = new Map<Qid, DateClaim[]>()
const vocab: Vocab = {}
const isQ = (v: string) => /^Q\d+$/.test(v)

const work = (id: Qid) => works.get(id)
const artist = (id: Qid) => {
  let a = artists.get(id)
  if (!a) artists.set(id, (a = { id, n: {}, w: [] }))
  return a
}

console.time('compile')
for await (const r of rows('work-creator')) {
  if (!isQ(r.w) || !isQ(r.c)) continue
  if (!works.has(r.w)) works.set(r.w, { id: r.w, n: {} })
  const cs = creatorsOf.get(r.w) ?? []
  if (!cs.includes(r.c)) cs.push(r.c)
  creatorsOf.set(r.w, cs)
  artist(r.c)
}
console.log(`works ${works.size}, artists ${artists.size}`)

for await (const r of rows('work-label')) work(r.w) && addName(work(r.w)!.n, r.l, r.lang)
for await (const r of rows('work-alt')) work(r.w) && addName(work(r.w)!.n, r.l, r.lang, true)
for await (const r of rows('work-class')) work(r.w) && isQ(r.v) && push(work(r.w)!, 'k', r.v)
for (const prop of ['P571', 'P580', 'P582', 'P1319', 'P1326']) {
  for await (const r of rows(`work-date-${prop}`)) {
    if (!work(r.w)) continue
    const list = dates.get(r.w) ?? []
    list.push({ prop, t: r.t, p: Number(r.p) })
    dates.set(r.w, list)
  }
}
for (const [id, claims] of dates) works.get(id)!.y = periodOf(claims)
dates.clear()
const WORK_PROPS = { P135: 'm', P136: 'g', P186: 'mt', P2079: 'me', P495: 'o', P1071: 'l' } as const
for (const [P, key] of Object.entries(WORK_PROPS)) {
  for await (const r of rows(`work-${P}`)) work(r.w) && isQ(r.v) && push(work(r.w)!, key as keyof ArchiveWork, r.v)
}

for await (const r of rows('artist-label')) artists.has(r.c) && addName(artist(r.c).n, r.l, r.lang)
for await (const r of rows('artist-alt')) artists.has(r.c) && addName(artist(r.c).n, r.l, r.lang, true)
for await (const r of rows('artist-life')) {
  if (!artists.has(r.c)) continue
  const y = spanOf(r.t, 9)?.from
  if (y === undefined) continue
  if (r.prop.endsWith('P569')) artist(r.c).b ??= y
  else artist(r.c).d ??= y
}
for await (const r of rows('artist-active')) {
  if (!artists.has(r.c)) continue
  const y = spanOf(r.t, 9)?.from
  if (y === undefined) continue
  const a = (artist(r.c).a ??= {})
  if (r.prop.endsWith('P2031')) a.from = a.from === undefined ? y : Math.min(a.from, y)
  else a.to = a.to === undefined ? y : Math.max(a.to, y)
}
for (const [P, key] of [['P27', 'c'], ['P135', 'm'], ['P937', 'wl']] as const) {
  for await (const r of rows(`artist-${P}`)) artists.has(r.c) && isQ(r.v) && push(artist(r.c), key, r.v)
}
for await (const r of rows('vocab')) {
  if (!isQ(r.v)) continue
  const e = (vocab[r.v] ??= ['', ''])
  if (r.lang === 'ko' && !e[0]) e[0] = r.l
  if (r.lang === 'en' && !e[1]) e[1] = r.l
}

// 채워진 비율 (수집이 잘렸는지 보는 눈금: 2026-10-23 probe 기준 날짜 68% · 재료 64%)
{
  const all = [...works.values()]
  const pct = (f: (w: ArchiveWork) => unknown) => `${((100 * all.filter(f).length) / all.length).toFixed(1)}%`
  console.log(
    JSON.stringify({
      date: pct((w) => w.y),
      material: pct((w) => w.mt?.length || w.me?.length),
      style: pct((w) => w.m?.length || w.g?.length),
      origin: pct((w) => w.o?.length || w.l?.length),
      ko: pct((w) => w.n.ko),
    }),
  )
}

// 작품을 작가에게 (공동 작업이면 모두에게)
for (const [wid, cs] of creatorsOf) {
  const w = compact(works.get(wid)!)
  for (const c of cs) artist(c).w.push(w)
}
creatorsOf.clear()

// 쓰기
if (existsSync(out)) rmSync(out, { recursive: true })
for (const d of ['names', 'artists', 'works']) mkdirSync(join(out, d), { recursive: true })

const names = new Map<string, NameEntry[]>()
const buckets: Record<Qid, ArchiveArtist>[] = Array.from({ length: BUCKETS }, () => ({}))
let separate = 0
let biggest = { id: '', n: 0 }
for (const a of artists.values()) {
  const count = a.w.length
  if (count > biggest.n) biggest = { id: a.id, n: count }
  for (const name of [a.n.ko, a.n.en, ...(a.n.alt ?? [])].filter((x): x is string => !!x)) {
    for (const key of shardKeysOf(name)) {
      const list = names.get(key) ?? []
      list.push([name, a.id, count])
      names.set(key, list)
    }
  }
  if (count > BIG) {
    writeFileSync(join(out, 'works', `${a.id}.json`), JSON.stringify(a.w))
    buckets[bucketOf(a.id, BUCKETS)][a.id] = compact({ ...a, w: [], x: 1 })
    separate++
  } else buckets[bucketOf(a.id, BUCKETS)][a.id] = compact(a)
}
for (const [key, list] of names) writeFileSync(join(out, 'names', `${key}.json`), JSON.stringify(list))
buckets.forEach((b, i) => writeFileSync(join(out, 'artists', `${i}.json`), JSON.stringify(b)))
writeFileSync(join(out, 'vocab.json'), JSON.stringify(vocab))

const manifest: ArchiveManifest = {
  version: new Date().toISOString().slice(0, 10),
  builtAt: new Date().toISOString(),
  buckets: BUCKETS,
  counts: { works: works.size, artists: artists.size, vocab: Object.keys(vocab).length },
  source: 'Wikidata (CC0) via QLever',
}
writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest))

// 보고: 파일 수·가장 큰 파일 (Cloudflare 한도: 파일 20,000개, 파일당 25MiB)
const sizeOf = (p: string) => statSync(p).size
const nameSizes = [...names.keys()].map((k) => [k, sizeOf(join(out, 'names', `${k}.json`))] as const).sort((a, b) => b[1] - a[1])
const bucketMax = Math.max(...buckets.map((_, i) => sizeOf(join(out, 'artists', `${i}.json`))))
console.log(JSON.stringify({ ...manifest.counts, separate, biggest, files: 2 + names.size + BUCKETS + separate, nameShardsTop: nameSizes.slice(0, 5), bucketMax, vocabBytes: sizeOf(join(out, 'vocab.json')) }))
console.timeEnd('compile')
