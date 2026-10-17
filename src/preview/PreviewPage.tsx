import { useEffect, useState, type ReactNode } from 'react'
import { Button } from '../components/Button'
import { MetaLine } from '../components/MetaLine'
import { ObjeThumb } from '../components/ObjeThumb'
import { ShareCard } from '../components/ShareCard'
import { TagChip, TagList } from '../components/TagChip'
import { DocentBlock, NoteBlock } from '../components/TextBlock'
import cliffSky from '../../design/references/01-chalk-cliff-sky.jpg'
import cliffSea from '../../design/references/02-cliff-sea.jpg'
import marble from '../../design/references/03-white-marble.jpg'
import styles from './PreviewPage.module.css'

// 컴포넌트 갤러리. Claude Design과 리뷰할 때 쓰는 화면이다.
// 섹션 제목은 코드의 컴포넌트/토큰 이름과 같다 — 코멘트에 그 이름을 쓰면 바로 찾을 수 있다.

const COLOR_TOKENS = [
  'bg', 'surface', 'surface-sunken', 'border', 'border-strong',
  'text', 'text-muted', 'text-faint', 'accent', 'accent-soft', 'on-accent', 'tag-bg', 'tag-text',
].map((n) => `--color-${n}`)
const TEXT_TOKENS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].map((n) => `--text-${n}`)
const FONT_TOKENS = ['display', 'body', 'ui', 'mono'].map((n) => `--font-${n}`)
const SPACE_TOKENS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `--space-${n}`)

const SAMPLE = {
  takenAt: new Date('2026-10-17T14:32:00+09:00').getTime(),
  location: { lat: 37.5788, lng: 126.9801, label: '국립현대미술관 서울' },
  tags: ['데이비드호크니', '다이빙', '수영장'],
  docent:
    '「더 큰 첨벙」(1967)은 캘리포니아의 햇빛 아래, 방금 누군가 뛰어든 수영장의 물보라를 포착한다. 호크니는 2초의 사건을 그리는 데 2주를 들였다.',
  note: '사람은 보이지 않는데, 물이 대신 말해준다. 조용한 오후의 소란.',
}

export function PreviewPage() {
  return (
    <main className={styles.page}>
      <header>
        <p className={styles.eyebrow}>Athena · design/tokens.css v0-draft</p>
        <h1 className={styles.title}>Components</h1>
      </header>

      <Section name="Moodboard" note="design/references">
        <div className={styles.mood}>
          {[cliffSky, cliffSea, marble].map((src) => (
            <img key={src} src={src} alt="" />
          ))}
        </div>
      </Section>

      <Section name="Color" note="--color-*">
        <div className={styles.swatches}>
          {COLOR_TOKENS.map((t) => (
            <figure key={t} className={styles.swatch}>
              <div style={{ background: `var(${t})` }} />
              <figcaption>
                {t}
                <TokenValue name={t} />
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section name="Type" note="--font-* / --text-*">
        {FONT_TOKENS.map((t) => (
          <p key={t} style={{ fontFamily: `var(${t})`, fontSize: 'var(--text-lg)', margin: 0 }}>
            <code className={styles.code}>{t}</code> 더 큰 첨벙 A Bigger Splash 1967
          </p>
        ))}
        {TEXT_TOKENS.map((t) => (
          <p key={t} style={{ fontFamily: 'var(--font-display)', fontSize: `var(${t})`, margin: 0, lineHeight: 'var(--leading-tight)' }}>
            <code className={styles.code}>{t}</code> 오브제
          </p>
        ))}
      </Section>

      <Section name="Space" note="--space-*">
        {SPACE_TOKENS.map((t) => (
          <div key={t} className={styles.space}>
            <code className={styles.code}>{t}</code>
            <span style={{ width: `var(${t})` }} />
          </div>
        ))}
      </Section>

      <Section name="Button" note="primary / ghost">
        <div className={styles.row}>
          <Button>관람 시작</Button>
          <Button variant="ghost">관람 마치기</Button>
          <Button disabled>저장</Button>
        </div>
      </Section>

      <Section name="TagChip" note="TagChip / TagList">
        <TagChip tag="날씨" />
        <TagList tags={SAMPLE.tags} />
      </Section>

      <Section name="MetaLine" note="날짜 · 시각 · 순번 · 위치">
        <MetaLine takenAt={SAMPLE.takenAt} sequence={7} location={SAMPLE.location} />
      </Section>

      <Section name="ObjeThumb" note="관람 보기 그리드">
        <div className={styles.grid}>
          <ObjeThumb src={cliffSky} sequence={1} />
          <ObjeThumb src={marble} sequence={2} />
          <ObjeThumb src={cliffSea} sequence={3} />
        </div>
      </Section>

      <Section name="DocentBlock / NoteBlock" note="기록과 해석">
        <DocentBlock text={SAMPLE.docent} />
        <NoteBlock text={SAMPLE.note} />
      </Section>

      <Section name="ShareCard" note="공유 카드">
        <ShareCard src={cliffSky} takenAt={SAMPLE.takenAt} sequence={7} visitTitle="데이비드 호크니" note={SAMPLE.note} tags={SAMPLE.tags} />
      </Section>
    </main>
  )
}

function Section({ name, note, children }: { name: string; note?: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.name}>
        {name} {note && <span>{note}</span>}
      </h2>
      {children}
    </section>
  )
}

function TokenValue({ name }: { name: string }) {
  const [value, setValue] = useState('')
  useEffect(() => setValue(getComputedStyle(document.documentElement).getPropertyValue(name).trim()), [name])
  return <span>{value}</span>
}
