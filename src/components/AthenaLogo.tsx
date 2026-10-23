/**
 * AthenaLogo — 8a 신전 + 새김 대문자 (design/source/v2/Athena Brand · AthenaLogo, 토큰 --logo-*).
 * mark: 신전 심볼만 · lockup: 가로형(심볼 + ATHENA) · stacked: 세로형.
 * size = 심볼 높이(px). 선 굵기는 심볼 좌표 1.6, 화면에서 0.75px보다 가늘어지지 않게 (--logo-stroke, --logo-stroke-min).
 * 색은 currentColor (홈·첫 실행은 --accent 하늘).
 */
const VB = { y: 66, w: 152, h: 130 }
const BASE = 192 // 받침 아래 변

function Mark({ size, baseline }: { size: number; baseline?: boolean }) {
  const scale = size / VB.h
  const stroke = Math.max(1.6, 0.75 / scale)
  // 심볼의 기준선 = 받침 아래 변(선 바깥쪽). SVG의 기준선은 상자 아래 끝이라, 아래 여백(196 − 192 − 선 절반)만큼 그림을 내려
  // 기준선 정렬(align-items: last baseline)로 옆 글자의 밑선에 맞출 수 있게 한다 (카드 서명, R3).
  // 가로형 안에서 기준선에 참여하는 것은 심볼뿐이라 로고 전체의 기준선도 받침이 된다(심볼이 가장 커서 위치는 가운데와 같다)
  const below = (VB.y + VB.h - BASE - stroke / 2) * (size / VB.h)
  return (
    <svg viewBox="24 66 152 130" width={(size * VB.w) / VB.h} height={size} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" focusable="false" style={baseline ? { display: 'block', flex: 'none', alignSelf: 'baseline', position: 'relative', top: below } : { display: 'block', flex: 'none' }}>
      <polygon points="46.50,180.00 48.00,118.00 60.00,118.00 61.50,180.00" />
      <line x1="51.50" y1="180.00" x2="52.00" y2="118.00" />
      <line x1="56.50" y1="180.00" x2="56.00" y2="118.00" />
      <polygon points="48.00,118.00 45.20,113.00 62.80,113.00 60.00,118.00" />
      <rect x="44.00" y="108.00" width="20.00" height="5.00" />
      <polygon points="92.50,180.00 94.00,118.00 106.00,118.00 107.50,180.00" />
      <line x1="97.50" y1="180.00" x2="98.00" y2="118.00" />
      <line x1="102.50" y1="180.00" x2="102.00" y2="118.00" />
      <polygon points="94.00,118.00 91.20,113.00 108.80,113.00 106.00,118.00" />
      <rect x="90.00" y="108.00" width="20.00" height="5.00" />
      <polygon points="138.50,180.00 140.00,118.00 152.00,118.00 153.50,180.00" />
      <line x1="143.50" y1="180.00" x2="144.00" y2="118.00" />
      <line x1="148.50" y1="180.00" x2="148.00" y2="118.00" />
      <polygon points="140.00,118.00 137.20,113.00 154.80,113.00 152.00,118.00" />
      <rect x="136.00" y="108.00" width="20.00" height="5.00" />
      <rect x="36.00" y="98.00" width="128.00" height="10.00" />
      <rect x="32.00" y="92.00" width="136.00" height="6.00" />
      <polygon points="32.00,92.00 100.00,70.00 168.00,92.00" />
      <polygon points="57.04,88.63 100.00,74.72 142.96,88.63" />
      <rect x="36.00" y="180.00" width="128.00" height="6.00" />
      <rect x="28.00" y="186.00" width="144.00" height="6.00" />
    </svg>
  )
}

/** baseline: 가로형의 기준선을 받침 아래 변으로 (옆 글자 밑선에 맞추는 카드·입장권 서명) */
export function AthenaLogo({ variant = 'lockup', size, className, baseline }: { variant?: 'mark' | 'lockup' | 'stacked'; size: number; className?: string; baseline?: boolean }) {
  if (variant === 'mark')
    return (
      <span className={className} role="img" aria-label="Athena" style={{ display: 'inline-flex' }}>
        <Mark size={size} />
      </span>
    )
  const stacked = variant === 'stacked'
  return (
    <span
      className={className}
      role="img"
      aria-label="Athena"
      style={{ display: 'inline-flex', flexDirection: stacked ? 'column' : 'row', alignItems: 'center', gap: size * (stacked ? 0.16 : 0.28) }}
    >
      <Mark size={size} baseline={baseline && !stacked} />
      <span
        aria-hidden="true"
        style={{
          position: 'relative',
          top: stacked ? 0 : size * 0.06,
          fontFamily: 'var(--font-logo)',
          fontWeight: 600,
          fontSize: size * (stacked ? 0.22 : 0.4),
          lineHeight: 1,
          letterSpacing: 'var(--logo-tracking)',
          marginRight: 'calc(var(--logo-tracking) * -1)',
          whiteSpace: 'nowrap',
        }}
      >
        ATHENA
      </span>
    </span>
  )
}
