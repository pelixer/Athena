import type { ButtonHTMLAttributes } from 'react'
import styles from './Tag.module.css'

export type TagVariant = 'default' | 'selected' | 'onPhoto'

/** Tag — default · selected · on-photo. '#'은 저장하지 않고 여기서 붙인다. */
export function Tag({ tag, variant = 'default', onClick }: { tag: string; variant?: TagVariant; onClick?: () => void }) {
  const className = `${styles.tag} ${styles[variant]}`
  const content =
    variant === 'default' ? (
      <>
        <span className={styles.hash}>#</span>
        {tag}
      </>
    ) : (
      `#${tag}`
    )
  return onClick ? (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  ) : (
    <span className={className}>{content}</span>
  )
}

/** Tag · add — "+ 라벨" */
export function AddTag(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`${styles.tag} ${styles.add}`} {...props}>
      + 라벨
    </button>
  )
}

export function TagList({ tags, variant, onAdd }: { tags: string[]; variant?: TagVariant; onAdd?: () => void }) {
  if (tags.length === 0 && !onAdd) return null
  return (
    <div className={styles.list}>
      {tags.map((t) => (
        <Tag key={t} tag={t} variant={variant} />
      ))}
      {onAdd && <AddTag onClick={onAdd} />}
    </div>
  )
}
