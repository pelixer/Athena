import { useEffect, useRef, useState, type ButtonHTMLAttributes } from 'react'
import { Icon, type IconName } from './Icon'
import styles from './IconButton.module.css'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** marble: 대리석 위 하늘 이중 원 · photo: 사진·어두운 바탕 위 흰 이중 원 */
  surface?: 'marble' | 'photo'
  size?: 40 | 44 | 52 | 54
  icon: IconName
  'aria-label': string
  /** 앱 고유 동작(입장권·카드·고정)의 첫 사용 안내. 기기마다 한 번만 뜬다 */
  firstHint?: string
}

const HOLD = 400 // 길게 누르면 이 시간 뒤에 이름 말풍선
const SHOW = 1500

/**
 * IconButton — v2.3 "하늘 이중 원" (Athena Button Explorations 1b).
 * 바탕·글자·점 없이 1px 원 두 개(사이 3.5px, 속은 비움) + 아이콘 하나. 두 원은 SVG로 그린다 (R3: box-shadow는 띠처럼 굵어 보였다).
 * 길게 누르면 aria-label이 말풍선으로 뜬다(누름은 실행되지 않는다).
 */
export function IconButton({ surface = 'marble', size = 44, icon, className, type = 'button', firstHint, onClick, onPointerDown, onPointerUp, onPointerLeave, onPointerCancel, ...rest }: Props) {
  const [bubble, setBubble] = useState<'name' | 'hint'>()
  const timer = useRef<number>()
  const held = useRef(false)
  const label = rest['aria-label']

  useEffect(() => {
    if (!firstHint) return
    const key = `athena.hint.${label}`
    try {
      if (localStorage.getItem(key)) return
      localStorage.setItem(key, '1')
    } catch {
      return
    }
    setBubble('hint')
    const t = window.setTimeout(() => setBubble(undefined), 4000)
    return () => clearTimeout(t)
  }, [firstHint, label])

  useEffect(() => () => clearTimeout(timer.current), [])

  function cancelHold() {
    clearTimeout(timer.current)
  }

  return (
    <span className={styles.wrap}>
      {bubble && (
        <span className={bubble === 'hint' ? styles.hint : styles.name} role="tooltip">
          {bubble === 'hint' ? firstHint : label}
        </span>
      )}
      <button
        type={type}
        className={[styles.icon, styles[surface], styles[`s${size}`], className].filter(Boolean).join(' ')}
        onPointerDown={(e) => {
          held.current = false
          cancelHold()
          timer.current = window.setTimeout(() => {
            held.current = true
            setBubble('name')
            timer.current = window.setTimeout(() => setBubble(undefined), SHOW)
          }, HOLD)
          onPointerDown?.(e)
        }}
        onPointerUp={(e) => {
          if (!held.current) cancelHold()
          onPointerUp?.(e)
        }}
        onPointerLeave={(e) => {
          if (!held.current) cancelHold()
          onPointerLeave?.(e)
        }}
        onPointerCancel={(e) => {
          if (!held.current) cancelHold()
          onPointerCancel?.(e)
        }}
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => {
          // 길게 눌러 이름을 본 것은 누름이 아니다
          if (held.current) {
            held.current = false
            e.preventDefault()
            return
          }
          if (bubble === 'hint') setBubble(undefined)
          onClick?.(e)
        }}
        {...rest}
      >
        <svg className={styles.ring} viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true" focusable="false">
          <circle cx={size / 2} cy={size / 2} r={size / 2 - 0.5} />
          <circle cx={size / 2} cy={size / 2} r={size / 2 - 4.5} />
        </svg>
        <Icon name={icon} size={size === 54 ? 24 : 22} />
      </button>
    </span>
  )
}
