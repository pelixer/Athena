import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db } from '../data/db'
import { useLive, usePhotoUrl } from '../data/hooks'
import { createVisit } from '../data/repo'
import type { ID, Visit } from '../domain/types'
import { Screen } from '../components/Screen'
import { IconButton } from '../components/IconButton'
import { Sheet } from '../components/Sheet'
import { TextField } from '../components/TextField'
import { formatCount, formatDateWeekday } from '../lib/format'
import styles from './HomePage.module.css'

type VisitRow = Visit & { count: number; coverPhotoId?: ID }

/** 홈 — 관람 목록 + 새 관람 시작. 단계 2 (R1 반영). 첫 실행 화면은 단계 3으로 디자인 대기. */
export function HomePage() {
  const navigate = useNavigate()
  const [starting, setStarting] = useState(false)
  const [title, setTitle] = useState('')
  const [venue, setVenue] = useState('')
  const close = useCallback(() => setStarting(false), [])

  const visits = useLive(async (): Promise<VisitRow[]> => {
    const all = await db.visits.orderBy('startedAt').reverse().toArray()
    const rows = await Promise.all(
      all.map(async (v) => {
        const objes = await db.objes.where('visitId').equals(v.id).sortBy('takenAt')
        return { ...v, count: objes.length, coverPhotoId: objes[0]?.photoId }
      }),
    )
    // 진행 중인 관람을 맨 위로 (R1)
    return [...rows.filter((v) => !v.endedAt), ...rows.filter((v) => v.endedAt)]
  }, [])

  async function start() {
    if (!title.trim()) return
    const visit = await createVisit({ title: title.trim(), venue: venue.trim() || undefined })
    navigate(`/visit/${visit.id}/capture`)
  }

  return (
    <Screen
      bottom={
        <IconButton icon="add" surface="accent" size={54} aria-label="새 관람 시작" onClick={() => setStarting(true)} />
      }
    >
      <main className={styles.page}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>{formatDateWeekday(Date.now())}</span>
          <h1 className={styles.wordmark}>Athena</h1>
        </header>

        {visits && visits.length > 0 && (
          <section className={styles.list}>
            <span className={styles.label}>관람</span>
            {visits.map((v) => (
              <VisitRowLink key={v.id} visit={v} />
            ))}
          </section>
        )}
      </main>

      <Sheet open={starting} title="새 관람" onClose={close} onConfirm={start} confirmLabel="관람 시작" confirmDisabled={!title.trim()}>
        <TextField id="visit-title" autoFocus placeholder="전시·공연 이름 — 흰 절벽, 한서윤 사진전" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField id="visit-venue" placeholder="장소 — 국립현대미술관 서울" value={venue} onChange={(e) => setVenue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && start()} />
      </Sheet>
    </Screen>
  )
}

function VisitRowLink({ visit }: { visit: VisitRow }) {
  const cover = usePhotoUrl(visit.coverPhotoId)
  return (
    <Link to={`/visit/${visit.id}`} className={styles.row}>
      <span className={styles.thumb} style={cover ? { backgroundImage: `url(${cover})` } : undefined} />
      <span className={styles.text}>
        <span className={styles.meta}>
          {!visit.endedAt && (
            <>
              <span className={styles.dot} />
              관람 중 ·{' '}
            </>
          )}
          {formatDateWeekday(visit.startedAt)}
          {visit.venue && ` · ${visit.venue}`}
        </span>
        <span className={styles.title}>{visit.title}</span>
        <span className={styles.meta}>오브제 {formatCount(visit.count)}</span>
      </span>
    </Link>
  )
}
