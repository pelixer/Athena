import { Icon, type IconName } from './Icon'
import styles from './MenuList.module.css'

export type MenuItem = { icon: IconName; label: string; onSelect: () => void }

/** ⋯ 시트의 동작 목록 (B4): 아이콘 22 + 글자 sans 500 16, 줄 아래 결 선. 위험 동작도 같은 색(v2.3) */
export function MenuList({ items }: { items: MenuItem[] }) {
  return (
    <div className={styles.list}>
      {items.map((it) => (
        <button key={it.label} type="button" className={styles.item} onClick={it.onSelect}>
          <Icon name={it.icon} size={22} />
          {it.label}
        </button>
      ))}
    </div>
  )
}
