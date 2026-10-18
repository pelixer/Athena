# 라운드 1 — Design 답변 (2026-10-18)

기준: `design/REVIEW.md` 라운드 1. 형식: **승인** / **수정**(스펙) / **재디자인**(시안).

## 단계 2

- **R1 홈 · HomePage — 수정.** 지금은 단계 2로 두고, 첫 실행(관람이 하나도 없을 때)만 나중에 단계 3으로 올린다.
  - 새 관람 입력칸 두 개를 홈에서 빼고 `Sheet`로 옮긴다. 홈 하단 고정 버튼은 glass-accent "새 관람 시작". 시트 안: 제목 → 장소 → "관람 시작".
  - 지난 관람 행 왼쪽에 대표 사진 썸네일 56×70 (`--radius-xs`, 그 관람의 첫 오브제)을 둔다. 행은 `display:grid; grid-template-columns:56px 1fr; gap:var(--space-4)`.
  - 진행 중인 관람(`endedAt` 없음)은 목록 맨 위에 두고, 메타 줄 앞에 `--accent-bright` 점 6px + "관람 중"을 붙인다.
- **R2 Sheet · TextField · TextArea — 수정.**
  - 시트 위 모서리: `--radius-md` → `--radius-lg`(28).
  - 시트 맨 위에 손잡이 36×4, `--radius-pill`, `--border-vein`. 헤더와의 간격은 `--space-3`.
  - 입력칸 모서리: `--radius-sm` → `--radius-md`. 포커스할 때 border는 `--accent-bright`를 유지한다.
  - 시트 하단 버튼은 화면 하단 버튼 줄과 같게 (neutral 취소 124 + accent 확인 flex:1).
- **R3 빈 상태 — 승인.** 문구 셋 다 그대로 쓴다.
- **R4 코드가 붙인 이름 — 승인.** `MetaTable` `StatRow` `TabBar` `OptionChip` `CardStylePicker` `Toast`를 디자인에서도 쓴다. 이번에 디자인 쪽에서 붙인 이름: `TemplatePage`, `TemplatePicker`, `TemplateCatalogue`, `TemplateTicket`, `TemplateWall`.
- **R5 관람 보기 · 라벨 탭 — 수정.** 소제목 줄을 `display:flex; justify-content:space-between`로 바꾸고, 오른쪽에 개수(`03`, `--type-label`, `--text-secondary`)를 둔다. 소제목 위에 1px `--border-strong` 선, 아래 간격 `--space-3`. 나머지는 승인.
- **R6 Card · 도슨트·라벨 항목 — 수정.** 노트를 먼저 두고, 도슨트 첫 줄은 노트 바로 아래에 출처처럼 붙인다: `— 한서윤, 〈남쪽 해안, 오후 3시〉, 2019` (`--type-label`, `--tracking-badge`). 라벨(`#a #b`)은 footer 바로 위로 내린다. 노트 줄 수를 줄이는 규칙은 승인.
- **R7 촬영 · 안내 문구 — 승인.** 카메라를 못 열 때의 화면도 승인. 다만 셔터 안에 사진 아이콘 대신 Toast에 "사진에서 고르기"를 함께 띄운다.
- **R8 관람 보기 · ↗ — 수정.** 관람이 끝난(`endedAt` 있음) 관람에서만 ↗를 보인다. 누르면 `TemplatePage`로 간다. 끝난 관람에서는 하단 주 버튼 문구를 "템플릿 만들기"로 바꾼다. 진행 중에는 지금처럼 "관람 마무리 · 템플릿 만들기"를 누르면 관람을 끝내고 `TemplatePage`로 간다.
- **R9 도슨트 · 사진 보기 — 수정.** 전체 화면 뷰어로 바꾼다. 배경 `--bg-inverse`, 왼쪽 위 × (glass-dark, 44), 하단 가운데 캡션 "도슨트 원본 · No.07" (`--type-meta`, `--text-on-dark-muted`), 핀치 확대. 같은 뷰어를 오브제 사진 탭에도 쓴다.
- **R10 도슨트 · 고치기 — 승인.** 고치기 시트의 첫 줄은 `TextField`(`--type-heading-s`), 문단은 `TextArea`(`--type-body`, note 서체가 아님)로 나눈다. 원문 사진 썸네일(56×70)을 시트 맨 위 오른쪽에 둔다.

## 토큰 요청 T1–T15 — 모두 승인

이름과 값 모두 그대로 `design/tokens.css` 본문으로 옮겼다. "요청 중" 블록은 없앴다.
- T3: 20/180(accent·neutral)과 16/160(dark)은 둘 다 의도한 값이다 → `--glass-blur`, `--glass-dark-blur`.
- 간격 10·14·18·22·28은 의도한 값이 아니다. DEVIATIONS의 반올림을 승인한다(4pt 유지).

## 단계 3 — D1 템플릿

시안: `Athena Template v1.dc.html` (자식: `TemplateCatalogue.dc.html`(prop `page`), `TemplateTicket.dc.html`, `TemplateWall.dc.html`).
- **05 템플릿 · TemplatePage**: CardPage와 같은 구조. 미리보기 → `TemplatePicker`(도록·입장권·벽면) → `OptionChip`(오브제 고르기 / 표지 / 나의 노트) → 저장·공유.
- **1a 도록**: 4:5, 1080×1350, 여러 장. 표지 → 목차 → 플레이트(고른 오브제마다 1장) → 마무리.
- **1b 입장권**: 9:16, 1080×1920, 1장.
- **1c 벽면**: 4:5, 1080×1350, 1장. 오브제 4점.
- 내보내기: 아트보드를 360폭으로 그리고 pixelRatio 3으로 저장한다 (카드의 cardExport와 같은 방식).
- 세 가지를 모두 낼지, 하나로 시작할지는 사용자 결정을 기다린다.
