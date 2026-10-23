import { useEffect, useState } from 'react'
import { Field, Sheet } from './Sheet'
import { TextField } from './TextField'

/**
 * 새 컬렉션 (A5) · 이름·장소 고치기 (B4)에 함께 쓴다. 이름(필수)과 장소(선택).
 */
export function NewCollectionSheet({
  open,
  initial,
  onClose,
  onStart,
}: {
  open: boolean
  /** 있으면 고치기 시트 */
  initial?: { title: string; venue?: string }
  onClose: () => void
  onStart: (title: string, venue?: string) => void
}) {
  const [title, setTitle] = useState('')
  const [venue, setVenue] = useState('')
  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '')
      setVenue(initial?.venue ?? '')
    }
  }, [open, initial?.title, initial?.venue])
  const start = () => title.trim() && onStart(title.trim(), venue.trim() || undefined)
  return (
    <Sheet
      open={open}
      eyebrow={initial ? 'COLLECTION' : 'NEW'}
      title={initial ? '이름·장소 고치기' : '새 컬렉션'}
      description={initial ? undefined : '전시가 아니어도 좋아요. 모으고 싶은 주제를 이름으로.'}
      confirmLabel={initial ? '저장' : '시작'}
      confirmDisabled={!title.trim()}
      onConfirm={start}
      onClose={onClose}
    >
      <Field label="이름" htmlFor="visit-title">
        <TextField id="visit-title" autoFocus placeholder="호크니 전, 교토의 오후, 오늘의 빛" value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="장소 · 선택" htmlFor="visit-venue">
        <TextField id="visit-venue" placeholder="국립현대미술관 서울" value={venue} onChange={(e) => setVenue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && start()} />
      </Field>
    </Sheet>
  )
}
