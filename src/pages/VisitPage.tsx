import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db } from '../data/db'
import { useLive, usePhotoUrl } from '../data/hooks'
import { endVisit } from '../data/repo'
import { sequenceOf } from '../domain/sequence'
import { attachmentLabel, visitSpan, visitStats } from '../domain/visitStats'
import type { Obje } from '../domain/types'
import { formatCount, formatDateWeekday, formatDuration, formatIndex, formatTime } from '../lib/format'
import { Screen } from '../components/Screen'
import { IconButton } from '../components/IconButton'
import { StatRow } from '../components/StatRow'
import { TabBar } from '../components/TabBar'
import { ObjeCard } from '../components/ObjeCard'
import styles from './VisitPage.module.css'

type View = 'index' | 'tags' | 'notes'

/** 03 관람 보기 · VisitPage — 조회를 위한 고유한 화면. 템플릿(산출물)과는 별개다. */
export function VisitPage() {
  const { visitId = '' } = useParams()
  const navigate = useNavigate()
  const [view, setView] = useState<View>('index')
  const data = useLive(async () => {
    const visit = await db.visits.get(visitId)
    const objes = await db.objes.where('visitId').equals(visitId).toArray()
    return { visit, objes }
  }, [visitId])

  if (!data) return null
  const { visit, objes } = data
  if (!visit) return <p className={styles.missing}>관람을 찾을 수 없어요.</p>

  const index = sequenceOf(objes)
  const newestFirst = [...objes].sort((a, b) => index.get(b.id)! - index.get(a.id)!)
  const stats = visitStats(objes)
  const span = visitSpan(objes, visit.endedAt)

  // R8: 진행 중이면 관람을 끝내고 템플릿으로, 끝난 관람이면 바로 템플릿으로
  async function toTemplate() {
    if (!visit!.endedAt) await endVisit(visit!.id)
    navigate(`/visit/${visit!.id}/template`)
  }

  const groups: [string | undefined, Obje[]][] =
    view === 'index'
      ? [[undefined, newestFirst]]
      : view === 'notes'
        ? [[undefined, newestFirst.filter((o) => o.note?.trim())]]
        : byTag(newestFirst)

  return (
    <Screen
      fade
      top={
        <>
          <IconButton icon="back" surface="marble" aria-label="뒤로" onClick={() => navigate('/')} />
          {visit.endedAt && (
            <IconButton icon="ticket" surface="marble" aria-label="템플릿 만들기" onClick={toTemplate} />
          )}
        </>
      }
      bottom={
        <>
          <IconButton icon="add" surface="marble" size={54} aria-label="오브제 추가" onClick={() => navigate(`/visit/${visit.id}/capture`)} />
          <IconButton icon="ticket" surface="accent" size={54} aria-label={visit.endedAt ? '템플릿 만들기' : '관람 마무리 · 템플릿 만들기'} onClick={toTemplate} />
        </>
      }
    >
      <main className={styles.page}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>관람 · {formatDateWeekday(visit.startedAt)}</span>
          <h1 className={styles.title}>{visit.title}</h1>
          <p className={styles.where}>
            {visit.venue}
            {visit.venue && span && <br />}
            {span && `${formatTime(span.start)} — ${formatTime(span.end)} · ${formatDuration(span.end - span.start)}`}
          </p>
          <StatRow
            stats={[
              ['오브제', stats.objes],
              ['도슨트', stats.docents],
              ['나의 노트', stats.notes],
            ]}
          />
        </header>

        <TabBar
          tabs={[
            { value: 'index', label: '순번' },
            { value: 'tags', label: '라벨' },
            { value: 'notes', label: '노트만' },
          ]}
          value={view}
          onChange={setView}
        />

        {objes.length === 0 ? (
          <p className={styles.empty}>아직 찍은 오브제가 없어요. + 를 눌러 첫 오브제를 담아 보세요.</p>
        ) : (
          groups.map(([tag, list]) => (
            <section key={tag ?? 'all'} className={styles.group}>
              {view === 'tags' && (
                <h2 className={styles.groupLabel}>
                  <span>{tag ? `#${tag}` : '라벨 없음'}</span>
                  <span className={styles.groupCount}>{formatCount(list.length)}</span>
                </h2>
              )}
              {list.length === 0 ? (
                <p className={styles.empty}>노트를 쓴 오브제가 아직 없어요.</p>
              ) : (
                <div className={styles.grid}>
                  {list.map((o) => (
                    <Thumb key={o.id} obje={o} index={index.get(o.id)!} />
                  ))}
                </div>
              )}
            </section>
          ))
        )}
      </main>
    </Screen>
  )
}

function byTag(objes: Obje[]): [string | undefined, Obje[]][] {
  const groups = new Map<string | undefined, Obje[]>()
  for (const o of objes) for (const t of o.tags.length ? o.tags : [undefined]) groups.set(t, [...(groups.get(t) ?? []), o])
  return [...groups].sort(([a], [b]) => (a === undefined ? 1 : b === undefined ? -1 : a.localeCompare(b, 'ko')))
}

function Thumb({ obje, index }: { obje: Obje; index: number }) {
  const src = usePhotoUrl(obje.photoId)
  return (
    <Link to={`/obje/${obje.id}`}>
      <ObjeCard src={src} index={index} time={formatTime(obje.takenAt)} attachment={attachmentLabel(obje)} title={obje.title ?? formatIndex(index)} />
    </Link>
  )
}
