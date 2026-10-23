import { useRef, useState, type CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../data/db'
import { useLive, usePhotoUrl } from '../data/hooks'
import { sequenceOf } from '../domain/sequence'
import { formatDate, formatIndex } from '../lib/format'
import { renderCard, saveCard, shareCard } from '../lib/cardExport'
import { useToast } from '../lib/toast'
import { Screen } from '../components/Screen'
import { IconButton } from '../components/IconButton'
import { DownloadSheet } from '../components/DownloadSheet'
import { Card, CARD_BGS, MARBLE_SRC, type CardBg, type CardField, type CardStyle } from '../components/Card'
import { CardStylePicker } from '../components/CardStylePicker'
import { OptionChip } from '../components/OptionChip'
import styles from './CardPage.module.css'

const FIELDS: { field: CardField; label: string }[] = [
  { field: 'note', label: '나의 노트' },
  { field: 'meta', label: '날짜 · 장소' },
  { field: 'docent', label: '캡션' },
  { field: 'tags', label: '라벨' },
]

/**
 * 04 공유 카드 · CardPage (v2.3 E1–E3). 벽(대리석 50) 위에 카드를 걸고,
 * 아래로 스타일 4종 · 바탕 5종 · 항목 칩. 하단 좌대: 저장(→ E3 확인 시트) · 공유.
 */
export function CardPage() {
  const { objeId = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const cardRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<CardStyle>('sky')
  const [bg, setBg] = useState<CardBg>()
  const [fields, setFields] = useState<Set<CardField>>(new Set(['note', 'meta']))
  const [pending, setPending] = useState<Blob>()
  const [busy, setBusy] = useState(false)

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
  function pickStyle(s: CardStyle) {
    setStyle(s)
    setBg(undefined)
  }
  // 바탕은 하늘·대리석 배치(사진 위 · 글 아래)에 깐다
  function pickBg(b: CardBg | undefined) {
    setBg(b)
    if (b && (style === 'photo' || style === 'plate')) setStyle('sky')
  }

  async function exportCard(action: 'save' | 'share') {
    if (!cardRef.current) return
    setBusy(true)
    try {
      const blob = await renderCard(cardRef.current)
      // 저장은 먼저 묻는다. 다운로드는 시트의 ✓를 누르는 순간 일어난다 (DownloadSheet)
      if (action === 'save') setPending(blob)
      else if ((await shareCard(blob, filename)) === 'saved') toast({ text: '카드를 저장했어요', kind: 'done' })
    } catch (e) {
      if ((e as Error).name !== 'AbortError') toast({ text: '카드를 만들지 못했어요' })
    } finally {
      setBusy(false)
    }
  }

  const bgSrc = CARD_BGS.find((b) => b.bg === bg)?.src
  const preview: CSSProperties = bgSrc
    ? { backgroundImage: `url(${bgSrc})` }
    : style === 'sky'
      ? { backgroundImage: 'var(--gradient-sky)' }
      : style === 'marble'
        ? { backgroundImage: `url(${MARBLE_SRC})` }
        : style === 'photo' && photo
          ? { backgroundImage: `var(--gradient-photo), url(${photo})` }
          : {}

  return (
    <Screen
      tone="wall"
      left={<IconButton icon="close" aria-label="닫기" onClick={() => navigate(`/obje/${obje.id}`)} />}
      title="카드 만들기"
      bottom={
        <>
          <IconButton icon="save" size={54} aria-label="저장" disabled={busy} onClick={() => exportCard('save')} />
          <IconButton icon="share" size={54} aria-label="공유하기" disabled={busy} onClick={() => exportCard('share')} />
        </>
      }
    >
      <main className={styles.page}>
        <Card
          ref={cardRef}
          style={style}
          bg={bg}
          fields={fields}
          photo={photo}
          note={obje.note}
          index={formatIndex(index)}
          date={formatDate(obje.takenAt)}
          place={obje.place}
          title={obje.title}
          docentHeading={obje.docent?.heading}
          tags={obje.tags}
        />
        <CardStylePicker value={style} bg={bg} photo={photo} onChange={pickStyle} onBg={pickBg} />
        <div className={styles.options}>
          {FIELDS.map(({ field, label }) => (
            <OptionChip key={field} label={label} on={fields.has(field)} onToggle={() => toggle(field)} />
          ))}
        </div>
      </main>
      <DownloadSheet
        filename={pending && filename}
        preview={preview}
        onDownload={() => {
          if (pending) saveCard(pending, filename)
          setPending(undefined)
          toast({ text: '카드를 저장했어요', kind: 'done' })
        }}
        onClose={() => setPending(undefined)}
      />
    </Screen>
  )
}
