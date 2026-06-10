# 앙상블 클래시: 솔로

음악이론 카덴차 체크를 궨트식 3악장 카드배틀에 결합한 1인용 웹앱입니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열고 난이도를 선택하면 바로 플레이할 수 있습니다.

## 포함된 기능

- Next.js App Router + TypeScript + Tailwind CSS
- 순수 함수 게임 엔진: 시드 RNG, 멀리건, 패스, 악장 종료, 승점, 방해, 특수 카드, 리더 큐
- 앙상블 시너지: 화음 결속, 종지 인접, 조성 결속, 포르티시모
- AI 지휘자 3난이도와 시뮬레이션 하니스
- 이론형/청음형 카덴차 문제, Tone.js 오디오 테스트 페이지
- 덱빌더, 오답 노트, SRS 연습 모드, 캠페인 사다리
- `01 Source` 폴더의 보드/카드/토큰 이미지를 `/assets/...` 라우트로 사용
- localStorage 우선 저장, Supabase 환경변수 연결 시 선택적 동기화 준비

## 검증

```bash
npm run test:run
npm run build
npm run sim -- --games 200 --a hard --b normal
```

## Supabase

로그인 없이 모든 기능이 동작합니다. 동기화를 켜려면 `.env.local`에 다음 값을 넣고 Supabase 마이그레이션을 적용하세요.

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

스키마 초안은 `supabase/migrations/20260610000000_initial_schema.sql`에 있습니다. 모든 테이블은 owner-only RLS 정책을 사용합니다.
