# 폰다이렉트 — 휴대폰 특가 원페이지 랜딩

Next.js 16 (App Router) + TypeScript + Tailwind v4. 모바일 퍼스트. Vercel 배포 대상.

## 실행

```bash
npm install
cp .env.example .env.local   # 값 수정
npm run dev                  # http://localhost:3000
```

환경변수가 하나도 없어도 **mock 인증 + 로컬 JSON 저장**으로 전체 퍼널이 동작합니다.

## 구조

```
data/
  products.json    상품·사전예약 (코드 수정 없이 이 파일만 편집)
  reviews.json     후기 — ⚠️ 현재 더미. 실제 후기로 교체 전 배포 금지
  faq.json         FAQ
  company.json     회사 정보 placeholder (NEXT_PUBLIC_COMPANY_* 환경변수가 우선)
  inquiries.local.json  로컬 저장소 폴백 (gitignore, 개인정보 포함)
src/
  app/
    page.tsx                 원페이지 (히어로 → 핫딜 → 상품 → 후기 → 절차 → FAQ → 푸터)
    terms/, privacy/         이용약관, 개인정보처리방침
    admin/                   신청 목록 + CSV (ADMIN_PASSWORD 필요)
    api/inquiry              POST 신청 생성 + 인증 요청
    api/auth/status          GET 인증 상태 폴링
    api/admin/*              로그인/목록/CSV
  lib/auth-provider/         본인확인 어댑터 (types / mock / portone / tilko / index)
  lib/storage.ts             Supabase ↔ 로컬 JSON 폴백
  lib/notify.ts              ADMIN_WEBHOOK_URL 알림 (Slack/Discord 호환)
  components/                섹션·UI·퍼널 모달
```

## 인증 연동 (AUTH_PROVIDER)

| 값 | 동작 |
|---|---|
| `mock` (기본) | 요청 5초 후 자동 성공. 시연용 |
| `portone` | `PORTONE_API_SECRET / STORE_ID / CHANNEL_KEY` 필요 |
| `tilko` | `TILKO_API_KEY` 필요 |

키가 없으면 무조건 mock 으로 폴백합니다.
**실 인증 연동은 본인확인 중개사와 발주사 명의 계약·심사가 필요하며 건당 과금됩니다.** 각 어댑터 파일 상단에 API 흐름을 주석으로 정리해 두었습니다.

## Supabase

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 설정 시 `inquiries` 테이블 사용. 스키마 SQL은 `src/lib/storage.ts` 상단 주석 참고.
Vercel 서버리스에서는 로컬 JSON 이 영속되지 않으므로 운영 시 필수입니다.

## 배포 전 체크리스트

- [ ] `data/reviews.json` 실제 후기로 교체 (`_isSampleData` 제거)
- [ ] `data/company.json` 또는 `NEXT_PUBLIC_COMPANY_*` 실제 정보 입력
- [ ] `NEXT_PUBLIC_KAKAO_CHANNEL_URL`, `NEXT_PUBLIC_SITE_URL` 설정
- [ ] `ADMIN_PASSWORD` 강한 값으로 변경
- [ ] Supabase 연결
- [ ] 본인확인 중개사 계약 후 `AUTH_PROVIDER` 전환
- [ ] 개인정보처리방침 제5조 수탁자 실제 계약사로 갱신
