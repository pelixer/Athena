import { describe, expect, it } from 'vitest'
import { layoutText, type OcrItem } from './ocrLayout'
import { cleanCaption, fixBrackets, fixSpacing, fixTerms, keepCaptionLines } from './captionText'
import { toDocent } from './docent'

/** 기울어진 사각형 상자 (cx, cy 중심, 각도 deg) */
function item(text: string, cx: number, cy: number, w: number, h: number, deg = 0, score = 0.95): OcrItem {
  const a = (deg * Math.PI) / 180
  const pt = (dx: number, dy: number): [number, number] => [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)]
  return { text, score, poly: [pt(-w / 2, -h / 2), pt(w / 2, -h / 2), pt(w / 2, h / 2), pt(-w / 2, h / 2)] }
}

describe('layoutText', () => {
  it('기울어진 캡션의 한 줄로 이어진 조각을 왼쪽부터 붙인다', () => {
    // -15° 기울어진 카드: "〈내면의 평화: 욕 Series〉"가 세 조각으로, 순서가 뒤섞여 들어온다
    const rot = (x: number, y: number) => {
      const a = (-15 * Math.PI) / 180
      return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)] as const
    }
    const at = (t: string, x: number, y: number, w: number) => {
      const [cx, cy] = rot(x, y)
      return item(t, cx + 300, cy + 300, w, 20, -15)
    }
    const text = layoutText([at('욕 Series〉', 200, 40, 90), at('COOL KID', 40, 0, 80), at('평화:', 120, 40, 50), at('〈내면의', 40, 40, 70), at('2015', 20, 80, 40)])
    expect(text).toBe('COOL KID\n〈내면의 평화: 욕 Series〉\n2015')
  })

  it('떨어진 카드는 따로 묶고, 점수가 낮거나 빈 껍데기는 버린다', () => {
    const text = layoutText([
      item('남규리 Nam gyuri', 600, 50, 160, 20),
      item('안순천', 80, 60, 60, 16),
      item('Dreaming', 580, 80, 100, 20),
      item('선명하게도 낯선 부재', 110, 85, 140, 18),
      item('()', 580, 110, 20, 20),
      item('흐림', 580, 140, 40, 20, 0, 0.2),
    ])
    expect(text).toBe('안순천\n선명하게도 낯선 부재\n\n남규리 Nam gyuri\nDreaming')
  })
})

describe('cleanCaption', () => {
  it('꺾쇠 짝을 맞춘다', () => {
    expect(fixBrackets('<Peacelul space), 2014')).toBe('〈Peacelul space〉, 2014')
    expect(fixBrackets('〈내면의 평화: 욕(慾) Series)')).toBe('〈내면의 평화: 욕(慾) Series〉')
    expect(fixBrackets('오헌(梧軒) 이곤')).toBe('오헌(梧軒) 이곤')
  })
  it('한글·영문 경계와 문장부호 뒤를 띄운다', () => {
    expect(fixSpacing('김민지Minji Kim')).toBe('김민지 Minji Kim')
    expect(fixSpacing('200x62cm,화선지 위에 먹,2018')).toBe('200x62cm, 화선지 위에 먹,2018')
    expect(fixSpacing('2018.11.2.(금)')).toBe('2018.11.2. (금)')
    expect(fixSpacing('blog.naver.com')).toBe('blog.naver.com')
  })
  it('재료 표기를 사전으로 바로잡되 멀면 두지 않는다', () => {
    expect(fixTerms('Acryic on canvas')).toBe('Acrylic on canvas')
    expect(fixTerms('Oil on carvas')).toBe('Oil on canvas')
    expect(fixTerms('캔버스에 유체')).toBe('캔버스에 유채')
    expect(fixTerms('비스의 유체')).toBe('비스의 유체')
    expect(fixTerms('Digital Painting')).toBe('Digital Painting')
  })
  it('여러 줄에 모두 적용한다', () => {
    expect(cleanCaption('<무제)\n혼합매체Mixed madia')).toBe('〈무제〉\n\n혼합매체 Mixed media')
    expect(cleanCaption('200x62cm,화선지 위에 먹,2018')).toBe('200x62cm, 화선지 위에 먹,2018')
  })
  it('캡션 카드의 짧은 줄은 도슨트에서도 줄마다 남고, 설명문은 문단으로 이어진다', () => {
    const caption = keepCaptionLines('김민지 Minji Kim\n혼합매체 Mixed media\n2020')
    expect(toDocent(caption).text).toBe('김민지 Minji Kim\n혼합매체 Mixed media\n2020')
    const prose = keepCaptionLines('국민대학교 회화전공 제25회 졸업전시는 정리되지\n않은 감정과 의미, 다 표현되지 못한 태도와')
    expect(toDocent(prose).text).toBe('국민대학교 회화전공 제25회 졸업전시는 정리되지 않은 감정과 의미, 다 표현되지 못한 태도와')
  })
})

import { parseCaption } from './captionParse'
describe('parseCaption', () => {
  it('제목·작가·재료·크기·연도로 나눈다', () => {
    const c = parseCaption({ text: "Survivors' Scriptures of a Waning World\n김민지 Minji Kim\n혼합매체 Mixed media\n30 X 120 X 60mm\n2020" })
    expect(c).toEqual({
      title: "Survivors' Scriptures of a Waning World",
      artist: '김민지 Minji Kim',
      rows: [
        ['재료', '혼합매체 Mixed media'],
        ['크기', '30 × 120 × 60mm'],
        ['연도', '2020'],
      ],
    })
  })
  it('꺾쇠 제목과 한 줄에 묶인 값', () => {
    const c = parseCaption({ text: '무제 No title\n갤러리피플 Gallery People\n2020 | 24 X 54 | 아크릴에 유화' })
    expect(c?.rows).toEqual([
      ['연도', '2020'],
      ['크기', '24 × 54'],
      ['재료', '아크릴에 유화'],
    ])
    expect(parseCaption({ text: '임상선\n〈Peaceful space〉, 2014\nAcrylic and wood stick on canvas\n65.1X53' })?.title).toBe('Peaceful space')
  })
  it('설명문은 나누지 않는다', () => {
    expect(parseCaption({ text: '국민대학교 회화전공 제25회 졸업전시는 정리되지 않은 감정과 의미를 다룬다.\n우리는 무엇인가를 먹고 삼키며 에너지를 얻는다. 삼킨다는 것은 외부의 것을 받아들이는 일이다.' })).toBeUndefined()
  })
})
