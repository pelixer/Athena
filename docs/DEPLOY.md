# 배포 — Cloudflare Workers (정적 자산), GitHub Actions

valopoint와 같은 방식이다. `main`에 푸시하면 GitHub Actions(`.github/workflows/deploy-cloudflare.yml`)가
**테스트 → 빌드 → `wrangler deploy` → 실제 사이트 점검**을 한다. 서버 코드·API 키 없음 —
Worker는 `dist`의 정적 파일만 내보낸다 (`wrangler.jsonc`).

Cloudflare 대시보드의 "Import a repository"(Workers Builds)는 쓰지 않는다. 같이 켜면 두 번 배포된다.

## 처음 한 번 — GitHub 저장소 설정 (pelixer/Athena → Settings → Secrets and variables → Actions)

| 종류 | 이름 | 값 |
|---|---|---|
| Secret | `CLOUDFLARE_API_TOKEN` | Workers 편집 권한 토큰. valopoint에 쓴 토큰을 그대로 써도 된다 (계정 전체 권한이면) |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 계정 ID (대시보드 Workers & Pages 오른쪽 Account details) |
| Variable (선택) | `ATHENA_DOMAIN` | 같은 계정 zone의 도메인. 없으면 `https://athena.demosco.workers.dev` |

설정 후 Actions 탭에서 deploy-cloudflare를 **Run workflow**로 한 번 돌리거나, `main`에 푸시한다.

## 배포 점검 (워크플로가 자동으로)
- `/`가 앱을 내보내는지, `/visit/…` 같은 앱 주소가 `index.html`로 열리는지
- OCR 한국어 모델(`/ocr/lang/kor.traineddata.gz`)이 내려가는지
- `public/_headers`의 보안 헤더(CSP)가 붙었는지

## 레포 쪽에 들어 있는 것
- `wrangler.jsonc` — 정적 자산 + SPA 설정. `wrangler`는 devDependency로 버전 고정
- `public/_headers` — 캐시(빌드 파일 1년, OCR 파일 30일), 카메라·위치 권한, CSP.
  CSP가 'self' 밖으로 여는 것: OCR용 WebAssembly, Google Fonts(Noto Serif KR), 사진 blob:, 카메라 스트림
- OCR 파일(`public/ocr`)은 레포에 없고 `npm run build`가 `node_modules`에서 복사한다

로컬에서 배포본처럼 확인: `npm run build && npx wrangler dev`

## 주의: 기록은 그 기기의 브라우저에 저장된다
- 계정·서버가 없으므로 사진과 노트는 그 휴대폰 브라우저 안(IndexedDB)에만 있다. 브라우저 데이터를 지우면 함께 지워진다.
- iPhone Safari는 한동안 열지 않은 사이트의 저장 데이터를 지울 수 있다. **홈 화면에 추가**해서 쓰면 이 정리 대상에서 빠진다.
