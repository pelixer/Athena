import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { db } from '../data/db'
import { useLive } from '../data/hooks'
import { createVisit } from '../data/repo'
import { Page } from '../components/Page'
import { Button } from '../components/Button'
import { formatDate } from '../lib/format'
import styles from './pages.module.css'

/** 관람 목록 + 새 관람 시작 */
export function HomePage() {
  const visits = useLive(() => db.visits.orderBy('startedAt').reverse().toArray(), [])
  const [title, setTitle] = useState('')
  const navigate = useNavigate()

  async function start() {
    const visit = await createVisit({ title: title.trim(), kind: 'exhibition' })
    navigate(`/visit/${visit.id}/capture`)
  }

  return (
    <Page title="Athena">
      <section className={styles.stack}>
        <input placeholder="오늘의 관람 — 예: 데이비드 호크니, 국립현대미술관" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button disabled={!title.trim()} onClick={start}>
          관람 시작
        </Button>
      </section>
      <ul className={styles.list}>
        {visits?.map((v) => (
          <li key={v.id}>
            <Link to={`/visit/${v.id}`}>
              <strong>{v.title}</strong>
              <span>{formatDate(v.startedAt)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  )
}
