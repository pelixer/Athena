import { Icon } from './Icon'
import styles from './AttachConfirm.module.css'

type Kind = 'obje' | 'docent'

/** AttachConfirm — 사진을 첨부하면 ModeSwitch 자리에 나타난다. 오브제로 저장할지, 도슨트로 붙일지 고른다. */
export function AttachConfirm({ onConfirm, disabled = [] }: { onConfirm: (kind: Kind) => void; disabled?: Kind[] }) {
  const options: { value: Kind; label: string }[] = [
    { value: 'obje', label: '오브제' },
    { value: 'docent', label: '도슨트' },
  ]
  return (
    <div className={styles.confirm} role="group" aria-label="첨부한 사진 저장">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`${styles.option} ${styles[o.value]}`}
          disabled={disabled.includes(o.value)}
          aria-label={`${o.label}로 저장`}
          onClick={() => onConfirm(o.value)}
        >
          <Icon name="check" size={18} />
          {o.label}
        </button>
      ))}
    </div>
  )
}
