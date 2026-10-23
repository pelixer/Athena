# Handoff: Athena v2.3 "Stoa" — 앱 전반 개선

Design → Code · 2026-10-19 · 기준 토큰 `tokens.css` v2.3

## Overview
Athena는 전시장에서 마음에 남은 작품을 한 점씩 모으는 개인 미감 저장소입니다. v2는 앱 전체를 **미술관 회랑(스토아)** 처럼 바꿉니다. 흰 대리석 벽에 사진을 걸고, 사진마다 아래에 작품 라벨을 붙입니다. 목표는 "은행 앱이나 현대적인 일기 앱"이 아니라, 들어서는 순간 나만의 공간(헤테로토피아)에 왔다고 느끼게 하는 것입니다.

라운드 2 답변(`REVIEW-R2-answers.md`)을 보낸 뒤 바뀐 것이 많습니다. **이 README와 `tokens.css` v2.3이 최신 기준입니다.** 둘이 충돌하면 이 README를 따르세요.

## About the Design Files
이 묶음의 `.dc.html` 파일은 **HTML로 만든 디자인 참고본**입니다. 화면 모양과 동작을 보여 주는 시안이지, 그대로 가져다 쓸 프로덕션 코드가 아닙니다. 할 일은 이 시안을 **기존 Athena 코드베이스(React + CSS Modules, `design/tokens.css`)의 방식대로 다시 구현**하는 것입니다. 파일은 브라우저에서 바로 열립니다(`support.js`가 같은 폴더에 있어야 합니다). `Athena v2 Index.dc.html`에서 시작하세요.

## Fidelity
**High-fidelity.** 색, 글자, 여백, 반경은 최종값입니다. 픽셀 단위로 맞춰 주세요. 시안에 쓴 사진은 자리표시용 견본입니다(카드 바탕 텍스처 5종만 실제 에셋).

---

## v2.3 핵심 규칙 (라운드 2 답변 이후 바뀐 것)

### 1. 버튼 — 하늘 이중 원 (시안 `Athena Button Explorations` 1b)
- **모든 버튼**은 바탕 없음, **글자 없음**, 점 없음. 하늘 이중 원 안에 아이콘 하나.
- 바깥 원: `border: 1px solid #1F4FA3`. 안쪽 원: 바깥에서 3.5px 안쪽에 1px 선(`--button-ring-inset: 4.5px`, 시안은 `outline: 1px solid; outline-offset: -4.5px`). **구현은 SVG 두 원이나 `box-shadow: inset 0 0 0 3.5px transparent, inset 0 0 0 4.5px #1F4FA3`처럼 둥근 모양이 보장되는 방식으로.** outline 방식은 iOS 16.3 이하 Safari에서 안쪽 원이 네모로 보인다.
- 아이콘 선 색 = 테두리 색 `#1F4FA3`. 사진 위 버튼은 흰 `#FBFAF7` 이중 원 + 흰 아이콘.
- 크기 54(하단·시트, 아이콘 24) / 44(머리, 아이콘 22). 터치 영역 최소 44.
- 글자 버튼 → 아이콘으로 바꿈: 취소·닫기 = `close`, 확인(시작·저장·옮기기·N개 넣기) = `check`, 지우기 = `delete`, 첫 컬렉션 시작 = `add`, 사진에서 고르기 = `photo`.
- 시트 버튼 줄: 취소 왼쪽, 확인 **오른쪽 끝**(`margin-left: auto`).
- 누름 `scale(0.96)` 120ms, 꺼짐 투명도 40%.
- 위험 동작에 색 구분 없음. 휴지통 아이콘 모양 + 지워지는 것을 숫자로 보여 주는 확인 시트로 알린다.
- 버튼마다 길게 누르면 이름 말풍선(400ms 뒤에 떠서 1.5초 유지). 앱 고유 동작(입장권·카드·고정)은 처음 한 번 안내 말풍선.
- 토글(E4 노트 켜기): 바탕 없음, `1px solid #1F4FA3` 테두리, 켜짐 = 안쪽 동그라미 하늘 `#1F4FA3`.

### 2. 색 — 버튼·글자 강조에만 하늘
- 하늘 `#1F4FA3`(`--accent`)은 **바탕에 칠하지 않는다.** 버튼 테두리, 아이콘, 로고(홈), 링크, "모으는 중" 같은 상태 글자에만.
- 칩 켜짐: 바탕 없음 + `1px solid #17181B` + 하늘 글자 + ✓. 꺼짐: `1px solid #D6D3CD` + `#6B6964`.
- "모으는 중" 알약: 바탕 없음 + `1px solid #D6D3CD` + 하늘 글자 + 하늘 점 6px.
- 오브제 고르기(E5) 선택 칸: `outline: 2px solid #17181B; outline-offset: -2px`, 순번 원 = 먹 바탕 흰 숫자.
- 테라코타 `--danger`는 **쓰지 않는다**(토큰만 남김).

### 3. 장식 — 이중 박공선 O, 메안더 X
- **이중 박공선**(로고 지붕의 이중선) `--rule-double`: 높이 3px, `border-top: 1px solid #17181B; border-bottom: 1px solid #17181B`. 쓰는 곳:
  - 홈 구획 머리(I 고정 / II 컬렉션) 아래
  - 컬렉션 화면 정보 줄 아래, 탭 위
  - 오브제 작품 라벨 제목 아래
  - 입장권 제목 아래
- **메안더(그리스 열쇠 문양) 띠는 삭제.** `--ornament-meander`를 지운다. 어디에도 쓰지 않는다.

### 4. 아이콘
- 24 격자, 선 **1.25**, `stroke-linecap: butt`, `stroke-linejoin: miter`, 90° 꺾임. **점 없음.**
- `icons/*.svg` 25종이 최신입니다(`stroke="currentColor"`). 점이 글자의 일부였던 세 아이콘은 짧은 선으로 바꿨습니다.
  - `more`: 가로줄 세 개
  - `info`: "i"의 점을 짧은 세로선으로
  - `list`: 첫 줄 앞 표시

### 5. 홈 목록 줄 — 30% 낮춤
- 줄 높이 약 76px: `grid-template-columns: 48px minmax(0,1fr); gap: 14px; padding: 8px 0; border-bottom: 1px solid #D6D3CD`.
- 표지 액자 48×60: 흰 매트 2px + `1px solid #D6D3CD`. 빈 표지 = `#F3F1EC` 바탕 + 신전 심볼(stone-400).
- 폴더 표지: 같은 48×60에 2×2 모자이크(간격 2) + 오른쪽 아래 15×15 폴더 표식.
- 글자 칸 `gap: 3px`:
  - 메타: 고정 핀·"모으는 중"·날짜(모노 12)
  - 제목: Noto Serif KR 600 **17px**/1.3, 한 줄 말줄임
  - 보조 줄: 모노 12 `#6B6964`
- 홈 머리 로고(가로형 40)와 A1 첫 실행 세로형 로고(132)는 **하늘 `#1F4FA3`**.

### 6. 카드 (CardPage)
- 크기 280×420(내보내기 1080×1620). **반경 32**, 안쪽 여백 **26**(`--card-padding`), 요소 간격 14.
- 안의 사진 반경 = 카드 반경 − 여백 = **6**(`--radius-card-inner`). 두 모서리가 같은 중심으로 휘어 보이게 한 값이니 같은 값으로 바꾸지 말 것.
- 도록(plate): 대리석 매트 `padding 14; background #F3F1EC; border 1px solid #D6D3CD; radius 12`, 안의 사진 반경 3, 높이 128. 노트는 4줄에서 말줄임.
- 노트 글자(Noto Serif KR 400):
  - 하늘·대리석·바탕 텍스처 카드: **13px**/1.75
  - 사진 카드: 14px/1.75
  - 도록: 11px/1.75
- 아래 줄(서명):
  - 왼쪽 메타: Monoplex KR 400 **12px**/1.55 두 줄("N° 04 · 2026.10.18" / "국립현대미술관 서울")
  - 오른쪽 로고: 가로형 **24**
  - `align-items: flex-end`
  - **메타의 마지막 줄 글자 밑선을 로고 신전 받침의 밑선에 맞춘다.** 시안은 메타에 `margin-bottom: calc(-0.275em - 0.7px)`를 줬다. 실제 글꼴로 측정해 맞춰 주세요.
- **음각 노트**("돌에 새긴" 글자): 대리석 카드, 도록, 회벽 바탕 카드에만. 하늘·사진 카드는 그대로 흰 글자.
  - `color: #5F5C56; font-weight: 500; text-shadow: 0 1px 0 rgba(255,255,255,.85), 0 -1px 0 rgba(23,24,27,.28)` (`--engrave`)
- **바탕 텍스처 5종**(`assets/t-*.jpg`, 사용자 제공). 스타일 고르기 아래 "바탕" 줄에 30px 원 견본으로 고른다. 고른 견본은 하늘 이중 원.

| key | 파일 | 노트 |
|---|---|---|
| stucco | t-stucco.jpg (회벽) | **음각** |
| shadow | t-shadow.jpg (야자 그림자) | 흰 글자 + `text-shadow 0 1px 2px rgba(23,24,27,.45)` |
| silk-beige | t-silk-beige.jpg | 먹 `#17181B` |
| water | t-water.jpg | 흰 글자(그림자 같음) |
| silk-white | t-silk-white.jpg | 먹 `#17181B` |

---

## Screens / Views
화면 id는 각 시안 프레임의 `data-screen-label`과 같습니다. 프레임은 390×844(iPhone 14), 상태바 47, 홈 막대 134×5입니다.

| 파일 | id | 화면 | 상태 |
|---|---|---|---|
| 1 Home | A1–A4 | 홈 | 첫 실행 · 목록 · 왼쪽 밀기(폴더로/지우기) · 오른쪽 밀기(고정) |
| 2 Home Sheets | A5–A7 | 새 컬렉션 시트(키보드) · 폴더 · 폴더로 옮기기 시트 | |
| 3 Collection | B1–B5 | 컬렉션 | 빈 · 순번 · 라벨+마무리 · ⋯ 시트 · 지우기 확인 |
| 4 Capture | C1–C4 | 촬영 | 오브제 · 캡션+읽는 중 · 첨부 · 카메라 불가 |
| 5 Obje | D1–D6 | 오브제 | 위 · 아래(캡션+노트) · 읽는 중/노트 없음 · 캡션 고치기 · 노트 · 사진 보기 |
| 6 Card Ticket | E1–E5 + 카드 줄 | 카드(하늘·도록) · 저장 확인 · 입장권 · 오브제 고르기 · 스타일 4종 + 바탕 5종 |

### 공통 구조
- **하단 좌대 막대(PlinthBar)**: 높이 128 + 안전 영역.
  - 바탕: `linear-gradient(180deg, rgba(251,250,247,0) 0%, rgba(251,250,247,.94) 34%, #FBFAF7 60%)`
  - 버튼: 54 원 둘, 간격 20, 가운데 정렬, 위 여백 40. 주 동작이 오른쪽.
  - 스크롤 끝 여백 = 128.
  - 어두운 화면(촬영·사진 보기)에는 쓰지 않음.
- **위 막대**: left/right 16, top 52. `grid 44px 1fr 44px`. 가운데 제목은 Pretendard 600 15.
- **시트**:
  - 바탕 `#FBFAF7`, 위 반경 28, 안쪽 여백 `12px 20px 42px`, 간격 20, 손잡이 36×4 `#D6D3CD`
  - 눈썹: Cormorant Garamond 600 15, tracking .14em, `#6B6964`(NEW · MOVE · CAPTION · NOTE · SAVE · SELECT · DELETE · COLLECTION)
  - 제목: Noto Serif KR 600 21/1.35. 설명: Pretendard 400 14/1.6 `#6B6964`
  - 뒤 막: `rgba(23,24,27,.45)`
  - 키보드가 있으면 키보드 바로 위에 붙음(아래 여백 16)
- **입력칸**: 높이 52 이상, 반경 12, `1px solid #D6D3CD`, 16px. 초점 `1.5px solid #1F4FA3`. 노트 입력은 세리프.
- **구획 머리**:
  - 로마 숫자: Cormorant 600 15 `#6B6964`, 최소 너비 14
  - 이름: Pretendard 600 13, tracking .02em
  - 오른쪽 개수: 모노 12
  - 간격 8 아래에 이중 박공선
- **작품 라벨(D1)**:
  - "N° 04 / 04": Cormorant 600 17, tracking .04em
  - 시각: 모노 12
  - 제목: Noto Serif KR 600 26/1.3
  - 이중 박공선 다음에 표(머리 Pretendard 500 13 `#6B6964` / 값 모노 13, 행 아래 결 선)
  - 그 아래 라벨 태그 줄
- **ObjeCard(B2)**: 사진 4:5(반경 2) → N°(Cormorant 600 16) + 표식(Pretendard 500 11 하늘) → 제목 Pretendard 500 14 한 줄.
- **Toast**: 어두운 바탕 `rgba(23,24,27,.72)`, 높이 40, 반경 999.
  - 자리: 하단 버튼 줄(ModeSwitch) 바로 위에 고정
  - 머무름 2400ms, 되돌리기가 있으면 4000ms
  - 오래 걸리는 일은 점 세 개(sky-300)가 흐른다

## Interactions & Behavior
| 장면 | 이징 | 시간 | 움직임 |
|---|---|---|---|
| 화면 들어감 | `cubic-bezier(.2,.7,.2,1)` | 320 | 오른쪽 24px에서 + 투명도 0→1, 뒤 화면 −24px로 물러나며 투명도 .92 |
| 뒤로 | `cubic-bezier(.4,0,1,1)` | 240 | 반대 방향 |
| 시트 | 들어옴 settle 240 / 나감 exit 200 | | 아래에서, 막 0→1 |
| 줄 밀기 | 손가락 1:1, 놓으면 `cubic-bezier(.4,0,.2,1)` 240 | | 한 칸 56, 범위 밖 0.3배, 버튼 크기 .8→1 |
| 셔터 | `cubic-bezier(.34,1.3,.64,1)` | 120+240 | 눌림 .92, 흰 플래시 80 |
| 추가 완료 | spring | 480 | 찍은 사진이 썸네일로 날아가고 N° 숫자가 올라감 |
| 누름 공통 | move | 120 | scale .96 |

"움직임 줄이기" 설정에서는 모든 움직임을 투명도 120ms로 대신합니다. 다크 모드는 만들지 않습니다.

## State Management
- 홈 정렬: 최근 추가 / 이름 / 오브제 수
- 홈 검색어
- 줄 밀림 상태: 한 번에 한 줄만 열림
- 컬렉션 상태: 모으는 중 / 마무리. 마무리면 하단 주 버튼이 입장권으로 바뀌고, +는 ⋯ 안 "다시 모으기"로
- 컬렉션 탭: 순번 / 라벨 / 노트
- 카드: `cardStyle`(sky·marble·photo·plate), `cardBg`(stucco·shadow·silk-beige·water·silk-white·없음), 항목 칩 켜짐(나의 노트 / 날짜·장소 / 캡션 / 라벨)
- 입장권: 오브제 선택 순서 배열(1번 = 표지·노트의 오브제), 노트 켜기
- OCR 상태: 읽는 중 / 완료 / 실패. 실패하면 원문 그대로 보여 준다

## Design Tokens
전부 `tokens.css` v2.3에 있습니다. 주요 값:
- **먹·돌**: ink-900 `#17181B`, ink-800 `#2E2F33`, stone-600 `#6B6964`, stone-400 `#A3A09A`
- **대리석**: marble-0 `#FBFAF7`, marble-50 `#F3F1EC`, marble-100 `#E8E5DF`, marble-200 `#D6D3CD`
- **하늘**: sky-900 `#163A7A`, sky-700 `#1F4FA3`(강조), sky-500 `#2E6BD1`, sky-300 `#8DB6EC`(어두운 바탕 위), sky-100 `#E3EDFA`
- **하늘 그라데이션**: `linear-gradient(180deg,#163A7A 0%,#1F4FA3 55%,#2E6BD1 100%)`
- **글꼴**:
  - Pretendard: 조작·설명
  - Noto Serif KR: 이름·노트
  - Monoplex KR: 기록된 값만
  - Cormorant Garamond 500/600: N°·로마 숫자·영문 눈썹·ATHENA
  - Cormorant Garamond는 새로 추가한 글꼴(OFL)이라 woff2를 내장해야 합니다.
- **반경**: 2 사진 / 6 카드 안 사진 / 12 입력칸·도록 매트 / 28 시트 / 32 카드 / 999 알약
- **여백 단위(4pt)**: 4 8 12 16 20 24 32 48 64

## Assets
- `logo/`:
  - 앱 아이콘 1024 PNG
  - apple-touch-icon 180
  - 파비콘 32, 180
  - 시작 화면 1170×2532
  - 심볼 SVG
  - 앱 아이콘 SVG는 ATHENA가 폰트 텍스트라 PNG를 쓰세요
  - 비율은 `AthenaLogo.dc.html`과 `--logo-*` 토큰을 따릅니다
- `icons/`: 25종 SVG(v2.3, 점 없음)
- `assets/t-*.jpg`: 카드 바탕 텍스처 5종(사용자 제공 Unsplash 사진, 긴 변 1000px로 줄임)
- `assets/w-*.jpg`: 시안용 견본 사진(1200px). 앱에서는 사용자 사진이 들어갑니다

## Files
- `Athena v2 Index.dc.html`: 목차 + 카드 스타일 줄
- `Athena v2 1 Home` … `6 Card Ticket.dc.html`: 화면
- `Athena v2 System.dc.html`: 원칙, 글자 규칙, 색, 버튼, 아이콘, 컴포넌트, 시트, 하단 막대, 움직임
- `Athena Button Explorations.dc.html`: 버튼 시안(1b 채택)
- `Athena Brand.dc.html`, `AthenaLogo.dc.html`: 로고
- `tokens.css`: 계약서(v2.3)
- `REVIEW-R2-answers.md`: 라운드 2 항목별 답(버튼·장식 부분은 이 README가 우선)

## 알려진 차이
- System 페이지 일부 칸(색 견본 sky-700, 누름/꺼짐 비교)은 v2.3 규칙보다 덜 다듬어져 있습니다. 규칙은 이 README가 기준입니다.
- 시안 안의 "되돌리기"·말풍선 같은 일부 상태는 System 페이지에만 있습니다.
