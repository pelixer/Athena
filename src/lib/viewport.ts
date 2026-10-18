/**
 * 휴대폰 키보드가 올라오면 화면에 보이는 영역(visual viewport)이 줄어든다. iOS Safari는 position:fixed
 * 요소를 그 영역에 맞춰 주지 않아서, 아래에 붙은 시트·입력칸이 키보드에 가려진다.
 * 보이는 영역의 위치와 높이를 CSS 변수로 내보내, 시트가 키보드 바로 위에 앉게 한다.
 *   --vv-top    보이는 영역의 위 (스크롤된 만큼)
 *   --vv-height 보이는 영역의 높이
 */
export function trackVisualViewport() {
  const vv = window.visualViewport
  if (!vv) return
  const root = document.documentElement
  const update = () => {
    root.style.setProperty('--vv-top', `${vv.offsetTop}px`)
    root.style.setProperty('--vv-height', `${vv.height}px`)
  }
  update()
  vv.addEventListener('resize', update)
  vv.addEventListener('scroll', update)
}
