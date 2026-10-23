import { Sheet } from './Sheet'
import styles from './DeleteSheet.module.css'

/**
 * DeleteSheet (B5) — 지우기 확인. 색 대신 숫자로 무엇이 지워지는지 보여 준다. 확인 버튼은 휴지통.
 */
export function DeleteSheet({
  open,
  title,
  description,
  stats,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  description?: string
  stats: [number, string][]
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Sheet open={open} eyebrow="DELETE" title={title} description={description} confirmIcon="delete" confirmLabel="지우기" onConfirm={onConfirm} onClose={onClose}>
      {stats.length > 0 && (
        <div className={styles.stats}>
          {stats.map(([n, label]) => (
            <div key={label} className={styles.stat}>
              <span className={styles.number}>{String(n).padStart(2, '0')}</span>
              <span className={styles.label}>{label}</span>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  )
}
