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
  /** 작가 (사용자가 쓴 그대로). 제목과 함께 아트 아카이브를 맞추는 데 쓴다 */
  artist?: string
  /** 사람이 읽는 장소: "국립현대미술관 서울 · 3전시실" */
  place?: string
  location?: GeoPoint
  /** '#' 없이 저장한다. */
  tags: string[]
  docent?: Docent
  /** 나만의 도슨트, 감정, 해석. */
  note?: string
  noteUpdatedAt?: number
  /** 아트 아카이브에서 맞춘 메타 (오브제 위에 매달린 표로 보인다). 맞춘 때의 값을 그대로 담아 오프라인에서도 보인다 */
  archive?: ObjeArchive
  createdAt: number
}

/** 오브제에 붙은 아카이브 메타 — 작가 · 작업 기간 · 화법 · 화풍 · 근원지 */
export interface ObjeArchive {
  /** 맞출 때 쓴 입력(정규화한 "제목|작가"). 입력이 바뀌면 다시 맞춘다 */
  query: string
  /** linked = 맞춤, none = 못 찾음(후보만 있을 수 있음), off = 사용자가 뗌 */
  state: 'linked' | 'none' | 'off'
  workId?: string
  artistId?: string
  /** 데이터 판 (archive-YYYYMMDD-HHMM) */
  version?: string
  title?: string
  subtitle?: string
  /** 짧은 표시 (매달린 표 위): 작업 기간의 해 등 */
  short?: string
  rows?: [label: string, value: string][]
  candidates?: ArchiveCandidate[]
  at: number
}

export interface ArchiveCandidate {
  workId: string
  artistId: string
  title: string
  /** "빈센트 반 고흐 · 1889" */
  meta: string
}

export interface Photo {
  id: ID
  blob: Blob
}
