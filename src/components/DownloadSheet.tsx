import { Sheet } from './Sheet'
import styles from './DownloadSheet.module.css'

/**
 * DownloadSheet — 카드·템플릿 저장 전에 묻는다. 미리보기로 넘어가지 않고, "다운로드"를 누르는 순간 바로 받는다.
 * (이미지를 다 만든 뒤 사용자가 누른 그 동작 안에서 내려받아야 iOS Safari가 미리보기 대신 다운로드로 처리한다.)
 */
export function DownloadSheet({ filename, onDownload, onClose }: { filename?: string; onDownload: () => void; onClose: () => void }) {
  return (
    <Sheet open={!!filename} title="사진을 다운로드할까요?" confirmLabel="다운로드" onConfirm={onDownload} onClose={onClose}>
      <p className={styles.file}>{filename}</p>
    </Sheet>
  )
}
