import { useRef, useState, type InputHTMLAttributes } from 'react'
import { typeTagInput } from '../domain/tags'
import { TextField } from './TextField'

/**
 * 라벨 입력칸. 띄어쓰기를 하면 바로 '#'이 붙는다 (typeTagInput).
 * 한글은 조합 중에 값을 바꾸면 글자가 깨지므로, 조합이 끝난 뒤에 정리한다.
 */
export function TagInput({ value, onValue, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & { value: string; onValue: (v: string) => void }) {
  const composing = useRef(false)
  const [raw, setRaw] = useState<string | null>(null)
  return (
    <TextField
      {...rest}
      value={raw ?? value}
      inputMode="text"
      autoCapitalize="off"
      autoCorrect="off"
      onCompositionStart={() => (composing.current = true)}
      onCompositionEnd={(e) => {
        composing.current = false
        setRaw(null)
        onValue(typeTagInput(value, e.currentTarget.value))
      }}
      onChange={(e) => {
        if (composing.current) return setRaw(e.target.value)
        setRaw(null)
        onValue(typeTagInput(value, e.target.value))
      }}
    />
  )
}
