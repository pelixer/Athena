import { useCallback, useEffect, useRef, useState } from 'react'

export type Facing = 'environment' | 'user'

/**
 * 브라우저 카메라 뷰파인더. 카메라를 쓸 수 없으면 status가 'unavailable'이 되고,
 * 화면은 파일 선택(사진 앱/카메라 앱)으로 대신한다.
 */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [facing, setFacing] = useState<Facing>('environment')
  const [status, setStatus] = useState<'starting' | 'live' | 'unavailable'>('starting')

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable')
      return
    }
    let stream: MediaStream | undefined
    let cancelled = false
    setStatus('starting')
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: facing, width: { ideal: 2160 }, height: { ideal: 2880 } }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop())
        stream = s
        if (videoRef.current) videoRef.current.srcObject = s
        setStatus('live')
      })
      .catch(() => !cancelled && setStatus('unavailable'))
    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [facing])

  /** 현재 프레임을 JPEG로 */
  const capture = useCallback(async (): Promise<Blob | undefined> => {
    const video = videoRef.current
    if (!video || status !== 'live' || !video.videoWidth) return undefined
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? undefined), 'image/jpeg', 0.92))
  }, [status])

  const flip = useCallback(() => setFacing((f) => (f === 'environment' ? 'user' : 'environment')), [])

  return { videoRef, status, capture, flip, facing }
}
