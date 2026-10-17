import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db } from '../data/db'
import { useLive, usePhotoUrl } from '../data/hooks'
import { updateNote, updateObje } from '../data/repo'
import { sequenceOf } from '../domain/sequence'
import { parseTagInput } from '../domain/tags'
import { formatDate, formatGeo, formatIndex, formatTimeSeconds } from '../lib/format'
import { Screen } from '../components/Screen'
import { IconButton } from '../components/IconButton'
import { Button } from '../components/Button'
import { MetaTable } from '../components/MetaTable'
import { TagList } from '../components/Tag'
import { DocentBlock } from '../components/DocentBlock'
import { NoteBlock } from '../components/NoteBlock'
import { Sheet } from '../components/Sheet'
import { TextArea, TextField } from '../components/TextField'
import styles from './ObjePage.module.css'

type Editing = 'note' | 'tags' | 'title' | 'docentPhoto' | undefined

/** 02 오브제 상세 · ObjePage */
export function ObjePage() {
  const { objeId = '' } = useParams()
  const navigate = useNavigate()
  const [editing, setEditing] = useState<Editing>()
  const [draft, setDraft] = useState('')
  const close = useCallback(() => setEditing(undefined), [])

  const data = useLive(async () => {
    const obje = await db.objes.get(objeId)
    if (!obje) return null
    const siblings = obje.visitId ? await db.objes.where('visitId').equals(obje.visitId).toArray() : [obje]
    const visit = obje.visitId ? await db.visits.get(obje.visitId) : undefined
    return { obje, visit, index: sequenceOf(siblings).get(obje.id) ?? 1, total: siblings.length }
  }, [objeId])
  const src = usePhotoUrl(data?.obje.photoId)
  const docentSrc = usePhotoUrl(data?.obje.docent?.photoId)

  if (data === undefined) return null
  if (data === null) return <p className={styles.missing}>오브제를 찾을 수 없어요.</p>
  const { obje, visit, index, total } = data

  function edit(what: Editing, initial: string) {
    setDraft(initial)
    setEditing(what)
  }
  async function save() {
    if (editing === 'note') await updateNote(obje.id, draft)
    if (editing === 'title') await updateObje(obje.id, { title: draft.trim() || undefined })
    if (editing === 'tags') await updateObje(obje.id, { tags: [...new Set([...obje.tags, ...parseTagInput(draft)])] })
    close()
  }

  const rows: [string, string][] = [['시각', `${formatDate(obje.takenAt)} ${formatTimeSeconds(obje.takenAt)}`]]
  if (obje.place) rows.push(['장소', obje.place])
  if (obje.location) rows.push(['좌표', formatGeo(obje.location)])

  return (
    <Screen
      top={
        <>
          <IconButton surface="photo" aria-label="뒤로" onClick={() => navigate(visit ? `/visit/${visit.id}` : '/')}>
            ←
          </IconButton>
          <IconButton surface="photo" aria-label="카드 만들기" onClick={() => navigate(`/obje/${obje.id}/card`)}>
            ↗
          </IconButton>
        </>
      }
      bottom={
        <>
          <Button variant="neutral" className={styles.secondary} onClick={() => edit('note', obje.note ?? '')}>
            {obje.note ? '노트 수정' : '노트 쓰기'}
          </Button>
          <Button className={styles.primary} onClick={() => navigate(`/obje/${obje.id}/card`)}>
            카드 만들기
          </Button>
        </>
      }
    >
      <div className={styles.hero} style={src ? { backgroundImage: `url(${src})` } : undefined} />
      <main className={styles.body}>
        <section className={styles.head}>
          <span className={styles.index}>
            {formatIndex(index)} / {String(total).padStart(2, '0')}
          </span>
          <button type="button" className={obje.title ? styles.title : `${styles.title} ${styles.untitled}`} onClick={() => edit('title', obje.title ?? '')}>
            {obje.title ?? '제목 붙이기'}
          </button>
          <MetaTable rows={rows} />
          <TagList tags={obje.tags} onAdd={() => edit('tags', '')} />
        </section>

        {obje.docent && <DocentBlock docent={obje.docent} onShowPhoto={docentSrc ? () => setEditing('docentPhoto') : undefined} />}
        <NoteBlock note={obje.note} updatedAt={obje.noteUpdatedAt} onWrite={() => edit('note', '')} />

        {visit && (
          <Link to={`/visit/${visit.id}`} className={styles.visit}>
            <span className={styles.visitText}>
              <span className={styles.visitLabel}>관람</span>
              <span className={styles.visitTitle}>{visit.title}</span>
            </span>
            <span className={styles.arrow}>→</span>
          </Link>
        )}
      </main>

      <Sheet open={editing === 'note'} title="나의 노트" onClose={close}>
        <TextArea id="note" variant="note" rows={6} autoFocus value={draft} placeholder="이 앞에서 무엇을 느꼈나요?" onChange={(e) => setDraft(e.target.value)} />
        <Button onClick={save}>저장</Button>
      </Sheet>
      <Sheet open={editing === 'title'} title="제목" onClose={close}>
        <TextField id="title" autoFocus value={draft} placeholder="남쪽 해안, 오후 세 시" onChange={(e) => setDraft(e.target.value)} />
        <Button onClick={save}>저장</Button>
      </Sheet>
      <Sheet open={editing === 'tags'} title="라벨 추가" onClose={close}>
        <TextField id="tags" autoFocus value={draft} placeholder="#흰절벽 #바다" onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} />
        <Button onClick={save}>추가</Button>
      </Sheet>
      <Sheet open={editing === 'docentPhoto'} title="도슨트 · 사진" onClose={close}>
        {docentSrc && <img className={styles.docentPhoto} src={docentSrc} alt="설명문 사진" />}
      </Sheet>
    </Screen>
  )
}
