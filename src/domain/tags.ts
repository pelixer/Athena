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
