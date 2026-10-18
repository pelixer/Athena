/**
 * Icon — 안 C "하늘 점" (2026-10-18 사용자 선택).
 * 1.5 선, 둥근 끝 + 하늘색 점 하나. 점은 "나의 노트" 앞 점, 촬영 화면 관람 알약의 점과 같은 서명이다.
 * 선 색은 글자색(currentColor)을, 점 색은 --icon-dot을 따른다 (표면마다 glass.module.css가 정한다).
 */
export type IconName = 'back' | 'forward' | 'close' | 'add' | 'share' | 'save' | 'flip' | 'write' | 'card' | 'ticket' | 'photo' | 'tag' | 'check'

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
  share: (
    <>
      <path d="M6 18.5C8 11.5 12 7.5 18.5 6M14.5 4.5l4 1.5-1.6 4" />
      {dot(5.5, 19, 1.8)}
    </>
  ),
  save: <path d="M12 4.5v10M8 10.5l4 4 4-4M5.5 19h13" />,
  flip: (
    <>
      <path d="M5.2 10.5A7 7 0 0 1 17.5 7M18.8 13.5A7 7 0 0 1 6.5 17M17.5 3.8V7h-3.2M6.5 20.2V17h3.2" />
      {dot(12, 12, 1.8)}
    </>
  ),
  write: (
    <>
      <path d="M6 18l1-4 9.5-9.5a2 2 0 0 1 3 3L10 17l-4 1z" />
      {dot(4.5, 20.5, 1.4)}
    </>
  ),
  card: (
    <>
      <rect x="5.5" y="3.5" width="13" height="17" rx="2" />
      <path d="M10.5 15.5h5M8.5 18h7" />
      {dot(8.6, 15.5, 1.3)}
    </>
  ),
  ticket: (
    <>
      <path d="M4 6.5h16v3.5a2 2 0 0 0 0 4v3.5H4V14a2 2 0 0 0 0-4z" />
      {dot(9.5, 12, 1.4)}
    </>
  ),
  photo: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M4.5 17.5l5-5 4 4 2.5-2.5 3.5 3.5" />
      {dot(15.5, 9.5, 1.7)}
    </>
  ),
  tag: (
    <>
      <path d="M4 12.5V5a1 1 0 0 1 1-1h7.5l7.8 7.8a1.2 1.2 0 0 1 0 1.7l-6.8 6.8a1.2 1.2 0 0 1-1.7 0z" />
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
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}
