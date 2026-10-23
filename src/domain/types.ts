// 용어집(docs/CONCEPT.md)과 1:1로 대응하는 도메인 타입.

export type ID = string

export type VisitKind = 'exhibition' | 'concert' | 'daily'

/** 컬렉션 — 하나의 전시·공연·여행·하루처럼 함께 모은 오브제들의 묶음. 화면 이름은 "컬렉션", 코드 이름은 Visit. */
export interface Visit {
  id: ID
  title: string
  kind: VisitKind
  venue?: string
  startedAt: number
  endedAt?: number
  /** 홈·폴더 목록 맨 위에 고정한 시각 (없으면 고정 안 함) */
  pinnedAt?: number
  /** 들어 있는 폴더 (없으면 홈에 바로) */
  folderId?: ID
}

/** 폴더 — 컬렉션을 묶어 두는 곳. */
export interface Folder {
  id: ID
  name: string
  createdAt: number
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
  /** 기기 안 OCR 상태: 읽는 중(시작 시각) · 실패. 다 읽으면 없앤다 */
  ocr?: { state: 'reading' | 'failed'; at: number }
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
