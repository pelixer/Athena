import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db } from '../data/db'
import { useLive } from '../data/hooks'
import { createVisit } from '../data/repo'
import { Screen } from '../components/Screen'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'
import { formatDateWeekday } from '../lib/format'
import styles from './HomePage.module.css'

/** 홈 — 관람 목록 + 새 관람 시작. 단계 2: 시안 없음, 디자인 시스템 원칙으로 구성. */
export function HomePage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [venue, setVenue] = useState('')
  const visits = useLive(async () => {
    const all = await db.visits.orderBy('startedAt').reverse().toArray()
    return Promise.all(all.map(async (v) => ({ ...v, count: await db.objes.where('visitId').equals(v.id).count() })))
  }, [])

  async function start(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const visit = await createVisit({ title: title.trim(), venue: venue.trim() || undefined })
    navigate(`/visit/${visit.id}/capture`)
  }

  return (
    <Screen>
      <main className={styles.page}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>{formatDateWeekday(Date.now())}</span>
          <h1 className={styles.wordmark}>Athena</h1>
        </header>

        <form className={styles.start} onSubmit={start}>
          <span className={styles.label}>새 관람</span>
          <TextField id="visit-title" placeholder="전시·공연 이름 — 흰 절벽, 한서윤 사진전" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextField id="visit-venue" placeholder="장소 — 국립현대미술관 서울" value={venue} onChange={(e) => setVenue(e.target.value)} />
          <Button type="submit" disabled={!title.trim()}>
            관람 시작
          </Button>
        </form>

        {visits && visits.length > 0 && (
          <section className={styles.list}>
            <span className={styles.label}>지난 관람</span>
            {visits.map((v) => (
              <Link key={v.id} to={`/visit/${v.id}`} className={styles.row}>
                <span className={styles.meta}>
                  {formatDateWeekday(v.startedAt)}
                  {v.venue && ` · ${v.venue}`}
                </span>
                <span className={styles.title}>{v.title}</span>
                <span className={styles.meta}>오브제 {String(v.count).padStart(2, '0')}</span>
              </Link>
            ))}
          </section>
        )}
      </main>
    </Screen>
  )
}
