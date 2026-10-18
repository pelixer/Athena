repo: pelixer/Athena
branch: main
path: design/source/v1

## Last sync
date: 2026-10-18T03:58:17Z

### Updated in this project
- 라운드 1 답변: `design/REVIEW-R1-answers.md` (R1–R10, T1–T15)
- D1 템플릿 시안: `Athena Template v1.dc.html` + `TemplateCatalogue` / `TemplateTicket` / `TemplateWall`
- 토큰 승인(요청 → 본문): `--text-body` `--text-on-dark-muted` `--glass-dark-blur` `--scrim-bottom` `--scrim-dim` `--fade-top` `--gradient-photo` `--type-badge` `--type-meta` `--type-tab` `--type-item` `--type-heading-s` `--type-card-note` `--type-wordmark` `--tracking-display|label|badge|control|wordmark` (값 변경 없음)
- 토큰 추가·변경: `--type-display-xxl: 600 40px/1.15 serif` (새 토큰) · `--type-title-serif: 600 19px/1.4 serif` (새 토큰) · `--rule-on-dark: rgba(251,250,247,.5)` (새 토큰) · `--rule-perforation: stone-400` (새 토큰) · `--radius-lg: 28px` (새 토큰, 시트) · `--radius-md`의 용도에 입력칸 추가 (값 12 그대로)

## Screen map
| Screen | Repo files |
|---|---|
| Athena Template v1.dc.html (05 TemplatePage, 1a/1b/1c) | src/pages/VisitPage.tsx (finish), src/pages/CardPage.tsx, src/lib/cardExport.ts |
| TemplateCatalogue / TemplateTicket / TemplateWall .dc.html | src/domain/types.ts (Visit, Obje, Docent) |
| Athena Design System v0.dc.html | docs/CONCEPT.md, CLAUDE.md |
| Athena Screens v0.dc.html | src/pages/*Page.tsx |
| design/tokens.css | design/tokens.css, design/REVIEW.md |

## Sync history
- 2026-10-17T13:54:14Z · branch claude/gracious-einstein-eupywf · v0 디자인 시스템 + 대표 화면 4종
