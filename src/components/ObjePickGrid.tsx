import { IndexBadge } from './IndexBadge'
import styles from './ObjePickGrid.module.css'

export interface PickItem {
  id: string
  src?: string
  index: number
  selected: boolean
}

/** 템플릿에 넣을 오브제 / 표지 고르기 (시트 안). 단계 2 — 디자인 검토 대기. */
export function ObjePickGrid({ items, onToggle }: { items: PickItem[]; onToggle: (id: string) => void }) {
  return (
    <div className={styles.grid}>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          aria-pressed={it.selected}
          className={`${styles.item} ${it.selected ? styles.selected : ''}`}
          style={it.src ? { backgroundImage: `url(${it.src})` } : undefined}
          onClick={() => onToggle(it.id)}
        >
          <span className={styles.badge}>
            <IndexBadge index={it.index} variant="small" />
          </span>
        </button>
      ))}
    </div>
  )
}
