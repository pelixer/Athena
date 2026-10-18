# 배포 — Cloudflare Pages

레포를 Cloudflare Pages에 연결하면 푸시할 때마다 자동으로 빌드·배포된다. 서버·API 키 없음.

## 처음 한 번 (Cloudflare 대시보드)
1. Workers & Pages → Create → Pages → **Connect to Git** → `pelixer/Athena` 선택
2. 빌드 설정

   | 항목 | 값 |
   |---|---|
   | Production branch | `claude/gracious-einstein-eupywf` (나중에 `main`을 만들면 바꾼다) |
   | Framework preset | None (또는 Vite) |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | (비움) |

   Node 버전은 레포의 `.node-version`(22)을 따른다.
3. Save and Deploy → `https://<프로젝트>.pages.dev` 주소가 생긴다.

## 레포 쪽에 들어 있는 것
- `public/_headers` — 캐시(빌드 파일은 1년, OCR 파일은 30일)와 카메라·위치 권한 헤더
- SPA 라우팅: `404.html`이 없으면 Pages가 모든 경로에 `index.html`을 준다. `/visit/…` 같은 주소를 새로고침해도 열린다.
- OCR 파일(`public/ocr`)은 레포에 없고 `npm run build`가 `node_modules`에서 복사한다.

## 확인
- 휴대폰에서 주소를 열고 관람 시작 → 카메라 권한 허용 → 오브제·도슨트 촬영
- 도슨트 첫 인식 때 OCR 파일(약 5MB)을 한 번 받는다. 와이파이에서 한 번 열어 두면 좋다.

## 주의: 기록은 그 기기의 브라우저에 저장된다
- 계정·서버가 없으므로 사진과 노트는 그 휴대폰 브라우저 안(IndexedDB)에만 있다. 브라우저 데이터를 지우면 함께 지워진다.
- iPhone Safari는 한동안 열지 않은 사이트의 저장 데이터를 지울 수 있다. **홈 화면에 추가**해서 쓰면 이 정리 대상에서 빠진다.
