import marble from '../assets/marble.jpg'
import type { CardStyle } from './Card'
import styles from './CardStylePicker.module.css'

/** 카드 스타일 고르기 (하늘 · 대리석 · 사진). 단계 2 — 시안에 이름이 없어 코드에서 붙인 이름. */
export function CardStylePicker({ value, photo, onChange }: { value: CardStyle; photo?: string; onChange: (s: CardStyle) => void }) {
  const options: { style: CardStyle; label: string; swatch: React.CSSProperties }[] = [
    { style: 'sky', label: '하늘', swatch: { backgroundImage: 'var(--gradient-sky)' } },
    { style: 'marble', label: '대리석', swatch: { backgroundImage: `url(${marble})` } },
    { style: 'photo', label: '사진', swatch: photo ? { backgroundImage: `url(${photo})` } : {} },
  ]
  return (
    <div className={styles.picker} role="radiogroup" aria-label="카드 스타일">
      {options.map((o) => (
        <button key={o.style} type="button" role="radio" aria-checked={o.style === value} className={styles.option} onClick={() => onChange(o.style)}>
          <span className={`${styles.ring} ${o.style === value ? styles.selected : ''}`}>
            <span className={styles.swatch} style={o.swatch} />
          </span>
          <span className={styles.label}>{o.label}</span>
        </button>
      ))}
    </div>
  )
}
