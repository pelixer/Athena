import type { ButtonHTMLAttributes } from 'react'
import { Icon, type IconName } from './Icon'
import styles from './IconButton.module.css'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** photo: 사진 위(glass-dark) · marble: 대리석 위(glass-neutral) */
  surface?: 'photo' | 'marble'
  size?: 44 | 52 | 54
  icon: IconName
  'aria-label': string
}

/** IconButton · on-photo / on-marble */
export function IconButton({ surface = 'marble', size = 44, icon, className, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={[styles.icon, surface === 'photo' ? styles.photo : styles.marble, styles[`s${size}`], className].filter(Boolean).join(' ')}
      {...rest}
    >
      <Icon name={icon} size={size === 44 ? 22 : 24} />
    </button>
  )
}
