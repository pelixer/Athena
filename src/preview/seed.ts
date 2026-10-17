import { db } from '../data/db'
import type { Obje, Visit } from '../domain/types'
import cliffSky from '../../design/source/v0/assets/cliff-sky.jpg'
import cliffDover from '../../design/source/v0/assets/cliff-dover.jpg'
import marble from '../../design/source/v0/assets/marble.jpg'

/** 시안(Athena Screens v0)과 같은 예시 관람. 갤러리의 화면 프레임이 이 데이터로 렌더링된다. */
export const SAMPLE = { visitId: 'sample-visit', objeId: 'sample-07' }

const day = (h: number, m: number, s = 0) => new Date(2026, 9, 17, h, m, s).getTime()

async function blobOf(url: string): Promise<Blob> {
  if (!url.startsWith('data:')) return (await fetch(url)).blob()
  const [head, body] = url.split(',')
  const bytes = Uint8Array.from(atob(body), (c) => c.charCodeAt(0))
  return new Blob([bytes], { type: head.slice(5).split(';')[0] })
}

export async function seedSample() {
  if (await db.visits.get(SAMPLE.visitId)) return
  const photos = { sky: await blobOf(cliffSky), dover: await blobOf(cliffDover), marble: await blobOf(marble) }
  await db.photos.bulkAdd(Object.entries(photos).map(([id, blob]) => ({ id, blob })))

  const visit: Visit = {
    id: SAMPLE.visitId,
    title: '흰 절벽 — 한서윤 사진전',
    venue: '국립현대미술관 서울',
    kind: 'exhibition',
    startedAt: day(13, 5),
    endedAt: day(15, 20),
  }
  const place = '국립현대미술관 서울'
  const location = { lat: 37.5788, lng: 126.98 }
  const docent = (heading: string) => ({ heading, text: '피그먼트 프린트. 작가는 같은 절벽을 일 년 동안 같은 시각에 촬영했다. 백악질 절벽은 계절과 빛에 따라 회색에서 푸른빛까지 색을 바꾼다.' })
  const base = { visitId: visit.id, tags: [] as string[], createdAt: 0, place, location }
  const objes: Obje[] = [
    { ...base, id: 'sample-01', photoId: 'marble', takenAt: day(13, 6), title: '대리석 계단' },
    { ...base, id: 'sample-02', photoId: 'sky', takenAt: day(13, 18), title: '입구의 하늘', tags: ['하늘'] },
    { ...base, id: 'sample-03', photoId: 'dover', takenAt: day(13, 31), title: '구름, 같은 시각', docent: docent('한서윤, 〈구름, 같은 시각〉, 2018'), tags: ['하늘'] },
    { ...base, id: 'sample-04', photoId: 'sky', takenAt: day(13, 47), title: '백악의 결', note: '가까이서 보면 흰색이 아니라 회색의 결이다.', tags: ['흰절벽'] },
    { ...base, id: 'sample-05', photoId: 'marble', takenAt: day(14, 2), title: '전시실 바닥' },
    { ...base, id: 'sample-06', photoId: 'sky', takenAt: day(14, 20), title: '자갈, 연작 No.3', docent: docent('한서윤, 〈자갈, 연작 No.3〉, 2019'), tags: ['바다'] },
    {
      ...base,
      id: SAMPLE.objeId,
      photoId: 'dover',
      takenAt: day(14, 32, 18),
      title: '남쪽 해안, 오후 세 시',
      place: '국립현대미술관 서울 · 3전시실',
      tags: ['흰절벽', '바다', '한서윤'],
      docent: docent('한서윤, 〈남쪽 해안, 오후 3시〉, 2019'),
      note: '절벽은 하얗다기보다, 하늘을 오래 비춰서 푸르게 바랜 것 같았다. 사진 앞에 서 있으니 바닷바람 소리가 들리는 듯했다.',
      noteUpdatedAt: day(14, 36),
    },
  ]
  await db.visits.add(visit)
  await db.objes.bulkAdd(objes)
}

export const samplePhotos = { cliffSky, cliffDover, marble }
