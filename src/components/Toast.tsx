import type { ReactNode } from 'react'
import { Icon } from './Icon'
import styles from './Toast.module.css'

export type ToastKind = 'done' | 'busy' | 'plain'

/**
 * Toast (v2.3) — 어두운 알약. 자리는 하단 버튼 줄(ModeSwitch) 바로 위에 고정(놓는 곳은 화면이 정한다).
 * done = ✓, busy = 하늘 점 세 개가 흐름(오래 걸리는 일: 글자 읽는 중), action = 오른쪽에 "되돌리기" 같은 글자 버튼.
 */
export function Toast({ kind = 'plain', action, children }: { kind?: ToastKind; action?: { label: string; onAction: () => void }; children: ReactNode }) {
  return (
    <span role="status" className={styles.toast}>
      {kind === 'done' && <Icon name="check" size={16} />}
      {kind === 'busy' && (
        <span className={styles.dots} aria-hidden>
          <span />
          <span />
          <span />
        </span>
      )}
      {children}
      {action && (
        <>
          <span className={styles.divider} aria-hidden />
          <button type="button" className={styles.action} onClick={action.onAction}>
            {action.label}
          </button>
        </>
      )}
    </span>
  )
}
