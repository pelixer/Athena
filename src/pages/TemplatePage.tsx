import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../data/db'
import { useLive, usePhotoUrls } from '../data/hooks'
import { sequenceOf } from '../domain/sequence'
import { defaultTemplateSelection, selectedInOrder, togglePick } from '../domain/template'
import { visitSpan, visitStats } from '../domain/visitStats'
import type { ID } from '../domain/types'
import { formatCount, formatDate, formatDateWeekday, formatIndex, formatTime } from '../lib/format'
import { renderTemplate, saveCard, shareCard } from '../lib/cardExport'
import { useToast } from '../lib/toast'
import { Screen } from '../components/Screen'
import { IconButton } from '../components/IconButton'
import { Icon } from '../components/Icon'
import { Toggle } from '../components/Toggle'
import { Sheet } from '../components/Sheet'
import { DownloadSheet } from '../components/DownloadSheet'
import { ObjePickGrid } from '../components/ObjePickGrid'
import { TemplateTicket } from '../components/TemplateTicket'
import styles from './TemplatePage.module.css'

/**
 * 05 입장권 · TemplatePage (v2.3 E4–E5) — 컬렉션을 마치며 남기는 9:16 한 장.
 * 입장권 아래 설정 두 줄: 오브제(고르기 시트 E5) · 나의 노트 켜기. 고른 순서의 1번이 그루터기의 노트·표지가 된다.
 */
export function TemplatePage() {
  const { visitId = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const ticketRef = useRef<HTMLDivElement>(null)
  const [objeIds, setObjeIds] = useState<ID[]>()
  const [showNote, setShowNote] = useState(true)
  const [picking, setPicking] = useState(false)
  const [draft, setDraft] = useState<ID[]>([])
  const [pending, setPending] = useState<Blob>()
  const [busy, setBusy] = useState(false)
  const close = useCallback(() => setPicking(false), [])

  const data = useLive(async () => {
    const visit = await db.visits.get(visitId)
    const objes = await db.objes.where('visitId').equals(visitId).toArray()
    return { visit, objes }
  }, [visitId])

  useEffect(() => {
    if (data && !objeIds) setObjeIds(defaultTemplateSelection(data.objes))
  }, [data, objeIds])

  const objes = data?.objes ?? []
  const index = sequenceOf(objes)
  const chosen = selectedInOrder(objes, objeIds ?? [])
  const cover = chosen[0]
  const thumbUrls = usePhotoUrls(chosen.slice(0, 4).map((o) => o.photoId))
  const allUrls = usePhotoUrls(picking ? objes.map((o) => o.photoId) : [])

  if (!data) return null
  const { visit } = data
  if (!visit) return <p className={styles.missing}>컬렉션을 찾을 수 없어요.</p>

  const stats = visitStats(objes)
  const span = visitSpan(objes, visit.endedAt)
  const indexes = chosen.map((o) => index.get(o.id)!)
  const range = indexes.length ? `${formatIndex(Math.min(...indexes))}—${formatCount(Math.max(...indexes))}` : 'N° —'
  const rows: [string, string][] = [['날짜', formatDateWeekday(visit.startedAt)]]
  if (span) rows.push(['시간', `${formatTime(span.start)} — ${formatTime(span.end)}`])
  if (visit.venue) rows.push(['장소', visit.venue])
  rows.push(['기록', `오브제 ${formatCount(stats.objes)} · 캡션 ${formatCount(stats.docents)} · 노트 ${formatCount(stats.notes)}`])
  const coverIndex = cover ? index.get(cover.id) : undefined
  const filename = `athena-${formatDate(visit.startedAt).replaceAll('.', '')}-ticket.png`

  function openPicker() {
    setDraft(objeIds ?? [])
    setPicking(true)
  }

  async function exportTicket(action: 'save' | 'share') {
    if (!ticketRef.current) return
    setBusy(true)
    try {
      const blob = await renderTemplate(ticketRef.current)
      // 저장은 먼저 묻는다. 다운로드는 시트의 ✓를 누르는 순간 일어난다 (DownloadSheet)
      if (action === 'save') setPending(blob)
      else if ((await shareCard(blob, filename)) === 'saved') toast({ text: '입장권을 저장했어요', kind: 'done' })
    } catch (e) {
      if ((e as Error).name !== 'AbortError') toast({ text: '입장권을 만들지 못했어요' })
    } finally {
      setBusy(false)
    }
  }

  // E5: 최근 순번부터
  const pickItems = objes
    .map((o, i) => ({ id: o.id, src: allUrls[i], index: index.get(o.id)!, order: draft.indexOf(o.id) + 1 || undefined }))
    .sort((a, b) => b.index - a.index)

  return (
    <Screen
      tone="wall"
      left={<IconButton icon="close" aria-label="닫기" onClick={() => navigate(`/visit/${visit.id}`)} />}
      title="입장권 만들기"
      bottom={
        <>
          <IconButton icon="save" size={54} aria-label="저장" disabled={busy || !chosen.length} onClick={() => exportTicket('save')} />
          <IconButton icon="share" size={54} aria-label="공유하기" disabled={busy || !chosen.length} onClick={() => exportTicket('share')} />
        </>
      }
    >
      <main className={styles.page}>
        <div className={styles.preview}>
          <TemplateTicket
            ref={ticketRef}
            title={visit.title}
            rows={rows}
            range={range}
            thumbs={thumbUrls}
            note={showNote ? cover?.note : undefined}
            noteLabel={coverIndex ? `${formatIndex(coverIndex)} · 나의 노트` : undefined}
          />
          <span className={styles.format}>9:16 · 1080×1920</span>
        </div>
        <div className={styles.settings}>
          <button type="button" className={styles.setting} onClick={openPicker}>
            <span className={styles.settingName}>오브제</span>
            <span className={styles.settingValue}>
              {formatCount(chosen.length)} / {formatCount(objes.length)}
              <Icon name="forward" size={18} />
            </span>
          </button>
          <div className={`${styles.setting} ${styles.settingToggle}`}>
            <span className={styles.settingName}>나의 노트{coverIndex ? ` · ${formatIndex(coverIndex)}` : ''}</span>
            <Toggle on={showNote} label="나의 노트 넣기" onChange={setShowNote} />
          </div>
        </div>
      </main>

      <Sheet
        open={picking}
        eyebrow="SELECT"
        title="입장권에 넣을 오브제"
        description="누른 순서대로 놓여요. 1번이 노트의 오브제예요."
        onClose={close}
        onConfirm={() => {
          setObjeIds(draft)
          close()
        }}
        confirmLabel={`${draft.length}점 넣기`}
        confirmDisabled={!draft.length}
      >
        <ObjePickGrid items={pickItems} onToggle={(id) => setDraft((d) => togglePick(d, id))} />
      </Sheet>
      <DownloadSheet
        title="입장권을 저장할까요?"
        filename={pending && filename}
        size="1080 × 1920"
        preview={{ backgroundImage: 'var(--gradient-sky)' }}
        onDownload={() => {
          if (pending) saveCard(pending, filename)
          setPending(undefined)
          toast({ text: '입장권을 저장했어요', kind: 'done' })
        }}
        onClose={() => setPending(undefined)}
      />
    </Screen>
  )
}
