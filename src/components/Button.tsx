import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'accent' | 'neutral' | 'ghost' | 'dark'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }

/** Button · Liquid Glass — glass-accent · glass-neutral · ghost · glass-dark(사진 위) */
export function Button({ variant = 'accent', className, type = 'button', ...rest }: Props) {
  return <button type={type} className={[styles.button, styles[variant], className].filter(Boolean).join(' ')} {...rest} />
}
