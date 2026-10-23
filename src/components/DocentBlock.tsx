import type { Docent } from '../domain/types'
import { parseCaption } from '../domain/captionParse'
import styles from './DocentBlock.module.css'

const READING_LIMIT = 2 * 60 * 1000 // 이보다 오래 "읽는 중"이면 앱이 중간에 닫혔던 것 → 실패로 본다

/**
 * DocentBlock — 캡션 카드 (D2·D3). 기록이므로 작품 라벨처럼 흰 카드에.
 * 읽는 중: 줄 자리 표시 + "글자 읽는 중". 다 읽으면 제목 / 작가 / 표(재료·크기·연도)로, 나누지 못하면 원문 그대로.
 */
export function DocentBlock({ docent, onShowPhoto, onEdit, now = Date.now() }: { docent: Docent; onShowPhoto?: () => void; onEdit?: () => void; now?: number }) {
  const reading = docent.ocr?.state === 'reading' && now - docent.ocr.at < READING_LIMIT
  const failed = !reading && !docent.text.trim() && !docent.heading
  const card = reading || failed ? undefined : parseCaption(docent)
  return (
    <section className={styles.block}>
      <header className={styles.header}>
        <span className={styles.label}>캡션</span>
        <span className={styles.actions}>
          {onEdit && (
            <button type="button" className={styles.action} onClick={onEdit}>
              고치기
            </button>
          )}
          {onShowPhoto && (
            <button type="button" className={styles.action} onClick={onShowPhoto}>
              원본
            </button>
          )}
        </span>
      </header>
      {reading ? (
        <div className={styles.skeleton} aria-live="polite">
          <span className={styles.bar} style={{ width: '80%', height: 14 }} />
          <span className={styles.bar} style={{ width: '55%' }} />
          <span className={styles.bar} style={{ width: '62%' }} />
          <span className={styles.reading}>● 글자 읽는 중 · 2–5초</span>
        </div>
      ) : failed ? (
        <p className={styles.note}>캡션 사진은 붙었지만 글자를 읽지 못했어요. 원본을 보며 고치기로 적어 주세요.</p>
      ) : card ? (
        <>
          <div className={styles.titles}>
            {card.title && <span className={styles.title}>{card.title}</span>}
            {card.artist && <span className={styles.artist}>{card.artist}</span>}
          </div>
          {card.rows.length > 0 && (
            <dl className={styles.table}>
              {card.rows.map(([k, v]) => (
                <div key={k} className={styles.row}>
                  <dt>{k}</dt>
                  <dd className={k === '재료' ? undefined : styles.mono}>{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className={styles.note}>기기에서 읽은 글자예요. 틀린 곳은 고치기로.</p>
        </>
      ) : (
        <>
          {docent.heading && <p className={styles.title}>{docent.heading}</p>}
          <p className={styles.text}>{docent.text}</p>
        </>
      )}
    </section>
  )
}
