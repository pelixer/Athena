import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Toast, type ToastKind } from '../components/Toast'
import styles from './toast.module.css'

type Message = { id: number; text: string; kind?: ToastKind; action?: { label: string; onAction: () => void }; duration?: number }
type Show = (m: Omit<Message, 'id'>) => void

const ToastContext = createContext<Show>(() => {})

/**
 * 앱 공용 Toast (v2.3): 하단 좌대 막대 바로 위에 하나씩. 머무름 2400ms, 되돌리기가 있으면 4000ms.
 * 촬영 화면은 ModeSwitch 위에 따로 띄운다 (CapturePage).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<Message>()
  const seq = useRef(0)
  const show = useCallback<Show>((m) => setMessage({ ...m, id: ++seq.current }), [])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(undefined), message.duration ?? (message.action ? 4000 : 2400))
    return () => clearTimeout(t)
  }, [message])

  return (
    <ToastContext.Provider value={show}>
      {children}
      {message && (
        <div className={styles.host} key={message.id}>
          <Toast
            kind={message.kind}
            action={
              message.action && {
                label: message.action.label,
                onAction: () => {
                  message.action!.onAction()
                  setMessage(undefined)
                },
              }
            }
          >
            {message.text}
          </Toast>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
