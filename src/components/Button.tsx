import type { ButtonHTMLAttributes } from 'react'
import { Icon, type IconName } from './Icon'
import styles from './Button.module.css'

export type ButtonVariant = 'accent' | 'neutral' | 'ghost' | 'dark'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; icon?: IconName }

/** Button · Liquid Glass — glass-accent · glass-neutral · ghost · glass-dark(사진 위) */
export function Button({ variant = 'accent', icon, className, type = 'button', children, ...rest }: Props) {
  return (
    <button type={type} className={[styles.button, styles[variant], className].filter(Boolean).join(' ')} {...rest}>
      {icon && <Icon name={icon} size={20} />}
      {children}
    </button>
  )
}
