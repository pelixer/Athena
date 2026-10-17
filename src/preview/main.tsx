import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PreviewPage } from './PreviewPage'
import { seedSample } from './seed'
import '../global.css'

const root = createRoot(document.getElementById('root')!)
seedSample()
  .catch((e) => console.error('sample data', e))
  .finally(() =>
    root.render(
      <StrictMode>
        <PreviewPage />
      </StrictMode>,
    ),
  )
