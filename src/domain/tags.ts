const TAG_PATTERN = /#([^\s#]+)/gu

/** "#데이비드호크니 #다이빙" → ['데이비드호크니', '다이빙'] (중복 제거, 입력 순서 유지) */
export function parseTags(input: string): string[] {
  const tags = Array.from(input.matchAll(TAG_PATTERN), (m) => m[1])
  return [...new Set(tags)]
}

export function formatTag(tag: string): string {
  return `#${tag}`
}
