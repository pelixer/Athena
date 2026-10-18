/**
 * 미술 작품 캡션 OCR 결과 다듬기. 엔진이 자주 틀리는 것만 고친다 — 확실하지 않으면 건드리지 않는다.
 */

/** 캡션에 자주 나오는 재료·형식 표기. 한두 글자 틀린 것을 바로잡는다 */
const TERMS = [
  '캔버스에 유채',
  '캔버스에 아크릴',
  '종이에 수채',
  '종이에 연필',
  '종이에 먹',
  '한지에 수묵',
  '한지에 채색',
  '비단에 채색',
  '화선지에 먹',
  '혼합매체',
  '가변크기',
  '단채널 비디오',
  '디지털 프린트',
  '피그먼트 프린트',
  '작가 소장',
  'Oil on canvas',
  'Acrylic on canvas',
  'Watercolor on paper',
  'Ink on paper',
  'Mixed media',
  'Digital print',
  'Pigment print',
  'Single-channel video',
  'Dimensions variable',
  'Courtesy of the artist',
]

export function cleanCaption(text: string): string {
  return keepCaptionLines(
    text
      .split('\n')
      .map((line) => fixTerms(fixSpacing(fixBrackets(line))))
      .join('\n'),
  )
}

/**
 * 도슨트는 빈 줄로 나뉜 덩어리 안의 줄을 한 문단으로 잇는다(설명문의 줄바꿈은 사진 폭 때문이므로).
 * 하지만 캡션 카드의 줄은 작가·제목·재료·크기처럼 따로따로다. 짧은 줄로 된 덩어리는 줄마다 나눠 둔다.
 */
export function keepCaptionLines(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split('\n').filter((l) => l.trim())
      const lengths = lines.map((l) => l.replace(/\s+/g, '').length).sort((a, b) => a - b)
      const median = lengths[Math.floor(lengths.length / 2)] ?? 0
      return lines.length > 1 && median < 20 ? lines.join('\n\n') : block
    })
    .join('\n\n')
}

/** 〈작품명〉의 꺾쇠가 "<", ")" 등으로 읽힌다. 여는 꺾쇠가 있는 줄에서 짝을 맞춘다 */
export function fixBrackets(line: string): string {
  let out = line.replace(/</g, '〈').replace(/>/g, '〉').replace(/≪/g, '《').replace(/≫/g, '》')
  for (const [open, close] of [
    ['〈', '〉'],
    ['《', '》'],
  ]) {
    const opens = out.split(open).length - 1
    const closes = out.split(close).length - 1
    if (opens > closes) {
      // 짝 없는 여는 꺾쇠 뒤의 첫 ")"를 닫는 꺾쇠로 (단, "("와 짝인 ")"는 남긴다)
      const at = out.lastIndexOf(open)
      let depth = 0
      for (let i = at + 1; i < out.length; i++) {
        if (out[i] === '(') depth++
        else if (out[i] === ')') {
          if (depth === 0) {
            out = out.slice(0, i) + close + out.slice(i + 1)
            break
          }
          depth--
        }
      }
    }
  }
  return out
}

/** 띄어쓰기가 빠지기 쉬운 자리만 띄운다: 한글↔영문 경계, 쉼표 뒤, 한글 앞 마침표 뒤 */
export function fixSpacing(line: string): string {
  return line
    .replace(/([가-힣])([A-Za-z])/g, '$1 $2')
    .replace(/([A-Za-z])([가-힣])/g, '$1 $2')
    .replace(/(,)([가-힣A-Za-z〈《(])/g, '$1 $2')
    .replace(/([.!?])([가-힣〈《(])/g, '$1 $2') // 영문 뒤 마침표는 주소·약어일 수 있어 두지 않는다
    .replace(/ {2,}/g, ' ')
}

/** 표기 사전과 거의 같은(공백 무시, 6글자 이상이고 첫 글자가 같으며 6글자에 한 글자꼴로만 다른) 구간을 사전 표기로 바꾼다 */
export function fixTerms(line: string): string {
  let out = line
  for (const term of TERMS) {
    const target = term.replace(/\s+/g, '').toLowerCase()
    // 짧은 표기는 한 글자만 달라도 뜻이 바뀐다 ("화선지 위에 먹" ≠ "화선지에 먹"). 6글자 이상만
    if (target.length < 6) continue
    const budget = Math.floor(target.length / 6)
    const chars: { c: string; i: number }[] = []
    for (let i = 0; i < out.length; i++) if (!/\s/.test(out[i])) chars.push({ c: out[i].toLowerCase(), i })
    const text = chars.map((c) => c.c).join('')
    if (text.includes(target)) continue
    let best: { from: number; to: number; d: number; off: number } | undefined
    for (let start = 0; start < chars.length; start++) {
      if (chars[start].c !== target[0]) continue
      for (let len = target.length - budget; len <= target.length + budget; len++) {
        if (start + len > chars.length) break
        const d = distance(text.slice(start, start + len), target)
        const off = Math.abs(len - target.length)
        // 단어 중간을 자르지 않는다 ("Digital Painting"이 "Digital print"가 되지 않게)
        const before = out[chars[start].i - 1] ?? ' '
        const after = out[chars[start + len - 1].i + 1] ?? ' '
        if (/[A-Za-z가-힣]/.test(before) || /[A-Za-z가-힣]/.test(after)) continue
        // 같은 차이면 길이가 사전 표기와 같은 구간을 고른다
        if (d <= budget && (!best || d < best.d || (d === best.d && off < best.off))) best = { from: chars[start].i, to: chars[start + len - 1].i + 1, d, off }
      }
    }
    if (best) out = out.slice(0, best.from) + term + out.slice(best.to)
  }
  return out
}

function distance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    prev = cur
  }
  return prev[b.length]
}
