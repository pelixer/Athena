import { useEffect, useState, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { App } from '../App'
import { ViewfinderStill } from '../lib/viewfinder'
import { Icon, type IconName } from '../components/Icon'
import { IconButton } from '../components/IconButton'
import { AddTag, Tag } from '../components/Tag'
import { OptionChip } from '../components/OptionChip'
import { AthenaLogo } from '../components/AthenaLogo'
import { CoverFrame, DoubleRule, RowStatus, SectionHead, StatusPill } from '../components/Stoa'
import { Toggle } from '../components/Toggle'
import { ArchiveTag } from '../components/ArchiveTag'
import { ArchiveMeta } from '../components/ArchiveMeta'
import { MetaTable } from '../components/MetaTable'
import { ObjeCard } from '../components/ObjeCard'
import { DocentBlock } from '../components/DocentBlock'
import { NoteBlock } from '../components/NoteBlock'
import { ShutterButton } from '../components/ShutterButton'
import { ModeSwitch } from '../components/ModeSwitch'
import { Toast } from '../components/Toast'
import { TabBar } from '../components/TabBar'
import { Card, type CardBg, type CardField, type CardStyle } from '../components/Card'
import { CardStylePicker } from '../components/CardStylePicker'
import { TextArea, TextField } from '../components/TextField'
import { SAMPLE, samplePhotos } from './seed'
import styles from './PreviewPage.module.css'

// 컴포넌트 갤러리 — Code가 구현한 결과를 Design이 검토하는 화면.
// 제목은 코드의 컴포넌트·화면 이름과 같다. 'R…' 'T…'는 design/REVIEW.md 항목 번호.

const ICONS: [IconName, string][] = [
  ['back', '뒤로'], ['forward', '다음'], ['close', '닫기'], ['add', '추가'], ['share', '공유'], ['save', '저장'],
  ['flip', '카메라 전환'], ['write', '노트 쓰기'], ['card', '카드'], ['ticket', '입장권'], ['photo', '사진'], ['tag', '라벨'],
  ['check', '확인'], ['delete', '지우기'], ['pin', '고정'], ['folder', '폴더'], ['unfolder', '폴더에서 빼기'], ['more', '더 보기'],
  ['search', '찾기'], ['sort', '정렬'], ['undo', '되돌리기'], ['info', '정보'], ['grid', '격자'], ['list', '목록'], ['seal', '마무리'],
]

const NOTE = '절벽은 하얗다기보다, 하늘을 오래 비춰서 푸르게 바랜 것 같았다. 사진 앞에 서 있으니 바닷바람 소리가 들리는 듯했다.'
const DOCENT = {
  heading: '한서윤, 〈남쪽 해안, 오후 3시〉, 2019',
  text: '피그먼트 프린트. 작가는 같은 절벽을 일 년 동안 같은 시각에 촬영했다. 백악질 절벽은 계절과 빛에 따라 회색에서 푸른빛까지 색을 바꾼다.',
}

type Status = 'proposed' | 'design'
const STATUS_LABEL: Record<Status, string> = { proposed: '검토 대기 · 단계 2', design: '디자인 대기 · 단계 3' }

export function PreviewPage() {
  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <span className={styles.eyebrow}>Athena · 구현 갤러리 · 디자인 시스템 v2.3 Stoa</span>
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
          <Frame label="01 촬영 · 캡션 모드" path={`/visit/${SAMPLE.visitId}/capture?mode=docent`} still={samplePhotos.marble} />
          <Frame label="02 오브제 상세 · ObjePage" path={`/obje/${SAMPLE.objeId}`} />
          <Frame label="03 컬렉션 · VisitPage" path={`/visit/${SAMPLE.visitId}`} />
          <Frame label="04 공유 카드 · CardPage" path={`/obje/${SAMPLE.objeId}/card`} />
          <Frame label="05 입장권 · TemplatePage" path={`/visit/${SAMPLE.visitId}/template`} />
          <Frame label="홈 · HomePage" path="/" />
        </div>
      </Section>

      <Section no="02" title="토큰" note="design/tokens.css — '요청 중'은 검토 목록의 T 번호">
        <Tokens />
      </Section>

      <Section no="03" title="컴포넌트">
        <div className={styles.grid}>
          <Item name="Icon" note="1.25 선 · 끝 자름 · 모서리 각 · 점 없음 (System VI)">
            <div className={styles.icons}>
              {ICONS.map(([n, ko]) => (
                <figure key={n} className={styles.iconCell}>
                  <Icon name={n} size={26} />
                  <figcaption>{ko}</figcaption>
                </figure>
              ))}
            </div>
          </Item>

          <Item name="AthenaLogo" note="mark · lockup · stacked — 홈·첫 실행은 하늘">
            <div className={styles.row} style={{ color: 'var(--accent)' }}>
              <AthenaLogo variant="mark" size={40} />
              <AthenaLogo size={40} />
              <AthenaLogo variant="stacked" size={64} />
            </div>
          </Item>

          <Item name="IconButton" note="바탕 없음 · 1px 테 + 4.5px 안쪽 고리 · 길게 누르면 이름 · 40 / 44 / 52 / 54">
            <div className={styles.split}>
              <div className={styles.onPhoto}>
                <IconButton icon="back" surface="photo" aria-label="뒤로" />
                <IconButton icon="share" surface="photo" aria-label="공유" />
                <IconButton icon="flip" surface="photo" size={52} aria-label="카메라 전환" />
              </div>
              <div className={styles.onMarbleRow}>
                <IconButton icon="back" aria-label="뒤로" />
                <IconButton icon="add" size={54} aria-label="추가" />
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

          <Item name="Stoa · DoubleRule · SectionHead · CoverFrame · StatusPill · RowStatus">
            <SectionHead numeral="II" name="컬렉션" count="04" />
            <div className={styles.row}>
              <CoverFrame src={samplePhotos.cliffDover} />
              <CoverFrame mosaic={[samplePhotos.cliffSky, samplePhotos.marble, samplePhotos.cliffDover]} folder />
              <CoverFrame />
              <StatusPill />
              <StatusPill sealed />
              <RowStatus pinned collecting />
            </div>
            <DoubleRule />
          </Item>

          <Item name="ObjeCard">
            <div className={styles.narrow}>
              <ObjeCard src={samplePhotos.cliffDover} index="N° 07" attachment="캡션 · 노트" title="남쪽 해안, 오후 세 시" />
            </div>
          </Item>

          <Item name="DocentBlock — 기록">
            <DocentBlock docent={DOCENT} onEdit={() => {}} onShowPhoto={() => {}} />
          </Item>

          <Item name="NoteBlock — 해석" note="아래: 비어 있을 때">
            <NoteBlock note={NOTE} updatedAt={new Date(2026, 9, 17, 14, 36).getTime()} />
            <NoteBlock onWrite={() => {}} />
          </Item>

          <Item name="ShutterButton · ModeSwitch">
            <ShutterDemo />
          </Item>

          <Item name="ShutterButton · 첨부 추가" note="사진을 첨부하면 셔터 자리가 ✓(추가)로 바뀐다 · 오브제 흰색 / 캡션 하늘">
            <div className={styles.dark}>
              <ShutterButton mode="obje" icon="check" label="새 오브제로 추가" onPress={() => {}} />
              <ShutterButton mode="docent" icon="check" label="캡션으로 추가" onPress={() => {}} />
            </div>
          </Item>

          <Item name="MetaTable" note="오브제 상세의 자동 기록 표">
            <MetaTable
              rows={[
                ['시각', '2026.10.17 14:32:18'],
                ['장소', '국립현대미술관 서울 · 3전시실'],
                ['좌표', '37.5788°N 126.9800°E'],
              ]}
            />
          </Item>

          <Item name="TabBar · Toggle" note="컬렉션 탭 · 입장권 노트 켜기">
            <TabDemo />
            <ToggleDemo />
          </Item>

          <Item name="Toast" note="촬영 화면의 안내">
            <div className={styles.onPhoto}>
              <Toast kind="done">N° 07에 캡션을 붙였어요</Toast>
              <Toast kind="busy">캡션 글자를 읽는 중</Toast>
              <Toast action={{ label: '되돌리기', onAction: () => {} }}>컬렉션을 지웠어요</Toast>
            </div>
          </Item>

          <Item name="TextField · Sheet" note="반경 28 · 손잡이 · 눈썹 · serif 21 제목 · 취소 왼쪽 / ✓ 오른쪽">
            <div className={styles.sheet}>
              <span className={styles.sheetHandle} />
              <span className={styles.sheetLabel}>CAPTION · 캡션 고치기</span>
              <TextField variant="heading" defaultValue={DOCENT.heading} />
              <TextArea rows={3} defaultValue={DOCENT.text} />
              <div className={styles.sheetActions}>
                <IconButton icon="close" size={54} aria-label="취소" />
                <IconButton icon="check" size={54} aria-label="저장" />
              </div>
            </div>
          </Item>
        </div>

        <Item name="ArchiveTag · ArchiveMeta" note="사진 오른쪽 위에 매달린 꼬리표(해 / 후보만 있으면 ?) → 누르면 메타 시트: 작가 · 작업 기간 · 화법 · 화풍 · 근원지" status="proposed" refs="A2">
          <ArchiveDemo />
        </Item>

        <Item name="Card · CardStylePicker · OptionChip" note="하늘 · 대리석 · 사진 · 도록 + 바탕 5종 / 캡션 첫 줄은 노트 아래, 라벨은 서명 위 (R6)" wide>
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
          { value: 'docent', label: '캡션' },
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

function ArchiveDemo() {
  const rows: [string, string][] = [
    ['작가', '빈센트 반 고흐 (1853–1890)'],
    ['작업 기간', '1889'],
    ['화법', '캔버스 · 유채'],
    ['화풍', '후기인상주의 · 풍경화'],
    ['근원지', '프랑스 · 생레미드프로방스'],
    ['분류', '회화'],
  ]
  const candidates = [{ workId: 'Q1', artistId: 'Q5582', title: 'Starry Night Over the Rhône', meta: '빈센트 반 고흐 · 1888' }]
  return (
    <div className={styles.narrow}>
      <div className={styles.onPhoto} style={{ justifyContent: 'flex-end', gap: 24, alignItems: 'flex-start', minHeight: 140 }}>
        <ArchiveTag label="1889" onClick={() => {}} />
        <ArchiveTag tentative onClick={() => {}} />
      </div>
      <ArchiveMeta rows={rows} workId="Q45585" candidates={candidates} onPick={() => {}} />
    </div>
  )
}

function ToggleDemo() {
  const [on, setOn] = useState(true)
  return (
    <div className={styles.row}>
      <Toggle on={on} label="나의 노트 넣기" onChange={setOn} />
      <Toggle on={!on} label="꺼짐 견본" onChange={(v) => setOn(!v)} />
    </div>
  )
}

function CardDemo() {
  const [style, setStyle] = useState<CardStyle>('sky')
  const [bg, setBg] = useState<CardBg>()
  const all: CardField[] = ['note', 'meta', 'docent', 'tags']
  const props = {
    photo: samplePhotos.cliffDover,
    note: '절벽은 하얗다기보다, 하늘을 오래 비춰서 푸르게 바랜 것 같았다. 사진 앞에 서 있으니 바닷바람 소리가 들리는 듯했다.',
    index: 'N° 07',
    date: '2026.10.17',
    place: '국립현대미술관 서울',
    title: '남쪽 해안, 오후 세 시',
    docentHeading: DOCENT.heading,
    tags: ['흰절벽', '바다', '한서윤'],
  }
  const two = new Set<CardField>(['note', 'meta'])
  return (
    <div className={styles.cards}>
      {(['sky', 'marble', 'photo', 'plate'] as CardStyle[]).map((s) => (
        <Card key={s} style={s} fields={two} {...props} />
      ))}
      {(['stucco', 'shadow', 'silk-beige', 'water', 'silk-white'] as CardBg[]).map((b) => (
        <Card key={b} style="marble" bg={b} fields={two} {...props} />
      ))}
      <Card style={style} bg={bg} fields={new Set(all)} {...props} />
      <div className={styles.cardControls}>
        <span className={styles.itemNote}>오른쪽 끝: 네 항목을 모두 켠 카드</span>
        <CardStylePicker
          value={style}
          bg={bg}
          photo={samplePhotos.cliffDover}
          onChange={(s) => {
            setStyle(s)
            setBg(undefined)
          }}
          onBg={(b) => {
            setBg(b)
            if (b && (style === 'photo' || style === 'plate')) setStyle('sky')
          }}
        />
        <div className={styles.row}>
          <OptionChip label="나의 노트" on onToggle={() => {}} />
          <OptionChip label="날짜 · 장소" on onToggle={() => {}} />
          <OptionChip label="캡션" on={false} onToggle={() => {}} />
          <OptionChip label="라벨" on={false} onToggle={() => {}} />
        </div>
      </div>
    </div>
  )
}

const COLORS = ['bg-base', 'bg-sunken', 'bg-wall', 'bg-inverse', 'border-vein', 'border-strong', 'text-primary', 'text-body', 'text-secondary', 'text-disabled', 'text-on-dark', 'text-on-dark-muted', 'accent', 'accent-bright', 'accent-on-dark', 'toast-bg', 'gradient-sky', 'gradient-photo', 'scrim-top', 'scrim-bottom', 'fade-plinth']
const PENDING_COLORS: string[] = []
const TYPES = ['display-xxl', 'display-xl', 'display-l', 'sheet-title', 'row-title', 'title-serif', 'note', 'card-note', 'card-meta', 'body', 'body-s', 'section', 'status', 'data-m', 'index', 'index-l', 'roman']
const PENDING_TYPES: string[] = []
const SPACES = [1, 2, 3, 4, 5, 6, 8, 12, 16]
const RADII = ['xs', 'sm', 'md', 'lg', 'card', 'pill']

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
          <span className={styles.code}>shadow</span>
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
