import { Link, useParams } from 'react-router-dom'
import { db } from '../data/db'
import { useLive, usePhotoUrl } from '../data/hooks'
import { sequenceOf } from '../domain/sequence'
import { Page } from '../components/Page'
import { MetaLine } from '../components/MetaLine'
import { TagList } from '../components/TagChip'
import { DocentBlock, NoteBlock } from '../components/TextBlock'
import styles from './pages.module.css'

/** 오브제 상세: 사진 · 메타 · #라벨 · 도슨트 · 나의 노트 */
export function ObjePage() {
  const { objeId = '' } = useParams()
  const data = useLive(async () => {
    const obje = await db.objes.get(objeId)
    if (!obje) return null
    const siblings = obje.visitId ? await db.objes.where('visitId').equals(obje.visitId).toArray() : [obje]
    const visit = obje.visitId ? await db.visits.get(obje.visitId) : undefined
    return { obje, visit, sequence: sequenceOf(siblings).get(obje.id) }
  }, [objeId])
  const src = usePhotoUrl(data?.obje.photoId)

  if (data === undefined) return null
  if (data === null) return <Page title="찾을 수 없음" back="/">{null}</Page>
  const { obje, visit, sequence } = data

  return (
    <Page title={visit?.title ?? '오브제'} back={visit ? `/visit/${visit.id}` : '/'}>
      {src && <img className={styles.hero} src={src} alt="" />}
      <MetaLine takenAt={obje.takenAt} sequence={visit ? sequence : undefined} location={obje.location} />
      <TagList tags={obje.tags} />
      {obje.docent?.text && <DocentBlock text={obje.docent.text} />}
      {obje.note && <NoteBlock text={obje.note} />}
      <Link to={`/obje/${obje.id}/card`}>카드 만들기 →</Link>
    </Page>
  )
}
