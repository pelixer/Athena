import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { IconButton } from './IconButton'
import styles from './PhotoViewer.module.css'

export type ViewerItem = { src?: string; index?: string; title?: string; info?: string }

/**
 * 사진 보기 (D6). 두 손가락으로 확대, 확대한 채로 끌어서 이동, 두 번 눌러 2배/원래 크기.
 * 사진이 여럿이면 좌우로 넘기고(위 가운데 "04 / 04", 아래 점), ⓘ로 캡션을 펼친다.
 * 오브제 사진(컬렉션 전체)과 캡션 원본 사진(한 장)에 함께 쓴다.
 */
export function PhotoViewer({ items, start = 0, onClose }: { items: ViewerItem[]; start?: number; onClose: () => void }) {
  const [at, setAt] = useState(start)
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 })
  const [info, setInfo] = useState(false)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ distance: number; scale: number } | null>(null)
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const lastTap = useRef(0)
  const item = items[at]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function go(step: number) {
    const next = Math.min(items.length - 1, Math.max(0, at + step))
    if (next === at) return
    setAt(next)
    setView({ scale: 1, x: 0, y: 0 })
  }

  const distance = () => {
    const [a, b] = [...pointers.current.values()]
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  function down(e: PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) {
      pinch.current = { distance: distance(), scale: view.scale }
      swipe.current = null
    }
    if (pointers.current.size === 1) {
      swipe.current = view.scale === 1 ? { x: e.clientX, y: e.clientY } : null
      const now = Date.now()
      if (now - lastTap.current < 300) setView((v) => (v.scale > 1 ? { scale: 1, x: 0, y: 0 } : { scale: 2, x: 0, y: 0 }))
      lastTap.current = now
    }
  }

  function move(e: PointerEvent) {
    const prev = pointers.current.get(e.pointerId)
    if (!prev) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2 && pinch.current) {
      const scale = Math.min(5, Math.max(1, (pinch.current.scale * distance()) / pinch.current.distance))
      setView((v) => (scale === 1 ? { scale, x: 0, y: 0 } : { ...v, scale }))
    } else if (pointers.current.size === 1 && view.scale > 1) {
      setView((v) => ({ ...v, x: v.x + e.clientX - prev.x, y: v.y + e.clientY - prev.y }))
    }
  }

  function up(e: PointerEvent) {
    const s = swipe.current
    if (s && pointers.current.size === 1) {
      const dx = e.clientX - s.x
      const dy = e.clientY - s.y
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1)
    }
    swipe.current = null
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinch.current = null
  }

  const many = items.length > 1
  return (
    <div className={styles.viewer} role="dialog" aria-modal="true" aria-label={item.title ?? '사진 보기'}>
      <div className={styles.stage} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {item.src && (
          <img
            key={at}
            className={styles.photo}
            src={item.src}
            alt={item.title ?? ''}
            draggable={false}
            style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
          />
        )}
      </div>
      <div className={styles.top}>
        <IconButton icon="close" surface="photo" aria-label="닫기" onClick={onClose} />
        <span className={styles.count}>{many && `${String(at + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`}</span>
        {item.info ? <IconButton icon="info" surface="photo" aria-label="캡션 보기" onClick={() => setInfo((v) => !v)} /> : <span />}
      </div>
      {info && item.info && <p className={styles.info}>{item.info}</p>}
      <div className={styles.bottom}>
        {many && (
          <span className={styles.dots} aria-hidden>
            {items.map((_, i) => (
              <span key={i} className={i === at ? styles.dotOn : styles.dot} />
            ))}
          </span>
        )}
        <span className={styles.caption}>
          {item.index && <span className={styles.index}>{item.index}</span>}
          {item.title && <span className={styles.title}>{item.title}</span>}
        </span>
      </div>
    </div>
  )
}
