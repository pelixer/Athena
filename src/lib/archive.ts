import {
  bucketOf,
  rankArtists,
  rankWorks,
  queryShardKeys,
  type ArchiveArtist,
  type ArchiveManifest,
  type ArchiveWork,
  type ArtistBucket,
  type ArtistHit,
  type NameEntry,
  type Vocab,
  type WorkHit,
} from '../domain/archive'

/**
 * 아트 아카이브 읽기 — 서버 없이 public/archive/<판>/ 의 정적 조각을 필요한 만큼만 받는다.
 * 받은 조각은 이 탭 안에서 기억하고, 브라우저 HTTP 캐시가 판 단위로 오래 보관한다(public/_headers).
 */
const BASE = '/archive'
const memo = new Map<string, Promise<unknown>>()

function get<T>(path: string): Promise<T> {
  let p = memo.get(path) as Promise<T> | undefined
  if (!p) {
    p = fetch(path).then((r) => {
      if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`)
      return r.json() as Promise<T>
    })
    p.catch(() => memo.delete(path))
    memo.set(path, p)
  }
  return p
}

/** 지금 판의 폴더 + 목록. 아카이브 없이 빌드됐으면 undefined */
export async function archiveInfo(): Promise<{ root: string; manifest: ArchiveManifest } | undefined> {
  try {
    const { version } = await get<{ version: string }>(`${BASE}/current.json`)
    const root = `${BASE}/${version}`
    return { root, manifest: await get<ArchiveManifest>(`${root}/manifest.json`) }
  } catch {
    return undefined
  }
}

async function root() {
  const info = await archiveInfo()
  if (!info) throw new ArchiveUnavailable()
  return info
}

export class ArchiveUnavailable extends Error {
  constructor() {
    super('아카이브 데이터가 없어요')
  }
}

/** 작가 이름 → 후보 (가장 긴 낱말의 첫 글자 조각을 받아 흐리게 맞춘다 — 틀리게 써도) */
export async function findArtists(query: string, limit = 5): Promise<ArtistHit[]> {
  const { root: r } = await root()
  const keys = queryShardKeys(query)
  const shards = await Promise.all(keys.map((k) => get<NameEntry[]>(`${r}/names/${k}.json`).catch(() => [] as NameEntry[])))
  return rankArtists(query, shards.flat(), limit)
}

/** 작가 한 명 (작품까지) */
export async function loadArtist(id: string): Promise<ArchiveArtist | undefined> {
  const { root: r, manifest } = await root()
  const bucket = await get<ArtistBucket>(`${r}/artists/${bucketOf(id, manifest.buckets)}.json`)
  const a = bucket[id]
  if (!a) return undefined
  if (a.x) return { ...a, w: await get<ArchiveWork[]>(`${r}/works/${id}.json`) }
  return a
}

export async function loadVocab(): Promise<Vocab> {
  const { root: r } = await root()
  return get<Vocab>(`${r}/vocab.json`)
}

export interface ArchiveResult {
  /** 맞는 작품 (점수 순) */
  works: WorkHit[]
  /** 작가 후보 (작품을 못 찾았을 때 고를 수 있게) */
  artists: ArchiveArtist[]
}

/** 작품 이름 + 작가 → 맞는 작품들. 작가 후보 상위 몇 명의 작품에서 제목을 찾는다 */
export async function lookup(title: string, artistQuery: string): Promise<ArchiveResult> {
  const hits = await findArtists(artistQuery, 4)
  const artists = (await Promise.all(hits.map((h) => loadArtist(h.id)))).filter((a): a is ArchiveArtist => !!a)
  const works = artists
    .flatMap((a, i) => rankWorks(title, a).map((w) => ({ ...w, score: w.score - i * 0.02 })))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
  return { works, artists }
}
