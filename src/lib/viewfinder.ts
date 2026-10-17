import { createContext } from 'react'

/** 갤러리에서 카메라 대신 보여 줄 정지 화면. 앱에서는 비어 있다. */
export const ViewfinderStill = createContext<string | undefined>(undefined)
