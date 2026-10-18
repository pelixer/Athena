import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { trackVisualViewport } from './lib/viewport'
import './global.css'

trackVisualViewport()

// iOS Safari 전용 핀치 이벤트. 막지 않으면 화면 전체가 줄어든 채로 남는다 (viewport 설정을 무시한다)
for (const type of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(type, (e) => e.preventDefault(), { passive: false })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
