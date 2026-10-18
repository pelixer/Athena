const TAG_PATTERN = /#([^\s#]+)/gu

/** "#데이비드호크니 #다이빙" → ['데이비드호크니', '다이빙'] (중복 제거, 입력 순서 유지) */
export function parseTags(input: string): string[] {
  const tags = Array.from(input.matchAll(TAG_PATTERN), (m) => m[1])
  return [...new Set(tags)]
}

export function formatTag(tag: string): string {
  return `#${tag}`
}

/** 라벨 입력칸: '#'을 빼먹은 단어도 라벨로 받는다. "흰절벽 #바다" → ['흰절벽', '바다'] */
export function parseTagInput(input: string): string[] {
  return parseTags(
    input
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => (w.startsWith('#') ? w : `#${w}`))
      .join(' '),
  )
}

/**
 * 라벨 입력칸을 쓰는 동안의 값. 띄어쓰기를 하면 바로 '#'을 붙이고, 지우는 중에는 끼어들지 않는다.
 * prev: 직전 값, next: 방금 입력된 값.
 *   "" → "흰" : "#흰"          "#흰절벽" → "#흰절벽 " : "#흰절벽 #"
 *   "#흰절벽 #" → "#흰절벽 " (지움) : "#흰절벽"
 */
export function typeTagInput(prev: string, next: string): string {
  if (next.length < prev.length) {
    // 빈 '#'을 지우면 앞의 띄어쓰기도 같이 지운다 (다시 '#'이 붙는 걸 막는다)
    return next.replace(/\s+#?$/, '')
  }
  const words = next.trim().split(/\s+/)
  const tags = words.map((w) => w.replace(/#/g, '')).filter(Boolean)
  // 띄어쓰기로 끝났거나 마지막 단어가 아직 빈 '#'이면, 다음 라벨 자리 '#'을 남긴다
  const pending = /\s$/.test(next) || /^#*$/.test(words.at(-1) ?? '')
  const out = tags.map((t) => `#${t}`).join(' ')
  if (!out) return next.trim() ? '#' : ''
  return pending ? `${out} #` : out
}
