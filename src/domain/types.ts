// 용어집(docs/CONCEPT.md)과 1:1로 대응하는 도메인 타입.

export type ID = string

export type VisitKind = 'exhibition' | 'concert' | 'daily'

/** 하나의 전시/공연/하루 경험. 오브제들의 묶음. */
export interface Visit {
  id: ID
  title: string
  kind: VisitKind
  venue?: string
  startedAt: number
  endedAt?: number
}

export interface GeoPoint {
  lat: number
  lng: number
}

/** 현장 설명문. 사진에서 추출한 텍스트 원문. */
export interface Docent {
  photoId?: ID
  /** 첫 줄: 작가, 〈작품명〉, 연도 */
  heading?: string
  text: string
}

/** 사진 한 장으로 기록되는 대상. */
export interface Obje {
  id: ID
  visitId: ID | null
  photoId: ID
  takenAt: number
  /** 작품명 등. 없으면 화면에서 순번으로 대신한다. */
  title?: string
  /** 사람이 읽는 장소: "국립현대미술관 서울 · 3전시실" */
  place?: string
  location?: GeoPoint
  /** '#' 없이 저장한다. */
  tags: string[]
  docent?: Docent
  /** 나만의 도슨트, 감정, 해석. */
  note?: string
  noteUpdatedAt?: number
  createdAt: number
}

export interface Photo {
  id: ID
  blob: Blob
}
