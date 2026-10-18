import { useContext, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { db } from '../data/db'
import { useLive, usePhotoUrl } from '../data/hooks'
import { addObje, attachDocent, latestAdded, latestObje, setDocentText } from '../data/repo'
import { sequenceOf } from '../domain/sequence'
import type { GeoPoint } from '../domain/types'
import { useCamera } from '../lib/camera'
import { ViewfinderStill } from '../lib/viewfinder'
import { currentPosition, readPhotoMeta } from '../lib/photoMeta'
import { extractText, warmUpOcr } from '../lib/ocr'
import { formatIndex, formatTime } from '../lib/format'
import { IconButton } from '../components/IconButton'
import { IndexBadge } from '../components/IndexBadge'
import { ModeSwitch } from '../components/ModeSwitch'
import { ShutterButton } from '../components/ShutterButton'
import { Toast } from '../components/Toast'
import styles from './CapturePage.module.css'

type Mode = 'obje' | 'docent'

/**
 * 01 촬영 · CapturePage — 연속 촬영. 오브제를 찍고, 캡션 모드로 작품 캡션을 찍으면 가장 최근에 추가한 오브제에 붙는다.
 * 오른쪽 아래 썸네일이 그 오브제(캡션이 붙을 곳)다.
 * 왼쪽 아래 사진 버튼으로 사진을 첨부하면: ModeSwitch로 오브제/캡션을 고르고, 셔터 자리의 ✓로 추가, ×로 취소.
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
    // 캡션이 붙을 오브제 = 가장 최근에 추가한 오브제 (찍은 시각이 아니라 추가한 순서)
    const target = latestAdded(objes)
    return { visit, count: objes.length, target, targetIndex: target ? sequenceOf(objes).get(target.id) : undefined }
  }, [visitId])
  const targetSrc = usePhotoUrl(data?.target?.photoId)

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
        const obje = await addObje({ visitId, photo, ...meta, place: data.visit.venue })
        // 사진첩에서 올린 사진은 어디에 무엇으로 들어갔는지 알려 준다 (연속 촬영은 썸네일로 충분)
        if (fromFile) setToast(`${await indexLabel(obje.id)} 오브제로 추가했어요`)
      } else {
        const target = await latestObje(visitId)
        if (!target) {
          setToast('캡션을 붙일 오브제가 없어요 · 먼저 오브제를 추가하세요')
          return
        }
        await attachDocent(target.id, photo)
        const n = await indexLabel(target.id)
        setToast(`${n} 오브제에 캡션을 붙였어요 · 글자 읽는 중`)
        // 글자 읽기는 촬영을 막지 않는다. 화면을 떠나도 끝까지 읽고 저장한다.
        extractText(photo)
          .then(async (text) => {
            await setDocentText(target.id, text)
            setToast(text.trim() ? `${n} 캡션 글자를 읽었어요` : `글자를 읽지 못했어요 · 사진은 ${n}에 붙였어요`)
          })
          .catch(() => setToast(`글자를 읽지 못했어요 · 사진은 ${n}에 붙였어요`))
      }
    } finally {
      setBusy(false)
    }
  }

  async function indexLabel(objeId: string) {
    const objes = await db.objes.where('visitId').equals(visitId).toArray()
    return formatIndex(sequenceOf(objes).get(objeId) ?? objes.length)
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

  async function confirm() {
    if (!attached) return
    await handlePhoto(attached.file, true)
    detach()
  }

  if (!data) return null
  if (!data.visit) return <p className={styles.missing}>관람을 찾을 수 없어요.</p>
  const live = !still && camera.status === 'live'
  const targetLabel = data.target ? formatIndex(data.targetIndex ?? data.count) : undefined
  const canAdd = mode === 'obje' || !!data.target
  // 지금 이 사진(셔터·첨부)이 어디로 가는지 한 줄로
  const hint =
    mode === 'docent'
      ? targetLabel
        ? `캡션은 ${targetLabel} 오브제에 붙어요`
        : '캡션을 붙일 오브제가 없어요 · 먼저 오브제를 추가하세요'
      : attached
        ? '새 오브제로 추가해요'
        : undefined

  return (
    <div className={styles.screen}>
      {attached ? (
        <img className={`${styles.viewfinder} ${styles.attached}`} src={attached.url} alt="첨부한 사진" />
      ) : still ? (
        <img className={styles.viewfinder} src={still} alt="" />
      ) : (
        <video ref={camera.videoRef} className={styles.viewfinder} autoPlay playsInline muted />
      )}

      {!attached && (
        // 오브제(세로로 크게)와 캡션(가로로 작게) 프레임은 같은 모양 — 흰 둥근 모서리
        <div className={`${styles.frame} ${mode === 'obje' ? styles.frameObje : styles.frameCaption}`} aria-hidden>
          <span className={styles.cornerTL} />
          <span className={styles.cornerTR} />
          <span className={styles.cornerBL} />
          <span className={styles.cornerBR} />
        </div>
      )}
      {flash > 0 && <div key={flash} className={styles.flash} />}

      <div className={styles.scrimTop} />
      <div className={styles.top}>
        <IconButton icon="close" surface="photo" aria-label="닫기" onClick={() => navigate(`/visit/${visitId}`)} />
        {/* 지금 관람 중인 전시, 이번에 찍힐 순번과 시각. 누르는 버튼이 아니라 안내다. */}
        <div className={styles.status}>
          <span className={styles.eyebrow}>
            <span className={styles.dot} />
            {attached ? '첨부한 사진' : mode === 'obje' ? `다음 ${formatIndex(data.count + 1)} · ${formatTime(now)}` : `캡션 · ${formatTime(now)}`}
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
        {hint && <p className={styles.hint}>{hint}</p>}
        <ModeSwitch
          options={[
            { value: 'obje', label: '오브제' },
            { value: 'docent', label: '캡션' },
          ]}
          value={mode}
          onChange={setMode}
        />
        <div className={styles.controls}>
          {attached ? (
            <IconButton icon="close" surface="photo" size={52} aria-label="첨부 취소" onClick={detach} disabled={busy} />
          ) : (
            <IconButton icon="photo" surface="photo" size={52} aria-label="사진에서 고르기" onClick={pick} />
          )}
          {attached ? (
            <ShutterButton mode={mode} icon="check" label={mode === 'obje' ? '새 오브제로 추가' : '캡션으로 추가'} onPress={confirm} disabled={busy || !canAdd} />
          ) : (
            <ShutterButton mode={mode} onPress={shoot} disabled={busy || !canAdd} />
          )}
          {data.target ? (
            <Link
              key={data.target.id}
              to={`/obje/${data.target.id}`}
              className={styles.last}
              style={targetSrc ? { backgroundImage: `url(${targetSrc})` } : undefined}
              aria-label={`${targetLabel} 오브제 보기`}
            >
              <span className={styles.lastBadge}>
                <IndexBadge index={data.targetIndex ?? data.count} variant="corner" short />
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
