import styles from './Toast.module.css'

/** 촬영 화면의 안내 알약 ("설명문이 인식되었어요 · No.07에 붙입니다") */
export function Toast({ children }: { children: React.ReactNode }) {
  return (
    <span role="status" className={styles.toast}>
      {children}
    </span>
  )
}
