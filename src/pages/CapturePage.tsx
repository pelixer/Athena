import { useContext, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { db } from '../data/db'
import { useLive, usePhotoUrl } from '../data/hooks'
import { addObje, attachDocent, latestObje, setDocentText } from '../data/repo'
import { sequenceOf } from '../domain/sequence'
import type { GeoPoint } from '../domain/types'
import { useCamera } from '../lib/camera'
import { ViewfinderStill } from '../lib/viewfinder'
import { currentPosition, readPhotoMeta } from '../lib/photoMeta'
import { extractText, warmUpOcr } from '../lib/ocr'
import { formatGeo, formatIndex, formatTimeSeconds } from '../lib/format'
import { IconButton } from '../components/IconButton'
import { IndexBadge } from '../components/IndexBadge'
import { ModeSwitch } from '../components/ModeSwitch'
import { AttachConfirm } from '../components/AttachConfirm'
import { ShutterButton } from '../components/ShutterButton'
import { Toast } from '../components/Toast'
import styles from './CapturePage.module.css'

type Mode = 'obje' | 'docent'

/**
 * 01 촬영 · CapturePage — 연속 촬영. 오브제를 찍고, 도슨트 모드로 설명문을 찍으면 가장 최근 오브제에 붙는다.
 * 왼쪽 아래 사진 버튼으로 사진을 첨부하면 ModeSwitch가 AttachConfirm(✓오브제 / ✓도슨트)으로 바뀌고, ×로 첨부를 취소한다.
 */
export function CapturePage() {
  const { visitId = '' } = useParams()
  const navigate = useNavigate()
  const camera = useCamera()
  const still = useContext(ViewfinderStill)
  const fileRef = useRef<HTMLInputElement>(null)
  const [params] = useSearchParams()
  const [mode, setMode] = useState<Mode>(params.get('mode') === 'docent' ? 'docent' : 'obje')
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState(0)
  const [toast, setToast] = useState<string>()
  const [position, setPosition] = useState<GeoPoint>()
  const [attached, setAttached] = useState<{ file: File; url: string }>()
  const now = useClock()

  const data = useLive(async () => {
    const visit = await db.visits.get(visitId)
    const objes = await db.objes.where('visitId').equals(visitId).toArray()
    const latest = objes.sort((a, b) => a.takenAt - b.takenAt).at(-1)
    return { visit, count: objes.length, latest, latestIndex: latest ? sequenceOf(objes).get(latest.id) : undefined }
  }, [visitId])
  const latestSrc = usePhotoUrl(data?.latest?.photoId)

  useEffect(() => {
    currentPosition().then(setPosition)
  }, [])

  useEffect(() => {
    if (mode === 'docent') warmUpOcr()
  }, [mode])

  useEffect(() => {
    if (attached) return () => URL.revokeObjectURL(attached.url)
  }, [attached])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(undefined), 2600)
    return () => clearTimeout(t)
  }, [toast])

  async function handlePhoto(photo: Blob, fromFile: boolean, kind: Mode = mode) {
    if (!data?.visit) return
    setBusy(true)
    try {
      if (kind === 'obje') {
        const meta = fromFile ? await readPhotoMeta(photo) : { takenAt: Date.now(), location: position }
        await addObje({ visitId, photo, ...meta, place: data.visit.venue })
      } else {
        const target = await latestObje(visitId)
        if (!target) {
          setToast('먼저 오브제를 찍어 주세요')
          return
        }
        await attachDocent(target.id, photo)
        const n = formatIndex(data.latestIndex ?? data.count)
        setToast(`설명문을 읽는 중 · ${n}`)
        // 글자 읽기는 촬영을 막지 않는다. 화면을 떠나도 끝까지 읽고 저장한다.
        extractText(photo)
          .then(async (text) => {
            await setDocentText(target.id, text)
            setToast(text.trim() ? `설명문이 인식되었어요 · ${n}에 붙입니다` : `글자를 읽지 못했어요 · 사진은 ${n}에 붙였어요`)
          })
          .catch(() => setToast(`글자를 읽지 못했어요 · 사진은 ${n}에 붙였어요`))
      }
    } finally {
      setBusy(false)
    }
  }

  async function shoot() {
    if (camera.status !== 'live') return pick()
    setFlash((n) => n + 1)
    const photo = await camera.capture()
    if (photo) await handlePhoto(photo, false)
  }

  function pick() {
    fileRef.current?.click()
  }

  function attach(file: File) {
    setAttached({ file, url: URL.createObjectURL(file) })
  }

  function detach() {
    setAttached(undefined)
  }

  async function confirm(kind: Mode) {
    if (!attached) return
    setMode(kind)
    await handlePhoto(attached.file, true, kind)
    detach()
    if (kind === 'obje') setToast(`${formatIndex(data!.count + 1)} 오브제로 저장했어요`)
  }

  if (!data) return null
  if (!data.visit) return <p className={styles.missing}>관람을 찾을 수 없어요.</p>
  const nextIndex = mode === 'obje' ? data.count + 1 : data.latestIndex ?? 1
  const live = !still && camera.status === 'live'

  return (
    <div className={styles.screen}>
      {attached ? (
        <img className={`${styles.viewfinder} ${styles.attached}`} src={attached.url} alt="첨부한 사진" />
      ) : still ? (
        <img className={styles.viewfinder} src={still} alt="" />
      ) : (
        <video ref={camera.videoRef} className={styles.viewfinder} autoPlay playsInline muted />
      )}

      {!attached &&
        (mode === 'obje' ? (
          <div className={styles.frame} aria-hidden>
            <span className={styles.cornerTL} />
            <span className={styles.cornerTR} />
            <span className={styles.cornerBL} />
            <span className={styles.cornerBR} />
          </div>
        ) : (
          <div className={styles.docentFrame} aria-hidden />
        ))}
      {flash > 0 && <div key={flash} className={styles.flash} />}

      <div className={styles.scrimTop} />
      <div className={styles.top}>
        <IconButton icon="close" surface="photo" aria-label="닫기" onClick={() => navigate(`/visit/${visitId}`)} />
        {/* 지금 관람 중인 전시와 이번에 찍힐 순번. 누르는 버튼이 아니라 안내다. */}
        <div className={styles.status}>
          <span className={styles.eyebrow}>
            <span className={styles.dot} />
            {attached ? '첨부한 사진' : `관람 중 · 다음 ${formatIndex(nextIndex)}`}
          </span>
          <span className={styles.visitTitle}>{data.visit.title}</span>
        </div>
        {live && !attached ? (
          <IconButton icon="flip" surface="photo" aria-label="카메라 전환" onClick={camera.flip} />
        ) : (
          <span className={styles.slot} />
        )}
      </div>

      {toast ? (
        <div className={styles.toast}>
          <Toast>{toast}</Toast>
        </div>
      ) : (
        !still &&
        !attached &&
        camera.status === 'unavailable' && <p className={styles.unavailable}>카메라를 열 수 없어요{'\n'}왼쪽 아래에서 사진을 고르세요</p>
      )}

      <div className={styles.scrim} />
      <div className={styles.bottom}>
        <div className={styles.meta}>
          <span className={styles.clock}>{formatTimeSeconds(now)}</span>
          <span>{[data.visit.venue, position && formatGeo(position)].filter(Boolean).join(' · ')}</span>
        </div>
        {attached ? (
          <AttachConfirm onConfirm={confirm} disabled={busy ? ['obje', 'docent'] : data.latest ? [] : ['docent']} />
        ) : (
          <ModeSwitch
            options={[
              { value: 'obje', label: '오브제' },
              { value: 'docent', label: '도슨트' },
            ]}
            value={mode}
            onChange={setMode}
          />
        )}
        <div className={styles.controls}>
          {attached ? (
            <IconButton icon="close" surface="photo" size={52} aria-label="첨부 취소" onClick={detach} disabled={busy} />
          ) : (
            <IconButton icon="photo" surface="photo" size={52} aria-label="사진에서 고르기" onClick={pick} />
          )}
          <span className={attached ? styles.shutterOff : undefined}>
            <ShutterButton mode={mode} onPress={shoot} disabled={busy || !!attached} />
          </span>
          {data.latest ? (
            <Link key={data.latest.id} to={`/obje/${data.latest.id}`} className={styles.last} style={latestSrc ? { backgroundImage: `url(${latestSrc})` } : undefined} aria-label="마지막 오브제 보기">
              <span className={styles.lastBadge}>
                <IndexBadge index={data.latestIndex ?? data.count} variant="corner" short />
              </span>
            </Link>
          ) : (
            <span className={styles.lastEmpty} />
          )}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) attach(file)
        }}
      />
    </div>
  )
}

function useClock() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}
