/**
 * Icon — v2.3 (design/icons, 디자인 System "아이콘"). 24 격자, 선 1.25, 끝 자름(butt), 90° 꺾임(miter), 점 없음.
 * 선 색은 글자색(currentColor)을 따른다.
 */
export type IconName = 'back' | 'forward' | 'close' | 'add' | 'share' | 'save' | 'flip' | 'write' | 'card' | 'ticket' | 'photo' | 'tag' | 'check' | 'delete' | 'pin' | 'folder' | 'more' | 'search' | 'sort' | 'undo' | 'info' | 'grid' | 'list' | 'seal' | 'unfolder'

const PATHS: Record<IconName, string> = {
  back: 'M19 12H5M11 6L5 12L11 18',
  forward: 'M5 12H19M13 6L19 12L13 18',
  close: 'M6 6L18 18M18 6L6 18',
  add: 'M12 5V19M5 12H19',
  share: 'M5 20V11H18M14 7L18 11L14 15',
  save: 'M12 4V15M7 10L12 15L17 10M5 20H19',
  flip: 'M5 9H18M15 6L18 9L15 12M19 15H6M9 12L6 15L9 18',
  write: 'M5 19V15L15 5L19 9L9 19ZM13 7L17 11',
  card: 'M5 3H19V21H5ZM8 6H16V12H8ZM8 16H16',
  ticket: 'M3 6H21V10H19V14H21V18H3V14H5V10H3Z',
  photo: 'M3 5H21V19H3ZM3 16L9 10L14 15L16 13L21 18',
  tag: 'M4 4H12L20 12L12 20L4 12Z',
  check: 'M5 12L10 17L19 7',
  delete: 'M4 6H20M9 6V3H15V6M6 6V21H18V6',
  pin: 'M9 3H15M10 3V10L6 14H18L14 10V3M12 14V21',
  folder: 'M3 6H10L12 8H21V19H3Z',
  more: 'M4 12H6M11 12H13M18 12H20',
  search: 'M4 4H15V15H4ZM15 15L20 20',
  sort: 'M7 4V20M3 16L7 20L11 16M14 6H21M14 11H19M14 16H17',
  undo: 'M9 4L4 9L9 14M4 9H16V20H8',
  info: 'M4 4H20V20H4ZM12 11V17M12 7V8.5',
  grid: 'M4 4H10V10H4ZM14 4H20V10H14ZM4 14H10V20H4ZM14 14H20V20H14Z',
  list: 'M8 6H20M8 12H20M8 18H20M3 6H5M3 12H5M3 18H5',
  seal: 'M5 3H19V21L12 16L5 21Z',
  unfolder: 'M3 6H10L12 8H21V19H3ZM9 13.5H15',
}

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="butt" strokeLinejoin="miter" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  )
}
