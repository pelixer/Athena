import { useParams } from 'react-router-dom'
import { db } from '../data/db'
import { useLive, usePhotoUrl } from '../data/hooks'
import { sequenceOf } from '../domain/sequence'
import { Page } from '../components/Page'
import { ShareCard } from '../components/ShareCard'

/** 공유 카드 미리보기. TODO(Export): 카드 DOM → 이미지 저장 · 공유 */
export function ShareCardPage() {
  const { objeId = '' } = useParams()
  const data = useLive(async () => {
    const obje = await db.objes.get(objeId)
    if (!obje) return null
    const visit = obje.visitId ? await db.visits.get(obje.visitId) : undefined
    const siblings = obje.visitId ? await db.objes.where('visitId').equals(obje.visitId).toArray() : [obje]
    return { obje, visit, sequence: sequenceOf(siblings).get(obje.id) }
  }, [objeId])
  const src = usePhotoUrl(data?.obje.photoId)

  if (!data) return null
  const { obje, visit, sequence } = data
  return (
    <Page title="카드" back={`/obje/${obje.id}`}>
      <ShareCard
        src={src}
        takenAt={obje.takenAt}
        sequence={visit ? sequence : undefined}
        visitTitle={visit?.title}
        note={obje.note}
        tags={obje.tags}
      />
    </Page>
  )
}
