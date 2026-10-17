import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { addObje } from '../data/repo'
import { parseTags } from '../domain/tags'
import { readPhotoMeta } from '../lib/photoMeta'
import { Page } from '../components/Page'
import { Button } from '../components/Button'
import { TagList } from '../components/TagChip'
import styles from './pages.module.css'

/** 촬영: 오브제 사진 + (선택) 도슨트 사진/텍스트 + #라벨 + 나의 노트 */
export function CapturePage() {
  const { visitId = null } = useParams()
  const navigate = useNavigate()
  const [photo, setPhoto] = useState<File>()
  const [docentPhoto, setDocentPhoto] = useState<File>()
  const [docentText, setDocentText] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const tags = parseTags(tagInput)

  async function save() {
    if (!photo) return
    setSaving(true)
    const meta = await readPhotoMeta(photo)
    const hasDocent = docentPhoto || docentText.trim()
    const obje = await addObje({
      visitId,
      photo,
      ...meta,
      tags,
      note: note.trim() || undefined,
      // TODO(OCR): 도슨트 사진에서 텍스트 자동 추출. 지금은 직접 입력.
      docent: hasDocent ? { photo: docentPhoto, text: docentText.trim() } : undefined,
    })
    navigate(`/obje/${obje.id}`)
  }

  return (
    <Page title="새 오브제" back={visitId ? `/visit/${visitId}` : '/'}>
      <label className={styles.field}>
        <span>오브제 사진</span>
        <input type="file" accept="image/*" capture="environment" onChange={(e) => setPhoto(e.target.files?.[0])} />
      </label>
      <label className={styles.field}>
        <span>도슨트 사진 (선택)</span>
        <input type="file" accept="image/*" capture="environment" onChange={(e) => setDocentPhoto(e.target.files?.[0])} />
      </label>
      <label className={styles.field}>
        <span>도슨트 텍스트</span>
        <textarea rows={4} value={docentText} onChange={(e) => setDocentText(e.target.value)} />
      </label>
      <label className={styles.field}>
        <span>#라벨</span>
        <input placeholder="#데이비드호크니 #다이빙" value={tagInput} onChange={(e) => setTagInput(e.target.value)} />
        <TagList tags={tags} />
      </label>
      <label className={styles.field}>
        <span>나의 노트</span>
        <textarea rows={4} placeholder="이 작품 앞에서 느낀 것" value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <Button disabled={!photo || saving} onClick={save}>
        저장
      </Button>
    </Page>
  )
}
