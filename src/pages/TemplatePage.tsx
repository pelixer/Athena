import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../data/db'
import { useLive, usePhotoUrls } from '../data/hooks'
import { sequenceOf } from '../domain/sequence'
import { defaultTemplateSelection, selectedInOrder } from '../domain/template'
import { visitSpan, visitStats } from '../domain/visitStats'
import type { ID } from '../domain/types'
import { formatCount, formatDate, formatDateWeekday, formatDuration, formatIndex, formatTime } from '../lib/format'
import { renderTemplate, saveCard, shareCard } from '../lib/cardExport'
import { Screen } from '../components/Screen'
import { IconButton } from '../components/IconButton'
import { Button } from '../components/Button'
import { OptionChip } from '../components/OptionChip'
import { Sheet } from '../components/Sheet'
import { ObjePickGrid } from '../components/ObjePickGrid'
import { TemplateTicket } from '../components/TemplateTicket'
import styles from './TemplatePage.module.css'

type Picking = 'objes' | 'cover' | undefined

/**
 * 05 템플릿 · TemplatePage — 관람을 마치며 남기는 산출물. 지금은 1b 입장권 하나 (사용자 결정).
 * 도록(1a)·벽면(1c) 시안은 design/source/v1에 있고, TemplatePicker는 형식이 둘 이상이 될 때 붙인다.
 */
export function TemplatePage() {
  const { visitId = '' } = useParams()
  const navigate = useNavigate()
  const ticketRef = useRef<HTMLDivElement>(null)
  const [objeIds, setObjeIds] = useState<ID[]>()
  const [coverId, setCoverId] = useState<ID>()
  const [showNote, setShowNote] = useState(true)
  const [picking, setPicking] = useState<Picking>()
  const [draft, setDraft] = useState<ID[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const close = useCallback(() => setPicking(undefined), [])

  const data = useLive(async () => {
    const visit = await db.visits.get(visitId)
    const objes = await db.objes.where('visitId').equals(visitId).toArray()
    return { visit, objes }
  }, [visitId])

  useEffect(() => {
    if (!data || objeIds) return
    const d = defaultTemplateSelection(data.objes)
    setObjeIds(d.objeIds)
    setCoverId(d.coverId)
  }, [data, objeIds])

  const objes = data?.objes ?? []
  const index = sequenceOf(objes)
  const chosen = selectedInOrder(objes, objeIds ?? [])
  const cover = objes.find((o) => o.id === coverId)
  const thumbUrls = usePhotoUrls(chosen.slice(0, 4).map((o) => o.photoId))
  const allUrls = usePhotoUrls(objes.map((o) => o.photoId))

  if (!data) return null
  const { visit } = data
  if (!visit) return <p className={styles.missing}>관람을 찾을 수 없어요.</p>

  const stats = visitStats(objes)
  const span = visitSpan(objes, visit.endedAt)
  const indexes = chosen.map((o) => index.get(o.id)!)
  const range = indexes.length ? `${formatIndex(Math.min(...indexes))}—${formatCount(Math.max(...indexes))}` : 'No.—'
  const rows: [string, string][] = [['날짜', formatDateWeekday(visit.startedAt)]]
  if (span) rows.push(['시간', `${formatTime(span.start)} — ${formatTime(span.end)} · ${formatDuration(span.end - span.start)}`])
  if (visit.venue) rows.push(['장소', visit.venue])
  rows.push(['기록', `오브제 ${formatCount(stats.objes)} · 도슨트 ${formatCount(stats.docents)} · 노트 ${formatCount(stats.notes)}`])
  const coverIndex = cover ? index.get(cover.id) : undefined
  const filename = `athena-${formatDate(visit.startedAt).replaceAll('.', '')}-ticket.png`

  function openPicker(what: Picking) {
    setDraft(what === 'objes' ? (objeIds ?? []) : coverId ? [coverId] : [])
    setPicking(what)
  }
  function confirmPick() {
    if (picking === 'objes') {
      setObjeIds(draft)
      if (coverId && !draft.includes(coverId)) setCoverId(selectedInOrder(objes, draft).find((o) => o.note?.trim())?.id ?? draft[0])
    } else setCoverId(draft[0])
    close()
  }

  async function exportTicket(action: 'save' | 'share') {
    if (!ticketRef.current) return
    setBusy(true)
    setError(undefined)
    try {
      const blob = await renderTemplate(ticketRef.current)
      if (action === 'save') saveCard(blob, filename)
      else await shareCard(blob, filename)
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError('입장권을 만들지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  const pickItems = objes
    .map((o, i) => ({ id: o.id, src: allUrls[i], index: index.get(o.id)!, selected: draft.includes(o.id) }))
    .sort((a, b) => a.index - b.index)
  const coverChoices = pickItems.filter((it) => objeIds?.includes(it.id))

  return (
    <Screen
      tone="sunken"
      top={
        <>
          <IconButton surface="marble" aria-label="닫기" onClick={() => navigate(`/visit/${visit.id}`)}>
            ×
          </IconButton>
          <span className={styles.heading}>템플릿 만들기</span>
          <span className={styles.balance} />
        </>
      }
      bottom={
        <>
          <Button variant="neutral" className={styles.secondary} disabled={busy || !chosen.length} onClick={() => exportTicket('save')}>
            저장
          </Button>
          <Button className={styles.primary} disabled={busy || !chosen.length} onClick={() => exportTicket('share')}>
            공유하기
          </Button>
        </>
      }
    >
      <main className={styles.page}>
        <div className={styles.preview}>
          <div className={styles.scale}>
            <TemplateTicket
              ref={ticketRef}
              title={visit.title}
              rows={rows}
              range={range}
              thumbs={thumbUrls}
              note={showNote ? cover?.note : undefined}
              noteLabel={coverIndex ? `${formatIndex(coverIndex)} · 나의 노트` : undefined}
            />
          </div>
        </div>
        <span className={styles.format}>9:16 · 스토리 1장</span>
        <div className={styles.options}>
          <OptionChip label={`오브제 ${chosen.length} / ${objes.length}`} on onToggle={() => openPicker('objes')} />
          <OptionChip label={coverIndex ? `표지 ${formatIndex(coverIndex)}` : '표지'} on={false} onToggle={() => openPicker('cover')} />
          <OptionChip label="나의 노트" on={showNote} onToggle={() => setShowNote((v) => !v)} />
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </main>

      <Sheet
        open={picking === 'objes'}
        title="오브제 고르기 · 앞의 4점이 입장권에 실려요"
        onClose={close}
        onConfirm={confirmPick}
        confirmLabel={`${draft.length}점 고르기`}
        confirmDisabled={!draft.length}
      >
        <ObjePickGrid items={pickItems} onToggle={(id) => setDraft((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]))} />
      </Sheet>
      <Sheet open={picking === 'cover'} title="표지 · 이 오브제의 나의 노트가 그루터기에 실려요" onClose={close} onConfirm={confirmPick} confirmLabel="표지로">
        <ObjePickGrid items={coverChoices.map((it) => ({ ...it, selected: draft.includes(it.id) }))} onToggle={(id) => setDraft([id])} />
      </Sheet>
    </Screen>
  )
}
