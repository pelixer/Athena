// 갤러리 전용: 메모리 안의 IndexedDB. 아티팩트 샌드박스에서도 화면을 예시 데이터로 렌더링할 수 있다.
import { IDBKeyRange, indexedDB } from 'fake-indexeddb'

export const dexieOptions = { indexedDB, IDBKeyRange }
