# Athena — 작업 규약

제품 컨셉과 용어집: `docs/CONCEPT.md` (화면·컴포넌트·변수 이름은 용어집을 따른다)

## 역할
- **Claude Design**: 디자인 규약과 감각의 주인. 토큰(색·타입·간격·모션)의 값, 컴포넌트의 외형, 화면 구성, 카드·템플릿 비주얼.
- **Claude Code**: 구현의 주인. 데이터 모델, 상태, 라우팅, 카메라/EXIF/위치, OCR, 저장, 카드 이미지 내보내기.

## 디자인 ↔ 코드 규칙
1. **`design/tokens.css`가 계약서다.** 별도의 디자인 시스템 프로젝트는 두지 않는다.
   Claude Design은 이 파일의 토큰 이름으로 값을 정하고, 코드는 이 파일만 읽는다.
2. **토큰 밖의 값을 코드에 하드코딩하지 않는다.** 색·폰트·간격·반경·그림자·모션은 전부 semantic 토큰을 거친다.
   primitive(`--marble-*`, `--sky-*`)는 tokens.css 안에서만 쓴다.
   필요한 값이 없으면 임의로 만들지 않고 `design/HANDOFF.md`의 "토큰 요청"에 남긴다.
3. **이름을 공유한다.** 화면·컴포넌트 이름은 디자인과 코드가 동일하다 (`design/HANDOFF.md`의 목록).
4. **이탈은 기록한다.** 디자인대로 구현할 수 없거나 바꾼 부분은 `design/DEVIATIONS.md`에 이유와 함께 남긴다.
5. **피드백은 결과물 위에서.** 디자인 피드백은 디자인 아티팩트에, 구현 피드백은 컴포넌트 갤러리
   (`npm run build:preview` → `dist-preview/athena-components.html`을 Artifact로 게시)에 코멘트로 남긴다.

## 코드 구조
- `src/domain` 용어집 타입과 순수 로직 (태그 파싱, 관람 내 순번) — 테스트: `src/domain/*.test.ts`
- `src/data` IndexedDB(Dexie) 저장소. 로컬 우선, 계정 없음.
- `src/components` 표시 전용 컴포넌트. DB를 모른다 (갤러리에서 샘플로 렌더링할 수 있어야 한다).
- `src/pages` 화면. 데이터를 읽어 컴포넌트에 넘긴다.
- `src/preview` 컴포넌트 갤러리 (preview.html)

## 명령
- `npm run dev` 개발 서버
- `npm test` 단위 테스트 / `npm run typecheck`
- `npm run build` 앱 빌드 / `npm run build:preview` 갤러리를 단일 HTML로 빌드
