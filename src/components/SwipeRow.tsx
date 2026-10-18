import { useEffect, useRef, useState, type ReactNode } from 'react'
import { IconButton } from './IconButton'
import type { IconName } from './Icon'
import styles from './SwipeRow.module.css'

export type SwipeAction = { icon: IconName; label: string; onAction: () => void; accent?: boolean }

const SLOT = 60 // 동작 버튼 하나의 자리 너비
const FLICK = 0.4 // px/ms — 이보다 빠르게 튕기면 절반을 넘지 않아도 연다/닫는다

type Side = 'start' | 'end' | undefined

/**
 * SwipeRow — 목록의 한 줄을 옆으로 밀면 숨은 동작이 나온다 (iOS 메일처럼).
 * 왼쪽으로 밀면 오른쪽의 `end` 동작(지우기·폴더로), 오른쪽으로 밀면 왼쪽의 `start` 동작(고정).
 * 세로 스크롤은 그대로 두고, 가로로 확실히 민 경우만 잡는다. 열린 상태에서 줄을 누르면 닫힌다.
 *
 * 매끄럽게: 손가락을 따라가는 동안은 React를 다시 그리지 않고 transform만 바꾼다(GPU 합성, 한 프레임에 한 번).
 * React 상태는 열림/닫힘이 바뀔 때만 바뀐다.
 */
export function SwipeRow({ start = [], end = [], children }: { start?: SwipeAction[]; end?: SwipeAction[]; children: ReactNode }) {
  const [open, setOpen] = useState<Side>()
  const rowRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const x = useRef(0)
  const frame = useRef(0)
  const justDragged = useRef(false)
  const drag = useRef<{ x: number; y: number; base: number; horizontal?: boolean; moved: boolean; vx: number; t: number; lastX: number }>()
  const startW = start.length * SLOT
  const endW = end.length * SLOT

  /** 위치를 DOM에 바로 쓴다. 동작 버튼은 드러난 만큼 떠오른다 */
  function paint(next: number, animate: boolean) {
    x.current = next
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const c = contentRef.current
      if (!c) return
      c.classList.toggle(styles.animating, animate)
      c.style.transform = `translate3d(${next}px, 0, 0)`
      reveal(startRef.current, startW ? Math.max(0, next) / startW : 0, animate)
      reveal(endRef.current, endW ? Math.max(0, -next) / endW : 0, animate)
    })
  }

  function snap(side: Side) {
    setOpen(side)
    paint(side === 'start' ? startW : side === 'end' ? -endW : 0, true)
  }

  // 다른 곳을 누르면 닫는다
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rowRef.current?.contains(e.target as Node)) snap(undefined)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  })

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  function down(e: React.PointerEvent) {
    drag.current = { x: e.clientX, y: e.clientY, base: x.current, moved: false, vx: 0, t: e.timeStamp, lastX: e.clientX }
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
    }
    if (!d.horizontal) return
    d.moved = true
    const dt = e.timeStamp - d.t
    if (dt > 0) d.vx = 0.8 * ((e.clientX - d.lastX) / dt) + 0.2 * d.vx
    d.t = e.timeStamp
    d.lastX = e.clientX
    paint(resist(d.base + dx, endW ? -endW : 0, startW), false)
  }
  function up() {
    const d = drag.current
    drag.current = undefined
    if (!d?.moved) return
    justDragged.current = true
    setTimeout(() => (justDragged.current = false), 0)
    const at = x.current
    // 튕긴 방향을 먼저 따르고, 아니면 절반을 넘었는지로
    if (d.vx < -FLICK) snap(at > 0 ? undefined : endW ? 'end' : undefined)
    else if (d.vx > FLICK) snap(at < 0 ? undefined : startW ? 'start' : undefined)
    else snap(at < -endW / 2 && endW ? 'end' : at > startW / 2 && startW ? 'start' : undefined)
  }

  function run(a: SwipeAction) {
    snap(undefined)
    a.onAction()
  }

  return (
    <div ref={rowRef} className={styles.row}>
      {start.length > 0 && (
        <div ref={startRef} className={`${styles.actions} ${styles.start}`} style={{ width: startW }} aria-hidden={open !== 'start'}>
          {start.map((a) => (
            <IconButton key={a.label} icon={a.icon} surface={a.accent ? 'accent' : 'marble'} aria-label={a.label} tabIndex={open === 'start' ? 0 : -1} onClick={() => run(a)} />
          ))}
        </div>
      )}
      {end.length > 0 && (
        <div ref={endRef} className={`${styles.actions} ${styles.end}`} style={{ width: endW }} aria-hidden={open !== 'end'}>
          {end.map((a) => (
            <IconButton key={a.label} icon={a.icon} surface={a.accent ? 'accent' : 'marble'} aria-label={a.label} tabIndex={open === 'end' ? 0 : -1} onClick={() => run(a)} />
          ))}
        </div>
      )}
      <div
        ref={contentRef}
        className={styles.content}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onClickCapture={(e) => {
          // 밀었던 직후의 누름은 무시하고, 열린 줄을 누르면 이동하지 않고 닫는다
          if (justDragged.current || open) {
            e.preventDefault()
            e.stopPropagation()
            if (!justDragged.current) snap(undefined)
          }
        }}
      >
        {children}
      </div>
    </div>
  )
}

/** 범위 밖으로는 고무줄처럼 덜 따라온다 */
function resist(v: number, min: number, max: number) {
  if (v > max) return max + (v - max) * 0.3
  if (v < min) return min + (v - min) * 0.3
  return v
}

function reveal(el: HTMLDivElement | null, amount: number, animate: boolean) {
  if (!el) return
  const a = Math.min(1, amount)
  el.classList.toggle(styles.animating, animate)
  el.style.opacity = String(a)
  el.style.transform = `scale(${0.8 + 0.2 * a})`
}
