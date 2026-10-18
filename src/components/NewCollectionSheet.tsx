import { useEffect, useState } from 'react'
import { Sheet } from './Sheet'
import { TextField } from './TextField'

/** 새 컬렉션 — 이름(필수)과 장소(선택). 전시만이 아니라 여행·하루·좋아하는 것들의 묶음도. */
export function NewCollectionSheet({ open, onClose, onStart }: { open: boolean; onClose: () => void; onStart: (title: string, venue?: string) => void }) {
  const [title, setTitle] = useState('')
  const [venue, setVenue] = useState('')
  useEffect(() => {
    if (open) {
      setTitle('')
      setVenue('')
    }
  }, [open])
  const start = () => title.trim() && onStart(title.trim(), venue.trim() || undefined)
  return (
    <Sheet open={open} title="새 컬렉션" onClose={onClose} onConfirm={start} confirmLabel="시작" confirmDisabled={!title.trim()}>
      <TextField id="visit-title" autoFocus placeholder="이름 — 호크니 전, 교토의 오후, 오늘의 빛" value={title} onChange={(e) => setTitle(e.target.value)} />
      <TextField id="visit-venue" placeholder="장소 (선택) — 국립현대미술관 서울" value={venue} onChange={(e) => setVenue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && start()} />
    </Sheet>
  )
}
