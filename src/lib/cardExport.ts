import { toBlob } from 'html-to-image'

/** 카드 DOM → PNG. 화면의 카드(280×420)를 1080 폭으로 그린다. 그림자는 화면용이라 뺀다. cacheBust는 blob: 사진 주소를 깨뜨리므로 쓰지 않는다. */
export async function renderCard(node: HTMLElement): Promise<Blob> {
  const blob = await toBlob(node, { pixelRatio: 3.86, style: { boxShadow: 'none' } })
  if (!blob) throw new Error('카드 이미지를 만들지 못했어요')
  return blob
}

/** 공유 시트가 있으면 공유, 없으면 파일로 저장 */
export async function shareCard(blob: Blob, filename: string): Promise<'shared' | 'saved'> {
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file] })
    return 'shared'
  }
  saveCard(blob, filename)
  return 'saved'
}

export function saveCard(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
