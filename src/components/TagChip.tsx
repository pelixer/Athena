import { formatTag } from '../domain/tags'
import styles from './TagChip.module.css'

export function TagChip({ tag }: { tag: string }) {
  return <span className={styles.chip}>{formatTag(tag)}</span>
}

export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null
  return (
    <div className={styles.list}>
      {tags.map((t) => (
        <TagChip key={t} tag={t} />
      ))}
    </div>
  )
}
