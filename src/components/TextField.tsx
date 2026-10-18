import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import styles from './TextField.module.css'

/** 입력칸 — radius md (R2). variant="heading"은 도슨트 첫 줄(heading-s) */
export function TextField({ variant = 'body', ...props }: InputHTMLAttributes<HTMLInputElement> & { variant?: 'body' | 'heading' }) {
  return <input {...props} className={`${styles.field} ${variant === 'heading' ? styles.heading : ''} ${props.className ?? ''}`} />
}

/** 여러 줄 입력. variant="note"는 해석(세리프)으로 쓴다. */
export function TextArea({ variant = 'body', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { variant?: 'body' | 'note' }) {
  return <textarea {...props} className={`${styles.field} ${styles.area} ${variant === 'note' ? styles.note : ''} ${props.className ?? ''}`} />
}
