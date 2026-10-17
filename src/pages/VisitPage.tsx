import { Link, useNavigate, useParams } from 'react-router-dom'
import { db } from '../data/db'
import { useLive, usePhotoUrl } from '../data/hooks'
import { endVisit } from '../data/repo'
import { sequenceOf } from '../domain/sequence'
import type { Obje } from '../domain/types'
import { Page } from '../components/Page'
import { Button } from '../components/Button'
import { ObjeThumb } from '../components/ObjeThumb'
import { formatDate } from '../lib/format'
import styles from './pages.module.css'

/**
 * 관람 보기 — 조회를 위한 고유한 화면. 템플릿(산출물)과는 별개다.
 */
export function VisitPage() {
  const { visitId = '' } = useParams()
  const navigate = useNavigate()
  const data = useLive(async () => {
    const visit = await db.visits.get(visitId)
    const objes = await db.objes.where('visitId').equals(visitId).sortBy('takenAt')
    return { visit, objes }
  }, [visitId])

  if (!data) return null
  const { visit, objes } = data
  if (!visit) return <Page title="찾을 수 없음" back="/">{null}</Page>
  const sequence = sequenceOf(objes)

  return (
    <Page title={visit.title} back="/">
      <p className={styles.sub}>
        {formatDate(visit.startedAt)} · 오브제 {objes.length}
      </p>
      <div className={styles.grid}>
        {objes.map((o) => (
          <Thumb key={o.id} obje={o} sequence={sequence.get(o.id)!} />
        ))}
      </div>
      <div className={styles.row}>
        <Button onClick={() => navigate(`/visit/${visit.id}/capture`)}>오브제 추가</Button>
        {!visit.endedAt && (
          // TODO(Template): 관람 마무리 → 나만의 템플릿으로 저장하는 흐름
          <Button variant="ghost" onClick={() => endVisit(visit.id)}>
            관람 마치기
          </Button>
        )}
      </div>
    </Page>
  )
}

function Thumb({ obje, sequence }: { obje: Obje; sequence: number }) {
  const src = usePhotoUrl(obje.photoId)
  return (
    <Link to={`/obje/${obje.id}`}>
      <ObjeThumb src={src} sequence={sequence} />
    </Link>
  )
}
