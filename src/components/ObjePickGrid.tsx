import { formatIndex } from '../lib/format'
import styles from './ObjePickGrid.module.css'

export interface PickItem {
  id: string
  src?: string
  index: number
  /** 고른 순서 (1 = 표지·노트의 오브제). 고르지 않았으면 없음 */
  order?: number
}

/**
 * 입장권에 넣을 오브제 고르기 (v2.3 E5, SELECT 시트 안). 3열 4:5, 간격 8.
 * 고른 칸 = 먹 2px 안쪽 테 + 먹 바탕 흰 순번 원, 안 고른 칸 = 투명도 .55 + 흰 빈 원. 왼쪽 아래 N°.
 */
export function ObjePickGrid({ items, onToggle }: { items: PickItem[]; onToggle: (id: string) => void }) {
  return (
    <div className={styles.grid}>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          aria-pressed={!!it.order}
          aria-label={`${formatIndex(it.index)}${it.order ? ` · ${it.order}번` : ''}`}
          className={`${styles.item} ${it.order ? styles.selected : ''}`}
          style={it.src ? { backgroundImage: `url(${it.src})` } : undefined}
          onClick={() => onToggle(it.id)}
        >
          <span className={styles.index}>{formatIndex(it.index)}</span>
          <span className={it.order ? styles.order : styles.empty}>{it.order}</span>
        </button>
      ))}
    </div>
  )
}
