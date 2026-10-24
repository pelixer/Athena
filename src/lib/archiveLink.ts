import { artistSnapshotOf, AUTO_LINK, candidateOf, objeArchiveKey, snapshotOf } from '../domain/archive'
import type { ArchiveCandidate, ObjeArchive } from '../domain/types'
import { archiveInfo, loadArtist, loadVocab, lookup } from './archive'

/**
 * 오브제 제목 · 작가 → 아카이브 메타. 서버 없이 앱에 담긴 정적 조각에서 찾는다 (src/lib/archive.ts).
 * 확실하면(점수 ≥ AUTO_LINK) 바로 붙이고, 아니면 비슷한 제목을 후보로 + 작가가 맞았으면 작가 쪽 메타를 담는다(꼬리표 "?").
 * 아카이브 데이터가 없는 빌드면 undefined (아무것도 붙이지 않는다).
 */
export async function matchArchive(title: string, artist: string): Promise<ObjeArchive | undefined> {
  const query = objeArchiveKey(title, artist)
  const info = await archiveInfo()
  if (!query || !info) return undefined
  const [result, vocab] = await Promise.all([lookup(title, artist), loadVocab()])
  const now = Date.now()
  const candidates = result.works.map((h) => candidateOf(h.artist, h.work))
  const best = result.works[0]
  if (best && best.score >= AUTO_LINK) {
    return { ...snapshotOf(best.artist, best.work, vocab, info.manifest.version, query, now), candidates: candidates.slice(1) }
  }
  // 제목이 확실히 맞지 않으면: 비슷한 제목만 후보로, 작가가 맞았으면 작가 쪽 메타를 담는다
  const found = best?.artist ?? result.artists[0]
  if (found) return { ...artistSnapshotOf(found, vocab, info.manifest.version, query, now, title.trim()), candidates }
  return { query, state: 'none', candidates, at: now }
}

/** 후보 하나를 골라 붙인다 */
export async function linkCandidate(c: ArchiveCandidate, query: string, others: ArchiveCandidate[]): Promise<ObjeArchive | undefined> {
  const info = await archiveInfo()
  const artist = await loadArtist(c.artistId)
  const work = artist?.w.find((w) => w.id === c.workId)
  if (!info || !artist || !work) return undefined
  const vocab = await loadVocab()
  return { ...snapshotOf(artist, work, vocab, info.manifest.version, query, Date.now()), candidates: others.filter((o) => o.workId !== c.workId) }
}
