import { CARD_BGS, MARBLE_SRC, type CardBg, type CardStyle } from './Card'
import styles from './CardStylePicker.module.css'

/**
 * 카드 스타일 고르기 (v2.3 E1): 하늘 · 대리석 · 사진 · 도록 52 원(고른 것 = 먹 2px 테 + 600 글자),
 * 아래 "바탕" 줄에 텍스처 5종 30 원(고른 것 = 하늘 이중 원). 같은 바탕을 다시 누르면 바탕 없음.
 */
export function CardStylePicker({
  value,
  bg,
  photo,
  onChange,
  onBg,
}: {
  value: CardStyle
  bg?: CardBg
  photo?: string
  onChange: (s: CardStyle) => void
  onBg: (bg: CardBg | undefined) => void
}) {
  const options: { style: CardStyle; label: string; swatch: React.CSSProperties }[] = [
    { style: 'sky', label: '하늘', swatch: { backgroundImage: 'var(--gradient-sky)' } },
    { style: 'marble', label: '대리석', swatch: { backgroundImage: `url(${MARBLE_SRC})` } },
    { style: 'photo', label: '사진', swatch: photo ? { backgroundImage: `url(${photo})`, backgroundPosition: '50% 45%' } : {} },
    { style: 'plate', label: '도록', swatch: { background: 'var(--bg-base)' } },
  ]
  return (
    <div className={styles.wrap}>
      <div className={styles.picker} role="radiogroup" aria-label="카드 스타일">
        {options.map((o) => {
          const on = o.style === value && !bg
          return (
            <button key={o.style} type="button" role="radio" aria-checked={on} className={styles.option} onClick={() => onChange(o.style)}>
              <span className={`${styles.ring} ${on ? styles.selected : ''}`}>
                <span className={styles.swatch} style={o.swatch}>
                  {o.style === 'plate' && <span className={styles.plate} style={photo ? { backgroundImage: `url(${photo})` } : undefined} />}
                </span>
              </span>
              <span className={on ? styles.labelOn : styles.label}>{o.label}</span>
            </button>
          )
        })}
      </div>
      <div className={styles.bgs} role="radiogroup" aria-label="바탕">
        <span className={styles.bgLabel}>바탕</span>
        {CARD_BGS.map((b) => (
          <button
            key={b.bg}
            type="button"
            role="radio"
            aria-checked={b.bg === bg}
            aria-label={b.label}
            className={`${styles.bg} ${b.bg === bg ? styles.bgOn : ''}`}
            style={{ backgroundImage: `url(${b.src})` }}
            onClick={() => onBg(b.bg === bg ? undefined : b.bg)}
          />
        ))}
      </div>
    </div>
  )
}
