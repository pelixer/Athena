import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { displayName, formatLife, labels, rankWorks, type ArchiveArtist, type ArchiveWork, type Vocab } from '../domain/archive'
import { archiveInfo, loadVocab, lookup, ArchiveUnavailable, type ArchiveResult } from '../lib/archive'
import { formatCount } from '../lib/format'
import { Screen } from '../components/Screen'
import { IconButton } from '../components/IconButton'
import { Field } from '../components/Sheet'
import { TextField } from '../components/TextField'
import { SectionHead } from '../components/Stoa'
import { ArchiveEntry, ArchiveWorkRow } from '../components/ArchiveEntry'
import styles from './ArchivePage.module.css'

type State =
  | { kind: 'idle' }
  | { kind: 'busy' }
  | { kind: 'unavailable' }
  | { kind: 'error' }
  | { kind: 'done'; result: ArchiveResult }

const SHOW_WORKS = 30

/**
 * 아카이브 · ArchivePage — 작품 이름과 작가를 직접 쓰면 작가 · 작업 기간 · 화법 · 화풍 · 근원지를 보여 준다.
 * 서버 없음: 빌드에 들어간 Wikidata 정적 조각을 필요한 만큼만 받는다 (src/lib/archive.ts).
 * 단계 2 — 시안 없이 기존 부품(Field · TextField · SectionHead · 오브제 라벨 형식)으로 만들었다. design/REVIEW.md A1.
 * 주소 ?title=…&artist=… 로 들어오면 바로 찾는다 (오브제 상세의 캡션에서).
 */
export function ArchivePage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [title, setTitle] = useState(params.get('title') ?? '')
  const [artist, setArtist] = useState(params.get('artist') ?? '')
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [vocab, setVocab] = useState<Vocab>({})
  const [picked, setPicked] = useState<{ artist: ArchiveArtist; work: ArchiveWork }>()
  const [counts, setCounts] = useState<{ works: number; artists: number }>()
  const [more, setMore] = useState(false)

  useEffect(() => {
    archiveInfo().then((info) => (info ? setCounts(info.manifest.counts) : setState({ kind: 'unavailable' })))
  }, [])

  const search = useCallback(async (t: string, a: string) => {
    if (!a.trim()) return
    setState({ kind: 'busy' })
    setPicked(undefined)
    setMore(false)
    setParams({ title: t, artist: a }, { replace: true })
    try {
      const [result, v] = await Promise.all([lookup(t, a), loadVocab()])
      setVocab(v)
      setState({ kind: 'done', result })
      if (result.works[0]) setPicked({ artist: result.works[0].artist, work: result.works[0].work })
    } catch (e) {
      setState({ kind: e instanceof ArchiveUnavailable ? 'unavailable' : 'error' })
    }
  }, [setParams])

  // 캡션에서 넘어오면 바로 찾는다
  useEffect(() => {
    const a = params.get('artist')
    if (a) search(params.get('title') ?? '', a)
    // 처음 한 번만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const result = state.kind === 'done' ? state.result : undefined

  /** 다른 작가 후보를 고르면 그 작가의 작품에서 다시 맞춘다 */
  function focusArtist(a: ArchiveArtist) {
    if (!result) return
    const works = rankWorks(title, a)
    setMore(false)
    setState({ kind: 'done', result: { works, artists: [a, ...result.artists.filter((x) => x !== a)] } })
    setPicked(works[0] ? { artist: a, work: works[0].work } : undefined)
  }
  const others = result?.works.filter((h) => h.work !== picked?.work) ?? []
  // 작품을 못 찾았으면 첫 작가 후보와 그 작품 목록
  const focus = picked?.artist ?? result?.artists[0]
  const list = focus ? [...focus.w].sort((x, y) => (x.y?.from ?? 9999) - (y.y?.from ?? 9999)) : []

  return (
    <Screen
      left={<IconButton icon="back" aria-label="뒤로" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))} />}
      title="아카이브"
      bottom={<IconButton icon="search" size={54} aria-label="찾기" disabled={!artist.trim() || state.kind === 'busy'} onClick={() => search(title, artist)} />}
    >
      <main className={styles.page}>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault()
            search(title, artist)
          }}
        >
          <Field label="작품" htmlFor="archive-title">
            <TextField id="archive-title" value={title} placeholder="별이 빛나는 밤 · The Starry Night" onChange={(e) => setTitle(e.target.value)} enterKeyHint="next" />
          </Field>
          <Field label="작가" htmlFor="archive-artist">
            <TextField id="archive-artist" value={artist} placeholder="빈센트 반 고흐 · Vincent van Gogh" onChange={(e) => setArtist(e.target.value)} enterKeyHint="search" />
          </Field>
          <button type="submit" hidden />
        </form>

        {state.kind === 'idle' && (
          <p className={styles.note}>
            작품 이름과 작가를 쓰면 작업 기간 · 화법 · 화풍 · 근원지를 보여 줘요.
            {counts && ` 작품 ${counts.works.toLocaleString()}점 · 작가 ${counts.artists.toLocaleString()}명 (Wikidata).`}
          </p>
        )}
        {state.kind === 'busy' && <p className={styles.note}>찾는 중…</p>}
        {state.kind === 'unavailable' && <p className={styles.note}>이 빌드에는 아카이브 데이터가 들어 있지 않아요.</p>}
        {state.kind === 'error' && <p className={styles.note}>아카이브를 읽지 못했어요. 연결을 확인하고 다시 찾아 주세요.</p>}

        {result && !result.artists.length && <p className={styles.note}>“{artist}” 작가를 찾지 못했어요. 원어 이름(예: Claude Monet)으로도 찾아보세요.</p>}

        {picked && <ArchiveEntry artist={picked.artist} work={picked.work} vocab={vocab} />}

        {result && focus && !picked && (
          <p className={styles.note}>
            {title.trim() ? `“${title}”을(를) ${displayName(focus.n)}의 작품에서 찾지 못했어요. 아래 목록에서 골라 주세요.` : '작품을 골라 주세요.'}
          </p>
        )}

        {others.length > 0 && (
          <section className={styles.section}>
            <SectionHead name="다른 후보" count={formatCount(others.length)} />
            {others.map((h) => (
              <ArchiveWorkRow key={`${h.artist.id}-${h.work.id}`} work={h.work} artist={h.artist} onSelect={() => setPicked({ artist: h.artist, work: h.work })} />
            ))}
          </section>
        )}

        {focus && (
          <section className={styles.section}>
            <SectionHead name={displayName(focus.n)} count={formatCount(focus.w.length)} />
            <p className={styles.artistMeta}>
              {[formatLife(focus), ...labels(focus.c, vocab), ...labels(focus.m, vocab)].filter(Boolean).join(' · ')}
            </p>
            {list.slice(0, more ? undefined : SHOW_WORKS).map((w) => (
              <ArchiveWorkRow key={w.id} work={w} onSelect={() => setPicked({ artist: focus, work: w })} />
            ))}
            {!more && focus.w.length > SHOW_WORKS && (
              <button type="button" className={styles.more} onClick={() => setMore(true)}>
                {formatCount(focus.w.length - SHOW_WORKS)}점 더 보기
              </button>
            )}
          </section>
        )}

        {result && result.artists.length > 1 && (
          <section className={styles.section}>
            <SectionHead name="다른 작가 후보" />
            {result.artists.slice(focus ? 1 : 0).map((a) => (
              <button key={a.id} type="button" className={styles.artist} onClick={() => focusArtist(a)}>
                <span className={styles.artistName}>{displayName(a.n)}</span>
                <span className={styles.artistMeta}>{[formatLife(a), `작품 ${formatCount(a.w.length)}`].filter(Boolean).join(' · ')}</span>
              </button>
            ))}
          </section>
        )}
      </main>
    </Screen>
  )
}
