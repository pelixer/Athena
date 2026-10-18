# Athena — 작업 규약

제품 컨셉과 용어집: `docs/CONCEPT.md` (화면·컴포넌트·변수 이름은 용어집을 따른다)
디자인과의 소통 방법: `design/PROTOCOL.md`
배포: Cloudflare Workers(정적 자산), `main`에 푸시하면 GitHub Actions가 테스트·빌드·배포·점검 — `docs/DEPLOY.md`

## 역할
- **Claude Design**: 디자인 규약과 감각의 주인. 토큰(색·타입·간격·모션)의 값, 컴포넌트의 외형, 화면 구성, 카드·템플릿 비주얼.
- **Claude Code**: 구현의 주인. 데이터 모델, 상태, 라우팅, 카메라/EXIF/위치, OCR, 저장, 카드 이미지 내보내기.

## 디자인 ↔ 코드 규칙
1. **`design/tokens.css`가 계약서다.** 별도의 디자인 시스템 프로젝트는 두지 않는다.
   Claude Design의 결과물을 받으면 그 토큰 이름과 값을 그대로 이 파일에 옮기고, 코드는 이 파일만 읽는다.
   토큰을 바꿀 때는 디자인에서 먼저 정하고, 이 파일을 갱신한다. 디자인 원본은 `design/source/vN/`에 둔다.
2. **토큰 밖의 값을 코드에 하드코딩하지 않는다.** 색·폰트·간격·반경·그림자·모션은 전부 토큰을 거친다.
   필요한 값이 없으면 임의로 만들지 않고 `design/REVIEW.md`의 "토큰 요청"으로 남긴다.
   컴포넌트 고유 치수(버튼 높이, 셔터 크기 등)는 시안 값을 컴포넌트 CSS에 그대로 쓴다.
3. **이름을 공유한다.** 화면·컴포넌트 이름은 디자인과 코드가 동일하다 (예: `ObjeCard`, `VisitPage`).
4. **이탈은 기록한다.** 디자인대로 구현할 수 없거나 바꾼 부분은 `design/DEVIATIONS.md`에 이유와 함께 남긴다.
5. **작업 단계를 나눈다.** (자세한 기준은 `design/PROTOCOL.md` 3절)
   - 단계 1: 기존 토큰·컴포넌트 조합 → 바로 구현.
   - 단계 2: 새 컴포넌트·변형이 필요하지만 원칙으로 유추 가능 → 구현하고 `design/REVIEW.md`에 올린다. 갤러리에서 "검토 대기"로 표시.
   - 단계 3: 템플릿, 카드 변형, 첫 실행, 새 형식의 화면 → 디자인 시안을 먼저 받는다. 기능만 꾸밈 없이 둔다.
6. 디자인 검토는 기능마다 하지 않고, REVIEW.md가 쌓이면 라운드 단위로 한 번에 한다.
   구현 결과는 갤러리(`npm run build:preview` → `dist-preview/preview.html`, 단일 HTML 파일)로 전달한다.

## 코드 구조
- `src/domain` 용어집 타입과 순수 로직 (태그 파싱, 관람 내 순번, 관람 통계) — 테스트: `src/domain/*.test.ts`
- `src/data` IndexedDB(Dexie) 저장소. 로컬 우선, 계정 없음.
- `src/lib` 카메라, 사진 메타(EXIF/위치), OCR(기기 안 Tesseract, 서버 없음), 카드 내보내기, 포맷.
- `src/components` 표시 전용 컴포넌트. DB를 모른다 (갤러리에서 샘플로 렌더링할 수 있어야 한다).
- `src/pages` 화면. 데이터를 읽어 컴포넌트에 넘긴다.
- `src/preview` 컴포넌트 갤러리 (preview.html)

## 명령
- `npm run dev` 개발 서버 (먼저 OCR 엔진·한국어 모델을 `public/ocr`로 복사한다)
- `npm test` 단위 테스트 / `npm run typecheck`
- `npm run build` 앱 빌드 / `npm run build:preview` 갤러리를 단일 HTML로 빌드
