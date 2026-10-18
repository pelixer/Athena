import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { IconButton } from './IconButton'
import styles from './PhotoViewer.module.css'

/**
 * 사진 전체 화면 뷰어 (R9). 두 손가락으로 확대, 확대한 채로 끌어서 이동, 두 번 눌러 2배/원래 크기.
 * 오브제 사진과 도슨트 원본 사진에 함께 쓴다.
 */
export function PhotoViewer({ src, caption, onClose }: { src: string; caption: string; onClose: () => void }) {
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 })
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ distance: number; scale: number } | null>(null)
  const lastTap = useRef(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const distance = () => {
    const [a, b] = [...pointers.current.values()]
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  function down(e: PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) pinch.current = { distance: distance(), scale: view.scale }
    if (pointers.current.size === 1) {
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
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinch.current = null
  }

  return (
    <div className={styles.viewer} role="dialog" aria-modal="true" aria-label={caption}>
      <div className={styles.stage} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <img
          className={styles.photo}
          src={src}
          alt={caption}
          draggable={false}
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
        />
      </div>
      <div className={styles.close}>
        <IconButton surface="photo" aria-label="닫기" onClick={onClose}>
          ×
        </IconButton>
      </div>
      <p className={styles.caption}>{caption}</p>
    </div>
  )
}
