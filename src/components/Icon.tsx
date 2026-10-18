/**
 * Icon — 안 C "하늘 점" (2026-10-18 사용자 선택).
 * 1.5 선, 90° 꺾임(곡선·둥근 모서리 없음, 2026-10-18 사용자 요청) + 하늘색 점 하나. 점은 "나의 노트" 앞 점, 촬영 화면 관람 알약의 점과 같은 서명이다.
 * 선 색은 글자색(currentColor)을, 점 색은 --icon-dot을 따른다 (표면마다 glass.module.css가 정한다).
 */
export type IconName = 'back' | 'forward' | 'close' | 'add' | 'share' | 'save' | 'flip' | 'write' | 'card' | 'ticket' | 'photo' | 'tag' | 'check' | 'delete' | 'pin' | 'folder'

const dot = (cx: number, cy: number, r = 1.6) => <circle className="icon-dot" cx={cx} cy={cy} r={r} />

const PATHS: Record<IconName, React.ReactNode> = {
  back: (
    <>
      <path d="M16.5 12H5.5M9.5 8l-4 4 4 4" />
      {dot(20, 12)}
    </>
  ),
  forward: (
    <>
      <path d="M7.5 12h11M14.5 8l4 4-4 4" />
      {dot(4, 12)}
    </>
  ),
  close: <path d="M7 7l10 10M17 7L7 17" />,
  check: (
    <>
      <path d="M8 12.5l3 3 6.5-7" />
      {dot(4.5, 12.5, 1.5)}
    </>
  ),
  add: <path d="M12 5v14M5 12h14" />,
  pin: (
    <>
      <path d="M9 4h6l-1 6 3.5 3.5h-11L10 10zM12 13.5V20" />
      {dot(12, 7, 1.4)}
    </>
  ),
  folder: (
    <>
      <path d="M3.5 6h6l2 2.5h9V18.5h-17z" />
      {dot(16.5, 13.5, 1.6)}
    </>
  ),
  delete: (
    <>
      <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5" />
      {dot(12, 13.5, 1.5)}
    </>
  ),
  share: (
    <>
      <path d="M6 19v-8h12.5M14.5 7l4 4-4 4" />
      {dot(6, 4.8, 1.6)}
    </>
  ),
  save: <path d="M12 4.5v10M8 10.5l4 4 4-4M5.5 19h13" />,
  flip: (
    <>
      <path d="M5 11V7h13.5M15.5 4l3 3-3 3M19 13v4H5.5M8.5 20l-3-3 3-3" />
      {dot(12, 12, 1.6)}
    </>
  ),
  write: (
    <>
      <path d="M6 18v-4L15.5 4.5l4 4L10 18zM13 7l4 4" />
      {dot(4.5, 20.5, 1.4)}
    </>
  ),
  card: (
    <>
      <rect x="5.5" y="3.5" width="13" height="17" />
      <path d="M10.5 15.5h5M8.5 18h7" />
      {dot(8.6, 15.5, 1.3)}
    </>
  ),
  ticket: (
    <>
      <path d="M4 6.5h16V10h-2v4h2v3.5H4V14h2v-4H4z" />
      {dot(9.5, 12, 1.4)}
    </>
  ),
  photo: (
    <>
      <rect x="4" y="5" width="16" height="14" />
      <path d="M4 17l5-5 4 4 2.5-2.5L20 18" />
      {dot(15.5, 9.5, 1.7)}
    </>
  ),
  tag: (
    <>
      <path d="M4 4h8.5l7.5 7.5-8.5 8.5L4 12.5z" />
      {dot(8.5, 8.5, 1.7)}
    </>
  ),
}

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}
