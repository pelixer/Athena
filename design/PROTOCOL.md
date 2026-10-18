# Design ↔ Code 소통 프로토콜

Claude Design과 Claude Code가 Athena를 함께 만들 때의 약속. 두 쪽 모두 이 파일을 기준으로 한다.

## 1. 기준 파일

| 파일 | 주인 | 역할 |
|---|---|---|
| `design/tokens.css` | Design | **계약서.** 색·타입·간격·반경·그림자·모션·글래스의 이름과 값. 코드는 이 파일만 읽는다. |
| `design/source/vN/` | Design | 디자인 원본(.dc.html). 버전마다 폴더 하나. 코드가 구현할 때 참조하는 시안. |
| `design/REVIEW.md` | Code | 디자인 검토를 기다리는 목록 + 토큰 요청. Design이 답한다. |
| `design/DEVIATIONS.md` | Code | 시안과 다르게 구현한 부분과 이유. |
| `docs/CONCEPT.md` | 사용자 | 제품 컨셉과 용어집. |

## 2. 이름
- 화면 이름은 시안의 `data-screen-label`과 코드의 페이지 이름을 함께 쓴다: `01 촬영 · CapturePage`.
- 컴포넌트 이름은 디자인 시스템 문서의 제목과 코드 컴포넌트 이름이 같다: `ObjeCard`, `DocentBlock`, `ModeSwitch` ….
- 새 화면·컴포넌트는 먼저 만드는 쪽이 이름을 정하고, 다른 쪽은 그 이름을 그대로 쓴다.

## 3. 작업 단계 (누가 먼저 움직이나)

| 단계 | 기준 | 흐름 |
|---|---|---|
| **1. 코드 단독** | 기존 토큰·컴포넌트 조합으로 끝남 | Code가 바로 구현. 검토 없음. |
| **2. 코드 선구현 → 디자인 검토** | 새 컴포넌트·변형·화면이 필요하지만 기존 원칙으로 유추 가능 | Code가 원칙대로 만들고 `REVIEW.md`에 올린다. 갤러리에 "검토 대기"로 표시. |
| **3. 디자인 선행** | 인상을 정하는 장면: 템플릿, 카드 변형, 첫 실행, 새 형식(지도·타임라인 등) | Code는 기능만 꾸밈 없이 둔다. Design이 시안을 먼저 낸다. |

## 4. Design → Code (시안 전달)
1. 프로젝트를 **zip으로 내보내** 사용자에게 준다 (사용자가 Code 세션에 첨부). 
2. zip에 들어 있어야 하는 것:
   - `design/tokens.css` 전체 — 시안 안에서 쓴 값은 **모두** 토큰에 있어야 한다. 새 값이 필요하면 이 파일에 이름을 붙여 추가한다.
   - 화면/컴포넌트 `.dc.html` — 상태는 props로 (예: `captureMode: obje|docent`, `cardStyle: sky|marble|photo`).
   - `github.md`의 "Updated in this project"에 이번에 바뀐 것을 적는다. **토큰 변경은 이름 단위로** (`--accent: #8DB6EC → #…`).
3. `REVIEW.md` 항목에 답할 때는 항목 번호와 함께: **승인** / **수정**(바꿀 값·스펙) / **재디자인**(새 시안 첨부).

## 5. Code → Design (구현 결과 전달)
1. **갤러리** — 실제 코드로 렌더링한 화면·토큰·컴포넌트를 담은 단일 HTML 파일 (`npm run build:preview` → `dist-preview/preview.html`). 사용자가 Design에 첨부한다.
2. `design/REVIEW.md` — 이번 라운드에 검토할 항목, 토큰 요청.
3. `design/DEVIATIONS.md` — 시안과 달라진 부분.

## 6. 리뷰 라운드
- 기능마다 오가지 않는다. **REVIEW.md가 쌓이면 한 번에** 라운드를 연다 (12월까지 3~4회 예상).
- 라운드: Code가 갤러리 갱신 + REVIEW.md 정리 → 사용자가 Design에 전달 → Design이 답과 갱신된 zip → Code가 반영하고 항목을 닫는다.
- 단계 3 항목은 라운드를 기다리지 않고 바로 Design에 요청해도 된다.
- 앱 전반을 다시 보는 큰 라운드는 Code가 **브리프**(`design/briefs/rN/BRIEF.md` + 실제 화면 스크린샷)를 먼저 쓴다.
  지금까지 달라진 것, 아쉬운 점(우선순위), 제약, 돌려받을 산출물을 담는다. 라운드 2: `design/briefs/r2/`.

## 7. 규칙
- 코드에는 토큰 밖의 색·폰트·간격·반경·그림자·모션을 쓰지 않는다. 없는 값은 REVIEW.md의 토큰 요청으로.
- 컴포넌트 고유 치수(버튼 높이 54, 셔터 78 등)는 시안 값을 컴포넌트 안에 그대로 쓴다.
- 시안 안에 있지만 토큰에 없는 값은 Code가 가장 가까운 토큰으로 맞추고 DEVIATIONS.md에 적는다.
