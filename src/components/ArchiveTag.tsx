import styles from './ArchiveTag.module.css'

/**
 * ArchiveTag — 오브제 사진 오른쪽 위에 실로 매달린 작은 꼬리표 (단계 2 · REVIEW A2).
 * 아카이브에서 작품을 맞추면 해(작업 기간의 시작)를, 후보만 있으면 "?"를 단다. 누르면 메타 시트.
 * 처음 나타날 때 실 끝을 축으로 한두 번 흔들린다 (움직임 줄이기 설정이면 흔들리지 않는다).
 */
export function ArchiveTag({ label, tentative, onClick }: { label?: string; tentative?: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`${styles.tag} ${tentative ? styles.tentative : ''}`} aria-label={tentative ? '아카이브 후보 보기' : '아카이브 메타 보기'} onClick={onClick}>
      <span className={styles.string} aria-hidden />
      <span className={styles.card}>
        <span className={styles.hole} aria-hidden />
        <span className={styles.label}>{tentative ? '?' : (label ?? 'N°')}</span>
        <span className={styles.meta}>META</span>
      </span>
    </button>
  )
}
