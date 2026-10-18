# 배포 — Cloudflare Workers (정적 자산)

레포를 Cloudflare에 연결하면 `claude/main`에 푸시할 때마다 자동으로 빌드·배포된다. 서버 코드·API 키 없음 —
Worker는 `dist`의 정적 파일만 내보낸다 (`wrangler.jsonc`).

## 처음 한 번 (Cloudflare 대시보드 → Workers & Pages → Create → Import a repository)

| 항목 | 값 |
|---|---|
| Repository | `pelixer/Athena` |
| Project name | `athena` (`wrangler.jsonc`의 `name`과 같아야 한다) |
| Production branch | `claude/main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` (기본값) |
| Non-production branch deploy command | `npx wrangler versions upload` (기본값, 미리보기 빌드를 켤 때) |
| Path | `/` |
| API token | Create new token (자동 생성) |
| Variables | 없음 |

Node 버전은 레포의 `.node-version`(22)을 따른다. 배포가 끝나면 `https://athena.<계정>.workers.dev` 주소가 생긴다.

## 레포 쪽에 들어 있는 것
- `wrangler.jsonc` — `dist`를 정적 자산으로 올리고, 앱 주소(`/visit/…`, `/obje/…`)를 새로고침해도 `index.html`을 주는 SPA 설정
- `public/_headers` — 캐시(빌드 파일 1년, OCR 파일 30일)와 카메라·위치 권한 헤더
- OCR 파일(`public/ocr`)은 레포에 없고 `npm run build`가 `node_modules`에서 복사한다
- `wrangler`는 devDependency로 버전을 고정했다

로컬에서 배포본처럼 확인: `npm run build && npx wrangler dev`

## 확인
- 휴대폰에서 주소를 열고 관람 시작 → 카메라 권한 허용 → 오브제·도슨트 촬영
- 도슨트 첫 인식 때 OCR 파일(약 5MB)을 한 번 받는다. 와이파이에서 한 번 열어 두면 좋다.

## 주의: 기록은 그 기기의 브라우저에 저장된다
- 계정·서버가 없으므로 사진과 노트는 그 휴대폰 브라우저 안(IndexedDB)에만 있다. 브라우저 데이터를 지우면 함께 지워진다.
- iPhone Safari는 한동안 열지 않은 사이트의 저장 데이터를 지울 수 있다. **홈 화면에 추가**해서 쓰면 이 정리 대상에서 빠진다.
