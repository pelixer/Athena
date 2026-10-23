import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db } from '../data/db'
import { useLive, usePhotoUrl } from '../data/hooks'
import { createFolder, deleteVisit, endVisit, moveToFolder, reopenVisit, restoreVisit, setPinned, updateVisit } from '../data/repo'
import { sequenceOf } from '../domain/sequence'
import { attachmentLabel, visitSpan, visitStats } from '../domain/visitStats'
import type { Obje } from '../domain/types'
import { formatCount, formatDateWeekday, formatIndex, formatTime } from '../lib/format'
import { useToast } from '../lib/toast'
import { Screen } from '../components/Screen'
import { IconButton } from '../components/IconButton'
import { TabBar } from '../components/TabBar'
import { ObjeCard } from '../components/ObjeCard'
import { Sheet } from '../components/Sheet'
import { MenuList } from '../components/MenuList'
import { DeleteSheet } from '../components/DeleteSheet'
import { NewCollectionSheet } from '../components/NewCollectionSheet'
import { FolderPickSheet, type FolderChoice } from '../components/FolderPickSheet'
import { AthenaLogo } from '../components/AthenaLogo'
import { DoubleRule, StatusPill } from '../components/Stoa'
import { toOption, useLibrary } from './CollectionList'
import styles from './VisitPage.module.css'

type View = 'index' | 'tags' | 'notes'
type Editing = 'more' | 'edit' | 'move' | 'delete' | undefined

/**
 * 03 컬렉션 · VisitPage (B1–B5) — 조회를 위한 고유한 화면. 템플릿(산출물)과는 별개다.
 * 모으는 중: 하단 [입장권 · +]. 마무리: 하단 [입장권]만, +는 ⋯ 안 "다시 모으기"로.
 * ⋯ 시트: 이름·장소 고치기 / 마무리(다시 모으기) / 폴더로 / 고정 / 지우기.
 */
export function VisitPage() {
  const { visitId = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [view, setView] = useState<View>('index')
  const [editing, setEditing] = useState<Editing>()
  const close = useCallback(() => setEditing(undefined), [])
  const data = useLive(async () => {
    const visit = await db.visits.get(visitId)
    const objes = await db.objes.where('visitId').equals(visitId).toArray()
    return { visit, objes }
  }, [visitId])
  const library = useLibrary()

  if (!data) return null
  const { visit, objes } = data
  if (!visit) return <p className={styles.missing}>컬렉션을 찾을 수 없어요.</p>

  // 폴더 안의 컬렉션이면 뒤로·지운 뒤에 그 폴더로
  const home = visit.folderId ? `/folder/${visit.folderId}` : '/'
  const index = sequenceOf(objes)
  const newestFirst = [...objes].sort((a, b) => index.get(b.id)! - index.get(a.id)!)
  const stats = visitStats(objes)
  const span = visitSpan(objes, visit.endedAt)
  const sealed = !!visit.endedAt

  // R8: 모으는 중이면 마무리하고 입장권으로, 마무리된 컬렉션이면 바로 입장권으로
  async function toTemplate() {
    if (!visit!.endedAt) await endVisit(visit!.id)
    navigate(`/visit/${visit!.id}/template`)
  }
  async function move(choice: FolderChoice) {
    const target = 'folderId' in choice ? choice.folderId : 'newName' in choice ? (await createFolder(choice.newName)).id : undefined
    await moveToFolder(visit!.id, target)
    close()
    toast({ kind: 'done', text: target ? '폴더로 옮겼어요' : '폴더에서 뺐어요' })
  }

  const data_line = [span && `${formatTime(span.start)} — ${formatTime(span.end)}`, `오브제 ${formatCount(stats.objes)}`, `캡션 ${formatCount(stats.docents)}`, `노트 ${formatCount(stats.notes)}`]
    .filter(Boolean)
    .join(' · ')

  return (
    <Screen
      left={<IconButton icon="back" aria-label="뒤로" onClick={() => navigate(home)} />}
      right={<IconButton icon="more" aria-label="더 보기" onClick={() => setEditing('more')} />}
      bottom={
        <>
          <IconButton icon="ticket" size={54} aria-label={sealed ? '입장권 만들기' : '마무리하고 입장권 만들기'} firstHint="컬렉션을 입장권 한 장으로 만들어요" onClick={toTemplate} />
          {!sealed && <IconButton icon="add" size={54} aria-label="오브제 추가" onClick={() => navigate(`/visit/${visit.id}/capture`)} />}
        </>
      }
    >
      <main className={styles.page}>
        <header className={styles.header}>
          <div className={styles.status}>
            <StatusPill sealed={sealed} />
            <span className={styles.date}>{formatDateWeekday(visit.startedAt)}</span>
          </div>
          <h1 className={styles.title}>{visit.title}</h1>
          <div className={styles.where}>
            {visit.venue && <span className={styles.venue}>{visit.venue}</span>}
            <span className={styles.data}>{data_line}</span>
          </div>
          <DoubleRule />
          <TabBar
            tabs={[
              { value: 'index', label: '순번' },
              { value: 'tags', label: '라벨' },
              { value: 'notes', label: '노트' },
            ]}
            value={view}
            onChange={setView}
          />
        </header>

        {objes.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.plinth}>
              <AthenaLogo variant="mark" size={44} />
              <span className={styles.plinthIndex}>{formatIndex(1)}</span>
            </div>
            <p className={styles.emptyTitle}>첫 오브제를 걸어 보세요</p>
            <p className={styles.emptyText}>촬영하거나 사진첩에서 골라 담을 수 있어요.</p>
          </div>
        ) : view === 'tags' ? (
          <div className={styles.tagGroups}>
            {byTag(newestFirst).map(([tag, list]) => (
              <section key={tag ?? '-'} className={styles.tagGroup}>
                <h2 className={styles.tagHead}>
                  <span>
                    {tag ? (
                      <>
                        <span className={styles.hash}>#</span>
                        {tag}
                      </>
                    ) : (
                      '라벨 없음'
                    )}
                  </span>
                  <span className={styles.count}>{formatCount(list.length)}</span>
                </h2>
                <div className={styles.strip}>
                  {list.map((o) => (
                    <StripThumb key={o.id} obje={o} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          (() => {
            const list = view === 'notes' ? newestFirst.filter((o) => o.note?.trim()) : newestFirst
            return list.length === 0 ? (
              <p className={styles.emptyText}>나의 노트를 쓴 오브제가 아직 없어요.</p>
            ) : (
              <div className={styles.grid}>
                {list.map((o) => (
                  <Thumb key={o.id} obje={o} index={index.get(o.id)!} />
                ))}
              </div>
            )
          })()
        )}
      </main>

      <Sheet open={editing === 'more'} eyebrow="COLLECTION" title={visit.title} onClose={close}>
        <MenuList
          items={[
            { icon: 'write', label: '이름·장소 고치기', onSelect: () => setEditing('edit') },
            sealed
              ? {
                  icon: 'add',
                  label: '다시 모으기',
                  onSelect: async () => {
                    await reopenVisit(visit.id)
                    close()
                  },
                }
              : {
                  icon: 'seal',
                  label: '컬렉션 마무리',
                  onSelect: async () => {
                    await endVisit(visit.id)
                    close()
                    toast({ kind: 'done', text: '컬렉션을 마무리했어요' })
                  },
                },
            { icon: 'folder', label: '폴더로 옮기기', onSelect: () => setEditing('move') },
            {
              icon: 'pin',
              label: visit.pinnedAt ? '고정 풀기' : '고정',
              onSelect: async () => {
                await setPinned(visit.id, !visit.pinnedAt)
                close()
              },
            },
            { icon: 'delete', label: '컬렉션 지우기', onSelect: () => setEditing('delete') },
          ]}
        />
      </Sheet>
      <NewCollectionSheet
        open={editing === 'edit'}
        initial={{ title: visit.title, venue: visit.venue }}
        onClose={close}
        onStart={async (title, venue) => {
          await updateVisit(visit.id, { title, venue })
          close()
        }}
      />
      <FolderPickSheet open={editing === 'move'} subject={visit.title} folders={(library?.folders ?? []).map(toOption)} currentFolderId={visit.folderId} onPick={move} onClose={close} />
      <DeleteSheet
        open={editing === 'delete'}
        title="컬렉션을 지울까요?"
        description={`〈${visit.title}〉과 안의 모든 것이 지워져요. 되돌릴 수 없어요.`}
        stats={[
          [stats.objes, '오브제'],
          [stats.docents, '캡션'],
          [stats.notes, '나의 노트'],
        ]}
        onClose={close}
        onConfirm={async () => {
          const gone = await deleteVisit(visit.id)
          navigate(home, { replace: true })
          if (gone) toast({ kind: 'done', text: '컬렉션을 지웠어요', action: { label: '되돌리기', onAction: () => restoreVisit(gone) } })
        }}
      />
    </Screen>
  )
}

function byTag(objes: Obje[]): [string | undefined, Obje[]][] {
  const groups = new Map<string | undefined, Obje[]>()
  for (const o of objes) for (const t of o.tags.length ? o.tags : [undefined]) groups.set(t, [...(groups.get(t) ?? []), o])
  return [...groups].sort(([a], [b]) => (a === undefined ? 1 : b === undefined ? -1 : a.localeCompare(b, 'ko')))
}

function Thumb({ obje, index }: { obje: Obje; index: number }) {
  const src = usePhotoUrl(obje.photoId)
  return (
    <Link to={`/obje/${obje.id}`} className={styles.thumb}>
      <ObjeCard src={src} index={formatIndex(index)} attachment={attachmentLabel(obje)} title={obje.title} />
    </Link>
  )
}

/** 라벨 보기의 가로 줄 (B3): 104×130 사진만 */
function StripThumb({ obje }: { obje: Obje }) {
  const src = usePhotoUrl(obje.photoId)
  return <Link to={`/obje/${obje.id}`} className={styles.stripPhoto} style={src ? { backgroundImage: `url(${src})` } : undefined} aria-label={obje.title ?? '오브제'} />
}
