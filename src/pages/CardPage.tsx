import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../data/db'
import { useLive, usePhotoUrl } from '../data/hooks'
import { sequenceOf } from '../domain/sequence'
import { formatDate, formatIndex, formatTime } from '../lib/format'
import { renderCard, saveCard, shareCard } from '../lib/cardExport'
import { Screen } from '../components/Screen'
import { IconButton } from '../components/IconButton'
import { Button } from '../components/Button'
import { Card, type CardField, type CardStyle } from '../components/Card'
import { CardStylePicker } from '../components/CardStylePicker'
import { OptionChip } from '../components/OptionChip'
import styles from './CardPage.module.css'

const FIELDS: { field: CardField; label: string }[] = [
  { field: 'note', label: '나의 노트' },
  { field: 'meta', label: '날짜 · 장소' },
  { field: 'docent', label: '도슨트' },
  { field: 'tags', label: '라벨' },
]

/** 04 공유 카드 · CardPage */
export function CardPage() {
  const { objeId = '' } = useParams()
  const navigate = useNavigate()
  const cardRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<CardStyle>('sky')
  const [fields, setFields] = useState<Set<CardField>>(new Set(['note', 'meta']))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()

  const data = useLive(async () => {
    const obje = await db.objes.get(objeId)
    if (!obje) return null
    const siblings = obje.visitId ? await db.objes.where('visitId').equals(obje.visitId).toArray() : [obje]
    return { obje, index: sequenceOf(siblings).get(obje.id) ?? 1 }
  }, [objeId])
  const photo = usePhotoUrl(data?.obje.photoId)

  if (!data) return null
  const { obje, index } = data
  const filename = `athena-${formatDate(obje.takenAt).replaceAll('.', '')}-${String(index).padStart(2, '0')}.png`

  function toggle(f: CardField) {
    setFields((prev) => {
      const next = new Set(prev)
      if (next.has(f)) next.delete(f)
      else next.add(f)
      return next
    })
  }

  async function exportCard(action: 'save' | 'share') {
    if (!cardRef.current) return
    setBusy(true)
    setError(undefined)
    try {
      const blob = await renderCard(cardRef.current)
      if (action === 'save') saveCard(blob, filename)
      else await shareCard(blob, filename)
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError('카드를 만들지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen
      tone="sunken"
      top={
        <>
          <IconButton icon="close" surface="marble" aria-label="닫기" onClick={() => navigate(`/obje/${obje.id}`)} />
          <span className={styles.heading}>카드 만들기</span>
          <span className={styles.balance} />
        </>
      }
      bottom={
        <>
          <Button variant="neutral" icon="save" className={styles.secondary} disabled={busy} onClick={() => exportCard('save')}>
            저장
          </Button>
          <Button icon="share" className={styles.primary} disabled={busy} onClick={() => exportCard('share')}>
            공유하기
          </Button>
        </>
      }
    >
      <main className={styles.page}>
        <Card
          ref={cardRef}
          style={style}
          fields={fields}
          photo={photo}
          note={obje.note}
          stamp={`${formatIndex(index)} · ${formatDate(obje.takenAt)} ${formatTime(obje.takenAt)}`}
          place={obje.place}
          docentHeading={obje.docent?.heading}
          tags={obje.tags}
        />
        <CardStylePicker value={style} photo={photo} onChange={setStyle} />
        <div className={styles.options}>
          {FIELDS.map(({ field, label }) => (
            <OptionChip key={field} label={label} on={fields.has(field)} onToggle={() => toggle(field)} />
          ))}
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </main>
    </Screen>
  )
}
