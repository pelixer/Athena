import { useEffect, useRef, useState, type ReactNode } from 'react'
import { IconButton } from './IconButton'
import type { IconName } from './Icon'
import styles from './SwipeRow.module.css'

export type SwipeAction = { icon: IconName; label: string; onAction: () => void; accent?: boolean }

const SLOT = 60 // 동작 버튼 하나의 자리 너비

/**
 * SwipeRow — 목록의 한 줄을 옆으로 밀면 숨은 동작이 나온다 (iOS 메일처럼).
 * 왼쪽으로 밀면 오른쪽의 `end` 동작(지우기·폴더로), 오른쪽으로 밀면 왼쪽의 `start` 동작(고정).
 * 세로 스크롤은 그대로 두고, 가로로 확실히 민 경우만 잡는다. 열린 상태에서 줄을 누르면 닫힌다.
 */
export function SwipeRow({ start = [], end = [], children }: { start?: SwipeAction[]; end?: SwipeAction[]; children: ReactNode }) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const rowRef = useRef<HTMLDivElement>(null)
  const justDragged = useRef(false)
  const drag = useRef<{ x: number; y: number; base: number; horizontal?: boolean; moved: boolean }>()
  const startW = start.length * SLOT
  const endW = end.length * SLOT

  // 다른 곳을 누르면 닫는다
  useEffect(() => {
    if (!offset) return
    const onDown = (e: PointerEvent) => {
      if (!rowRef.current?.contains(e.target as Node)) setOffset(0)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [offset])

  function down(e: React.PointerEvent) {
    drag.current = { x: e.clientX, y: e.clientY, base: offset, moved: false }
  }
  function move(e: React.PointerEvent) {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (d.horizontal === undefined) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      d.horizontal = Math.abs(dx) > Math.abs(dy)
      if (!d.horizontal) return
      e.currentTarget.setPointerCapture(e.pointerId)
      setDragging(true)
    }
    if (!d.horizontal) return
    d.moved = true
    const next = d.base + dx
    // 동작이 없는 쪽으로는 조금만 따라오다 멈춘다
    const min = endW ? -endW - 24 : -12
    const max = startW ? startW + 24 : 12
    setOffset(Math.max(min, Math.min(max, next)))
  }
  function up() {
    const d = drag.current
    drag.current = undefined
    setDragging(false)
    if (!d?.moved) return
    justDragged.current = true
    setTimeout(() => (justDragged.current = false), 0)
    setOffset((o) => (o < -endW / 2 && endW ? -endW : o > startW / 2 && startW ? startW : 0))
  }

  function run(a: SwipeAction) {
    setOffset(0)
    a.onAction()
  }

  return (
    <div ref={rowRef} className={styles.row}>
      {start.length > 0 && (
        <div className={`${styles.actions} ${styles.start}`} style={{ width: startW }} aria-hidden={offset <= 0}>
          {start.map((a) => (
            <IconButton key={a.label} icon={a.icon} surface={a.accent ? 'accent' : 'marble'} aria-label={a.label} tabIndex={offset > 0 ? 0 : -1} onClick={() => run(a)} />
          ))}
        </div>
      )}
      {end.length > 0 && (
        <div className={`${styles.actions} ${styles.end}`} style={{ width: endW }} aria-hidden={offset >= 0}>
          {end.map((a) => (
            <IconButton key={a.label} icon={a.icon} surface={a.accent ? 'accent' : 'marble'} aria-label={a.label} tabIndex={offset < 0 ? 0 : -1} onClick={() => run(a)} />
          ))}
        </div>
      )}
      <div
        className={`${styles.content} ${dragging ? styles.dragging : ''}`}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onClickCapture={(e) => {
          // 밀었던 직후의 누름, 또는 열린 줄을 누른 것은 이동이 아니라 닫기
          if (justDragged.current || offset) {
            e.preventDefault()
            e.stopPropagation()
            if (!justDragged.current) setOffset(0)
          }
        }}
      >
        {children}
      </div>
    </div>
  )
}
