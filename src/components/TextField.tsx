import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import styles from './TextField.module.css'

/** 입력칸 — radius sm(입력) 규칙. 단계 2. */
export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${styles.field} ${props.className ?? ''}`} />
}

/** 여러 줄 입력. variant="note"는 해석(세리프)으로 쓴다. */
export function TextArea({ variant = 'body', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { variant?: 'body' | 'note' }) {
  return <textarea {...props} className={`${styles.field} ${styles.area} ${variant === 'note' ? styles.note : ''} ${props.className ?? ''}`} />
}
