import type { CSSProperties } from 'react'
import { Sheet } from './Sheet'
import styles from './DownloadSheet.module.css'

/**
 * DownloadSheet (v2.3 E3) — 카드·입장권 저장 전에 묻는다. SAVE · "카드를 저장할까요?" · [미리보기 40×60 | 파일 이름 · 크기] · 취소 / ✓.
 * 미리보기로 넘어가지 않고 ✓를 누르는 그 동작 안에서 바로 내려받는다 (iOS Safari가 미리보기 대신 다운로드로 처리한다).
 */
export function DownloadSheet({
  title = '카드를 저장할까요?',
  filename,
  size = '1080 × 1620',
  preview,
  onDownload,
  onClose,
}: {
  title?: string
  filename?: string
  size?: string
  /** 미리보기 칸의 바탕 (카드 스타일과 같게) */
  preview?: CSSProperties
  onDownload: () => void
  onClose: () => void
}) {
  return (
    <Sheet open={!!filename} eyebrow="SAVE" title={title} confirmLabel="저장" onConfirm={onDownload} onClose={onClose}>
      <div className={styles.file}>
        <span className={styles.preview} style={preview} />
        <span className={styles.text}>
          <span className={styles.name}>{filename}</span>
          <span className={styles.size}>{size}</span>
        </span>
      </div>
    </Sheet>
  )
}
