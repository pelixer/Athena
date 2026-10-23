import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db } from '../data/db'
import { useLive, usePhotoUrl, usePhotoUrls } from '../data/hooks'
import { editDocent, updateNote, updateObje } from '../data/repo'
import { sequenceOf } from '../domain/sequence'
import { parseTagInput } from '../domain/tags'
import { docentToText, textToBody } from '../domain/docent'
import { formatDateWeekday, formatGeo, formatIndex, formatTimeSeconds } from '../lib/format'
import { useToast } from '../lib/toast'
import { Screen } from '../components/Screen'
import { IconButton } from '../components/IconButton'
import { MetaTable } from '../components/MetaTable'
import { TagList } from '../components/Tag'
import { DocentBlock } from '../components/DocentBlock'
import { NoteBlock } from '../components/NoteBlock'
import { Field, Sheet } from '../components/Sheet'
import { TextArea, TextField } from '../components/TextField'
import { PhotoViewer } from '../components/PhotoViewer'
import { TagInput } from '../components/TagInput'
import { Icon } from '../components/Icon'
import { DoubleRule } from '../components/Stoa'
import styles from './ObjePage.module.css'

type Editing = 'note' | 'tags' | 'title' | 'docent' | 'docentPhoto' | 'photo' | undefined

/**
 * 02 오브제 · ObjePage (D1–D6) — 사진을 걸고 아래에 작품 라벨을 붙인다.
 * N° 04 / 04 · 시각 → 제목(serif 26) → 이중 박공선 → 표(날짜·장소·좌표) → 라벨 → 캡션 카드 → 나의 노트 → 컬렉션.
 * 위 버튼은 사진 위에서 흰 이중 원, 본문으로 내려오면 하늘 이중 원. 하단 좌대: 노트 쓰기 · 카드 만들기.
 */
export function ObjePage() {
  const { objeId = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [editing, setEditing] = useState<Editing>()
  const [draft, setDraft] = useState('')
  const [draftHeading, setDraftHeading] = useState('')
  const [overPhoto, setOverPhoto] = useState(true)
  const close = useCallback(() => setEditing(undefined), [])

  const data = useLive(async () => {
    const obje = await db.objes.get(objeId)
    if (!obje) return null
    const siblings = obje.visitId ? await db.objes.where('visitId').equals(obje.visitId).toArray() : [obje]
    const visit = obje.visitId ? await db.visits.get(obje.visitId) : undefined
    const order = sequenceOf(siblings)
    return { obje, visit, index: order.get(obje.id) ?? 1, total: siblings.length, siblings: [...siblings].sort((a, b) => order.get(a.id)! - order.get(b.id)!), order }
  }, [objeId])
  const src = usePhotoUrl(data?.obje.photoId)
  const docentSrc = usePhotoUrl(data?.obje.docent?.photoId)
  const siblingSrcs = usePhotoUrls(editing === 'photo' && data ? data.siblings.map((o) => o.photoId) : [])

  // 사진 위에서는 흰 버튼, 본문으로 내려오면 하늘 버튼
  useEffect(() => {
    const onScroll = () => setOverPhoto(window.scrollY < window.innerHeight * 0.5)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 캡션을 읽는 동안에는 몇 초마다 다시 그려 "읽는 중"이 끝났는지 본다
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (data?.obje.docent?.ocr?.state !== 'reading') return
    const t = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(t)
  }, [data?.obje.docent?.ocr?.state])

  if (data === undefined) return null
  if (data === null) return <p className={styles.missing}>오브제를 찾을 수 없어요.</p>
  const { obje, visit, index, total } = data

  function edit(what: Editing, initial: string) {
    setDraft(initial)
    setEditing(what)
  }
  async function save() {
    if (editing === 'note') await updateNote(obje.id, draft)
    if (editing === 'docent') await editDocent(obje.id, draftHeading, draft)
    if (editing === 'title') await updateObje(obje.id, { title: draft.trim() || undefined })
    if (editing === 'tags') await updateObje(obje.id, { tags: [...new Set([...obje.tags, ...parseTagInput(draft)])] })
    close()
  }
  async function share() {
    if (!src) return
    try {
      const blob = await (await fetch(src)).blob()
      const file = new File([blob], `athena-${String(index).padStart(2, '0')}.jpg`, { type: blob.type || 'image/jpeg' })
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: obje.title })
      else navigate(`/obje/${obje.id}/card`)
    } catch (e) {
      if ((e as Error).name !== 'AbortError') toast({ text: '공유하지 못했어요' })
    }
  }

  const rows: [string, string][] = [['날짜', formatDateWeekday(obje.takenAt)]]
  if (obje.place) rows.push(['장소', obje.place])
  if (obje.location) rows.push(['좌표', formatGeo(obje.location)])
  const surface = overPhoto ? 'photo' : 'marble'

  return (
    <Screen
      left={<IconButton icon="back" surface={surface} aria-label="뒤로" onClick={() => navigate(visit ? `/visit/${visit.id}` : '/')} />}
      right={<IconButton icon="share" surface={surface} aria-label="공유하기" onClick={share} />}
      bottom={
        <>
          <IconButton icon="write" size={54} aria-label={obje.note ? '나의 노트 고치기' : '나의 노트 쓰기'} onClick={() => edit('note', obje.note ?? '')} />
          <IconButton icon="card" size={54} aria-label="카드 만들기" firstHint="이 오브제를 공유 카드로 만들어요" onClick={() => navigate(`/obje/${obje.id}/card`)} />
        </>
      }
    >
      <button type="button" className={styles.hero} style={src ? { backgroundImage: `url(${src})` } : undefined} aria-label="사진 크게 보기" onClick={() => src && setEditing('photo')} />
      <main className={styles.body}>
        <section className={styles.label}>
          <div className={styles.indexLine}>
            <span className={styles.index}>
              {formatIndex(index)} <span className={styles.total}>/ {String(total).padStart(2, '0')}</span>
            </span>
            <span className={styles.time}>{formatTimeSeconds(obje.takenAt)}</span>
          </div>
          <button type="button" className={obje.title ? styles.title : `${styles.title} ${styles.untitled}`} onClick={() => edit('title', obje.title ?? '')}>
            {obje.title ?? '제목 붙이기'}
          </button>
          <DoubleRule />
          <MetaTable rows={rows} />
          <TagList tags={obje.tags} onAdd={() => edit('tags', '')} />
        </section>

        {obje.docent && (
          <DocentBlock
            docent={obje.docent}
            now={now}
            onEdit={() => {
              setDraftHeading(obje.docent!.heading ?? '')
              edit('docent', textToBody(obje.docent!.text))
            }}
            onShowPhoto={docentSrc ? () => setEditing('docentPhoto') : undefined}
          />
        )}
        <NoteBlock note={obje.note} updatedAt={obje.noteUpdatedAt} onWrite={() => edit('note', obje.note ?? '')} />

        {visit && (
          <Link to={`/visit/${visit.id}`} className={styles.visit}>
            <span className={styles.visitText}>
              <span className={styles.visitLabel}>컬렉션</span>
              <span className={styles.visitTitle}>{visit.title}</span>
            </span>
            <Icon name="forward" size={22} />
          </Link>
        )}
      </main>

      <Sheet open={editing === 'note'} eyebrow="NOTE" title="나의 노트" onClose={close} confirmLabel="저장" onConfirm={save}>
        <TextArea id="note" variant="note" rows={5} autoFocus value={draft} placeholder="이 앞에서 무엇을 느꼈나요?" onChange={(e) => setDraft(e.target.value)} />
      </Sheet>
      <Sheet open={editing === 'title'} eyebrow="TITLE" title="제목" onClose={close} confirmLabel="저장" onConfirm={save}>
        <TextField id="title" autoFocus value={draft} placeholder="남쪽 해안, 오후 세 시" onChange={(e) => setDraft(e.target.value)} />
      </Sheet>
      <Sheet open={editing === 'tags'} eyebrow="LABEL" title="라벨 추가" description="띄어 쓰면 #이 붙어요." onClose={close} onConfirm={save} confirmLabel="추가">
        <TagInput id="tags" autoFocus value={draft} placeholder="#흰절벽 #바다" onValue={setDraft} onKeyDown={(e) => e.key === 'Enter' && save()} />
      </Sheet>
      <Sheet open={editing === 'docent'} eyebrow="CAPTION" title="캡션 고치기" description="첫 줄은 작가·만든 이, 〈제목〉, 연도." onClose={close} confirmLabel="저장" onConfirm={save}>
        <Field label="첫 줄" htmlFor="docent-heading">
          <span className={styles.headingRow}>
            <TextField id="docent-heading" variant="heading" value={draftHeading} placeholder="작가·만든 이, 〈제목〉, 연도" onChange={(e) => setDraftHeading(e.target.value)} />
            {docentSrc && <img className={styles.docentThumb} src={docentSrc} alt="캡션 사진" />}
          </span>
        </Field>
        <Field label="본문" htmlFor="docent">
          <TextArea id="docent" rows={4} autoFocus value={draft} placeholder="캡션 · 문단 사이는 빈 줄" onChange={(e) => setDraft(e.target.value)} />
        </Field>
      </Sheet>
      {editing === 'docentPhoto' && docentSrc && <PhotoViewer items={[{ src: docentSrc, index: formatIndex(index), title: '캡션 원본' }]} onClose={close} />}
      {editing === 'photo' && (
        <PhotoViewer
          items={data.siblings.map((o, i) => ({ src: siblingSrcs[i], index: formatIndex(data.order.get(o.id)!), title: o.title, info: o.docent ? docentToText(o.docent) : undefined }))}
          start={data.siblings.findIndex((o) => o.id === obje.id)}
          onClose={close}
        />
      )}
    </Screen>
  )
}
