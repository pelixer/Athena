import { formatIndex } from '../lib/format'
import styles from './IndexBadge.module.css'

/**
 * IndexBadge — 관람 내 순번. 자동 기록 값은 항상 모노.
 * filled: 기본 · outline: 다음 순번 · light: 사진 위 · small: ObjeCard 위
 */
export function IndexBadge({ index, variant = 'filled', short }: { index: number; variant?: 'filled' | 'outline' | 'light' | 'small' | 'corner'; short?: boolean }) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{short ? String(index).padStart(2, '0') : formatIndex(index)}</span>
}
