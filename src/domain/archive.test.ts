import { describe, expect, it } from 'vitest'
import { bucketOf, candidateOf, entryRows, formatLife, objeArchiveKey, snapshotOf, formatPeriod, normalize, rankArtists, rankWorks, shardKey, shardKeysOf, similarity, type ArchiveArtist, type NameEntry } from './archive'

describe('archive · 이름 맞추기', () => {
  it('정규화: 악센트·공백·괄호를 지운다', () => {
    expect(normalize('Vincent van Gogh')).toBe('vincentvangogh')
    expect(normalize('〈별이 빛나는 밤〉')).toBe('별이빛나는밤')
    expect(normalize('Édouard Manet')).toBe('edouardmanet')
  })
  it('색인 조각: 한글 초성 번호(된소리는 예사소리), 라틴 글자, 그 밖 _', () => {
    expect(shardKey(normalize('고흐'))).toBe('h0')
    expect(shardKey(normalize('쿠르베'))).toBe('h15')
    expect(shardKey(normalize('까미유'))).toBe('h0')
    expect(shardKey(normalize('하'))).toBe('h18')
    expect(shardKey(normalize('Monet'))).toBe('m')
    expect(shardKey(normalize('葛飾北斎'))).toBe('_')
    expect(shardKeysOf('빈센트 반 고흐').sort()).toEqual(['h0', 'h7'])
  })
  it('유사도: 같음 1, 포함은 길이 비율, 한 글자는 무시', () => {
    expect(similarity('모네', '모네')).toBe(1)
    expect(similarity('고흐', '빈센트 반 고흐')).toBeGreaterThan(0.6)
    expect(similarity('흐', '빈센트 반 고흐')).toBe(0)
    expect(similarity('피카소', '모네')).toBe(0)
  })
  it('작가 후보: 점수 → 작품 수 순', () => {
    const entries: NameEntry[] = [
      ['빈센트 반 고흐', 'Q5582', 900],
      ['vincent van gogh', 'Q5582', 900],
      ['테오 반 고흐', 'Q1', 0],
      ['고흐', 'Q2', 1],
    ]
    const hits = rankArtists('반 고흐', entries)
    expect(hits[0].id).toBe('Q5582')
    expect(rankArtists('고흐', entries)[0].id).toBe('Q2')
  })
  it('작품: 한국어·원어·다른 이름 중 가장 잘 맞는 것', () => {
    const artist: ArchiveArtist = {
      id: 'Q5582',
      n: { ko: '빈센트 반 고흐' },
      w: [
        { id: 'Q45585', n: { ko: '별이 빛나는 밤', en: 'The Starry Night' } },
        { id: 'Q1', n: { en: 'Starry Night Over the Rhône', alt: ['론강의 별이 빛나는 밤'] } },
      ],
    }
    expect(rankWorks('starry night', artist)[0].work.id).toBe('Q45585')
    expect(rankWorks('론강의 별이 빛나는 밤', artist)[0].work.id).toBe('Q1')
    expect(rankWorks('', artist)).toEqual([])
  })
  it('흔한 한국어 제목은 영어 제목과 같게: 무제 = Untitled', () => {
    const artist: ArchiveArtist = { id: 'A', n: {}, w: [{ id: 'W1', n: { en: 'Untitled' } }, { id: 'W2', n: { en: 'Self-Portrait' } }] }
    expect(rankWorks('무제', artist)[0].work.id).toBe('W1')
    expect(rankWorks('자화상', artist)[0].work.id).toBe('W2')
  })
  it('기간·생몰 표기', () => {
    expect(formatPeriod({ from: 1889, to: 1889 })).toBe('1889')
    expect(formatPeriod({ from: 1914, to: 1926 })).toBe('1914–1926')
    expect(formatPeriod({ from: 1650, c: 1 })).toBe('1650년 무렵')
    expect(formatPeriod({ from: -480, to: -470 })).toBe('기원전 480–기원전 470')
    expect(formatPeriod(undefined)).toBe('')
    expect(formatLife({ b: 1853, d: 1890 })).toBe('1853–1890')
    expect(formatLife({ b: 1950 })).toBe('1950–')
  })
  it('묶음 번호', () => {
    expect(bucketOf('Q5582', 1024)).toBe(5582 % 1024)
  })
})

describe('archive · 항목 표', () => {
  const vocab = {
    Q1: ['후기 인상주의', 'Post-Impressionism'],
    Q2: ['', 'oil paint'],
    Q3: ['풍경화', 'landscape'],
    Q4: ['네덜란드', 'Netherlands'],
    Q5: ['프랑스', 'France'],
    Q6: ['회화', 'painting'],
  } satisfies Record<string, [string, string]>
  it('작품 값이 있으면 그대로', () => {
    const rows = entryRows(
      { id: 'A', n: { ko: '빈센트 반 고흐' }, b: 1853, d: 1890, w: [] },
      { id: 'W', n: {}, y: { from: 1889, to: 1889 }, mt: ['Q2'], m: ['Q1'], g: ['Q3'], o: ['Q5'], k: ['Q6'] },
      vocab,
    )
    expect(rows).toEqual([
      ['작가', '빈센트 반 고흐 (1853–1890)'],
      ['작업 기간', '1889'],
      ['화법', 'oil paint'],
      ['화풍', '후기 인상주의 · 풍경화'],
      ['근원지', '프랑스'],
      ['분류', '회화'],
    ])
  })
  it('긴 목록은 넷까지 + 외 N', () => {
    const v = Object.fromEntries(['A', 'B', 'C', 'D', 'E', 'F'].map((k) => [k, [k, k] as [string, string]]))
    const rows = entryRows({ id: 'X', n: { en: 'X' }, wl: ['A', 'B', 'C', 'D', 'E', 'F'], w: [] }, { id: 'W', n: {} }, v)
    expect(rows[4]).toEqual(['근원지', 'A · B · C · D 외 2 (작가 활동지)'])
  })
  it('작가 활동기는 시작·끝을 다 알 때만', () => {
    const rows = entryRows({ id: 'A', n: { en: 'X' }, a: { to: 1519 }, w: [] }, { id: 'W', n: {} }, vocab)
    expect(rows[1]).toEqual(['작업 기간', '기록 없음'])
  })
  it('작품에 없으면 작가 쪽 값을 밝혀서, 끝내 없으면 기록 없음', () => {
    const rows = entryRows({ id: 'A', n: { en: 'X' }, m: ['Q1'], c: ['Q4'], a: { from: 1880, to: 1890 }, w: [] }, { id: 'W', n: {} }, vocab)
    expect(rows).toEqual([
      ['작가', 'X'],
      ['작업 기간', '1880–1890 (작가 활동기)'],
      ['화법', '기록 없음'],
      ['화풍', '후기 인상주의 (작가의 사조)'],
      ['근원지', '네덜란드 (작가 국적)'],
    ])
  })
})

describe('archive · 오브제 메타', () => {
  it('열쇠: 제목과 작가가 다 있어야', () => {
    expect(objeArchiveKey('별이 빛나는 밤', '고흐')).toBe('별이빛나는밤|고흐')
    expect(objeArchiveKey('별이 빛나는 밤', ' ')).toBeUndefined()
    expect(objeArchiveKey(undefined, '고흐')).toBeUndefined()
  })
  it('스냅숏: 표 줄 · 짧은 해 · 원어 제목', () => {
    const artist: ArchiveArtist = { id: 'Q5582', n: { ko: '빈센트 반 고흐' }, b: 1853, d: 1890, w: [] }
    const work = { id: 'Q45585', n: { ko: '별이 빛나는 밤', en: 'The Starry Night' }, y: { from: 1889, to: 1889 } }
    const s = snapshotOf(artist, work, {}, 'archive-x', 'k', 1)
    expect(s).toMatchObject({ state: 'linked', workId: 'Q45585', artistId: 'Q5582', title: '별이 빛나는 밤', subtitle: 'The Starry Night', short: '1889', version: 'archive-x' })
    expect(s.rows?.[0]).toEqual(['작가', '빈센트 반 고흐 (1853–1890)'])
    expect(candidateOf(artist, work)).toEqual({ workId: 'Q45585', artistId: 'Q5582', title: '별이 빛나는 밤', meta: '빈센트 반 고흐 · 1889' })
  })
})
