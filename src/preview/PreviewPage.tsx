import { useEffect, useState, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { App } from '../App'
import { ViewfinderStill } from '../lib/viewfinder'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { AddTag, Tag } from '../components/Tag'
import { OptionChip } from '../components/OptionChip'
import { IndexBadge } from '../components/IndexBadge'
import { MetaLine } from '../components/MetaLine'
import { MetaTable } from '../components/MetaTable'
import { ObjeCard } from '../components/ObjeCard'
import { DocentBlock } from '../components/DocentBlock'
import { NoteBlock } from '../components/NoteBlock'
import { ShutterButton } from '../components/ShutterButton'
import { ModeSwitch } from '../components/ModeSwitch'
import { Toast } from '../components/Toast'
import { TabBar } from '../components/TabBar'
import { StatRow } from '../components/StatRow'
import { Card, type CardField, type CardStyle } from '../components/Card'
import { CardStylePicker } from '../components/CardStylePicker'
import { TextArea, TextField } from '../components/TextField'
import { SAMPLE, samplePhotos } from './seed'
import styles from './PreviewPage.module.css'

// 컴포넌트 갤러리 — Code가 구현한 결과를 Design이 검토하는 화면.
// 제목은 코드의 컴포넌트·화면 이름과 같다. 'R…' 'T…'는 design/REVIEW.md 항목 번호.

const NOTE = '절벽은 하얗다기보다, 하늘을 오래 비춰서 푸르게 바랜 것 같았다. 사진 앞에 서 있으니 바닷바람 소리가 들리는 듯했다.'
const DOCENT = {
  heading: '한서윤, 〈남쪽 해안, 오후 3시〉, 2019',
  text: '피그먼트 프린트. 작가는 같은 절벽을 일 년 동안 같은 시각에 촬영했다. 백악질 절벽은 계절과 빛에 따라 회색에서 푸른빛까지 색을 바꾼다.',
}
const TAKEN = new Date(2026, 9, 17, 14, 32, 18).getTime()

type Status = 'proposed' | 'design'
const STATUS_LABEL: Record<Status, string> = { proposed: '검토 대기 · 단계 2', design: '디자인 대기 · 단계 3' }

export function PreviewPage() {
  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <span className={styles.eyebrow}>Athena · 구현 갤러리 · 디자인 시스템 v0</span>
        <h1 className={styles.title}>코드로 렌더링한 Athena</h1>
        <p className={styles.lede}>
          이 페이지의 모든 화면과 컴포넌트는 앱의 실제 코드와 <code>design/tokens.css</code>로 그렸습니다. 제목은 코드 이름과 같습니다. 시안에 없어서 코드가 먼저 만든 것은 표시가 붙어 있습니다.
        </p>
        <div className={styles.legend}>
          <Mark status="proposed" />
          <span>원칙으로 유추해 만듦 — 승인 / 수정 / 재디자인 중 하나로 답해 주세요</span>
          <Mark status="design" />
          <span>시안이 먼저 필요함</span>
        </div>
      </header>

      <Section no="01" title="대표 화면" note="예시 데이터로 렌더링한 실제 화면 · 프레임은 시안과 같은 390 × 844">
        <div className={styles.frames}>
          <Frame label="01 촬영 · CapturePage" path={`/visit/${SAMPLE.visitId}/capture`} still={samplePhotos.cliffSky} />
          <Frame label="01 촬영 · 도슨트 모드" path={`/visit/${SAMPLE.visitId}/capture?mode=docent`} still={samplePhotos.marble} />
          <Frame label="02 오브제 상세 · ObjePage" path={`/obje/${SAMPLE.objeId}`} />
          <Frame label="03 관람 보기 · VisitPage" path={`/visit/${SAMPLE.visitId}`} />
          <Frame label="04 공유 카드 · CardPage" path={`/obje/${SAMPLE.objeId}/card`} />
          <Frame label="홈 · HomePage" path="/" status="proposed" refs="R1" />
        </div>
      </Section>

      <Section no="02" title="토큰" note="design/tokens.css — '요청 중'은 검토 목록의 T 번호">
        <Tokens />
      </Section>

      <Section no="03" title="컴포넌트">
        <div className={styles.grid}>
          <Item name="Button · Liquid Glass" note="glass-accent · glass-neutral · ghost · glass-dark">
            <div className={styles.onMarble}>
              <Button>카드 만들기</Button>
              <Button variant="neutral">노트 쓰기</Button>
              <Button variant="ghost">나중에</Button>
            </div>
            <div className={styles.onPhoto}>
              <Button variant="dark">다시 찍기</Button>
              <Button>저장</Button>
            </div>
          </Item>

          <Item name="IconButton" note="on-photo · on-marble · 44 / 52 / 54">
            <div className={styles.split}>
              <div className={styles.onPhoto}>
                <IconButton surface="photo" aria-label="뒤로">←</IconButton>
                <IconButton surface="photo" aria-label="공유">↗</IconButton>
                <IconButton surface="photo" size={52} aria-label="카메라 전환">⟲</IconButton>
              </div>
              <div className={styles.onMarbleRow}>
                <IconButton aria-label="뒤로">←</IconButton>
                <IconButton size={54} aria-label="추가">+</IconButton>
              </div>
            </div>
          </Item>

          <Item name="Tag" note="default · selected · add · on-photo">
            <div className={styles.row}>
              <Tag tag="흰절벽" />
              <Tag tag="하늘" />
              <Tag tag="한서윤" variant="selected" />
              <AddTag />
            </div>
            <div className={`${styles.row} ${styles.onSky}`}>
              <Tag tag="흰절벽" variant="onPhoto" />
              <Tag tag="바다" variant="onPhoto" />
            </div>
          </Item>

          <Item name="IndexBadge · MetaLine" note="순번 = Visit.index · 자동 기록 값은 항상 모노">
            <div className={styles.row}>
              <IndexBadge index={7} />
              <IndexBadge index={8} variant="outline" />
              <IndexBadge index={7} variant="small" />
            </div>
            <MetaLine takenAt={TAKEN} place="국립현대미술관 서울" />
          </Item>

          <Item name="ObjeCard">
            <div className={styles.narrow}>
              <ObjeCard src={samplePhotos.cliffDover} index={7} time="14:32" attachment="도슨트 · 노트" title="남쪽 해안, 오후 세 시" />
            </div>
          </Item>

          <Item name="DocentBlock — 기록">
            <DocentBlock docent={DOCENT} onShowPhoto={() => {}} />
          </Item>

          <Item name="NoteBlock — 해석" note="아래: 비어 있을 때" status="proposed" refs="R3">
            <NoteBlock note={NOTE} updatedAt={new Date(2026, 9, 17, 14, 36).getTime()} />
            <NoteBlock onWrite={() => {}} />
          </Item>

          <Item name="ShutterButton · ModeSwitch">
            <ShutterDemo />
          </Item>

          <Item name="MetaTable" note="오브제 상세의 자동 기록 표 · 이름은 코드가 붙임" status="proposed" refs="R4">
            <MetaTable
              rows={[
                ['시각', '2026.10.17 14:32:18'],
                ['장소', '국립현대미술관 서울 · 3전시실'],
                ['좌표', '37.5788°N 126.9800°E'],
              ]}
            />
          </Item>

          <Item name="StatRow · TabBar" note="관람 보기 상단 · 이름은 코드가 붙임" status="proposed" refs="R4">
            <StatRow
              stats={[
                ['오브제', 12],
                ['도슨트', 5],
                ['나의 노트', 4],
              ]}
            />
            <TabDemo />
          </Item>

          <Item name="Toast" note="촬영 화면의 안내 · 이름은 코드가 붙임" status="proposed" refs="R4 R7">
            <div className={styles.onPhoto}>
              <Toast>설명문이 인식되었어요 · No.07에 붙입니다</Toast>
              <Toast>먼저 오브제를 찍어 주세요</Toast>
            </div>
          </Item>

          <Item name="TextField · Sheet" note="노트 · 제목 · 라벨 편집 시트" status="proposed" refs="R2">
            <div className={styles.sheet}>
              <span className={styles.sheetLabel}>나의 노트</span>
              <TextArea variant="note" rows={3} defaultValue={NOTE} />
              <TextField placeholder="#흰절벽 #바다" />
              <Button>저장</Button>
            </div>
          </Item>
        </div>

        <Item name="Card · CardStylePicker · OptionChip" note="하늘 · 대리석 · 사진 / 도슨트·라벨을 켰을 때의 배치는 코드가 정함" status="proposed" refs="R4 R6" wide>
          <CardDemo />
        </Item>
      </Section>
    </main>
  )
}

function Section({ no, title, note, children }: { no: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <span className={styles.no}>{no}</span>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {note && <span className={styles.sectionNote}>{note}</span>}
      </div>
      {children}
    </section>
  )
}

function Item({ name, note, status, refs, wide, children }: { name: string; note?: string; status?: Status; refs?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={`${styles.item} ${wide ? styles.wide : ''}`}>
      <div className={styles.itemHead}>
        <span className={styles.itemName}>{name}</span>
        {status && <Mark status={status} refs={refs} />}
      </div>
      {note && <span className={styles.itemNote}>{note}</span>}
      <div className={styles.specimen}>{children}</div>
    </div>
  )
}

function Mark({ status, refs }: { status: Status; refs?: string }) {
  return (
    <span className={`${styles.mark} ${styles[status]}`}>
      {STATUS_LABEL[status]}
      {refs && ` · ${refs}`}
    </span>
  )
}

function Frame({ label, path, still, status, refs }: { label: string; path: string; still?: string; status?: Status; refs?: string }) {
  return (
    <figure className={styles.frameWrap}>
      <figcaption className={styles.frameLabel}>
        {label}
        {status && <Mark status={status} refs={refs} />}
      </figcaption>
      <div className={styles.frame}>
        <div className={styles.frameScroll}>
          <ViewfinderStill.Provider value={still}>
            <MemoryRouter initialEntries={[path]}>
              <App />
            </MemoryRouter>
          </ViewfinderStill.Provider>
        </div>
      </div>
    </figure>
  )
}

function ShutterDemo() {
  const [mode, setMode] = useState<'obje' | 'docent'>('obje')
  return (
    <div className={styles.dark}>
      <ModeSwitch
        options={[
          { value: 'obje', label: '오브제' },
          { value: 'docent', label: '도슨트' },
        ]}
        value={mode}
        onChange={setMode}
      />
      <ShutterButton mode={mode} onPress={() => setMode(mode === 'obje' ? 'docent' : 'obje')} />
    </div>
  )
}

function TabDemo() {
  const [v, setV] = useState<'index' | 'tags' | 'notes'>('index')
  return (
    <TabBar
      tabs={[
        { value: 'index', label: '순번' },
        { value: 'tags', label: '라벨' },
        { value: 'notes', label: '노트만' },
      ]}
      value={v}
      onChange={setV}
    />
  )
}

function CardDemo() {
  const [style, setStyle] = useState<CardStyle>('sky')
  const all: CardField[] = ['note', 'meta', 'docent', 'tags']
  const props = {
    photo: samplePhotos.cliffDover,
    note: '절벽은 하얗다기보다, 하늘을 오래 비춰서 푸르게 바랜 것 같았다.',
    stamp: 'No.07 · 2026.10.17 14:32',
    place: '국립현대미술관 서울',
    docentHeading: DOCENT.heading,
    tags: ['흰절벽', '바다', '한서윤'],
  }
  return (
    <div className={styles.cards}>
      {(['sky', 'marble', 'photo'] as CardStyle[]).map((s) => (
        <Card key={s} style={s} fields={new Set<CardField>(['note', 'meta'])} {...props} />
      ))}
      <Card style={style} fields={new Set(all)} {...props} />
      <div className={styles.cardControls}>
        <span className={styles.itemNote}>오른쪽 끝: 네 항목을 모두 켠 카드</span>
        <CardStylePicker value={style} photo={samplePhotos.cliffDover} onChange={setStyle} />
        <div className={styles.row}>
          <OptionChip label="나의 노트" on onToggle={() => {}} />
          <OptionChip label="날짜 · 장소" on onToggle={() => {}} />
          <OptionChip label="도슨트" on={false} onToggle={() => {}} />
          <OptionChip label="라벨" on={false} onToggle={() => {}} />
        </div>
      </div>
    </div>
  )
}

const COLORS = ['bg-base', 'bg-sunken', 'bg-inverse', 'border-vein', 'border-strong', 'text-primary', 'text-secondary', 'text-disabled', 'text-on-dark', 'accent', 'accent-text', 'on-accent', 'accent-bright', 'accent-soft', 'gradient-sky']
const PENDING_COLORS = ['text-body', 'text-on-dark-muted', 'scrim-bottom', 'scrim-dim', 'gradient-photo']
const TYPES = ['display-xl', 'display-l', 'title', 'body', 'body-s', 'note', 'label', 'label-l', 'numeral']
const PENDING_TYPES = ['badge', 'meta', 'tab', 'item', 'heading-s', 'card-note', 'wordmark']
const SPACES = [1, 2, 3, 4, 5, 6, 8, 12, 16]
const RADII = ['xs', 'sm', 'md', 'pill']

function Tokens() {
  return (
    <div className={styles.tokens}>
      <div className={styles.swatches}>
        {COLORS.map((c) => (
          <Swatch key={c} name={c} />
        ))}
        {PENDING_COLORS.map((c) => (
          <Swatch key={c} name={c} pending />
        ))}
      </div>
      <div className={styles.types}>
        {[...TYPES.map((t) => [t, false] as const), ...PENDING_TYPES.map((t) => [t, true] as const)].map(([t, pending]) => (
          <div key={t} className={styles.typeRow}>
            <code className={styles.code}>
              --type-{t}
              {pending && <span className={styles.pendingTag}> 요청 중</span>}
            </code>
            <span style={{ font: `var(--type-${t})` }}>{t.startsWith('display') || t === 'note' || t === 'card-note' ? '남쪽 해안, 오후 세 시' : 'No.07 · 2026.10.17 14:32 · 흰 절벽'}</span>
          </div>
        ))}
      </div>
      <div className={styles.scales}>
        <div className={styles.scale}>
          <span className={styles.code}>space · 4pt</span>
          {SPACES.map((n) => (
            <div key={n} className={styles.spaceRow}>
              <span className={styles.spaceBar} style={{ width: `var(--space-${n})` }} />
              <span className={styles.code}>--space-{n}</span>
            </div>
          ))}
        </div>
        <div className={styles.scale}>
          <span className={styles.code}>radius</span>
          <div className={styles.radii}>
            {RADII.map((r) => (
              <div key={r} className={styles.radius} style={{ borderRadius: `var(--radius-${r})` }}>
                <span className={styles.code}>{r}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.scale}>
          <span className={styles.code}>shadow · glass</span>
          <div className={styles.shadow} style={{ boxShadow: 'var(--shadow-rest)' }}>
            <span className={styles.code}>rest</span>
          </div>
          <div className={styles.shadow} style={{ boxShadow: 'var(--shadow-lift)' }}>
            <span className={styles.code}>lift</span>
          </div>
        </div>
        <div className={styles.scale}>
          <span className={styles.code}>motion</span>
          <span className={styles.code}>settle · move — quick 120 · base 240 · slow 480ms</span>
          <span className={styles.itemNote}>셔터 플래시 quick · 마지막 사진이 쌓이는 순간 slow · 시트 등장 slow · 탭·전환 move</span>
        </div>
      </div>
    </div>
  )
}

function Swatch({ name, pending }: { name: string; pending?: boolean }) {
  const [value, setValue] = useState('')
  useEffect(() => setValue(getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim()), [name])
  return (
    <figure className={styles.swatch}>
      <div className={styles.chip} style={{ background: `var(--${name})` }} />
      <figcaption>
        <span className={styles.code}>
          --{name}
          {pending && <span className={styles.pendingTag}> 요청 중</span>}
        </span>
        <span className={styles.value}>{value.length > 40 ? 'gradient' : value}</span>
      </figcaption>
    </figure>
  )
}
