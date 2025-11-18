# Supabase DB 세팅 가이드

## 1. 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 다음 내용을 넣으세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://mgfdswspyemrayrlvzki.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZmRzd3NweWVtcmF5cmx2emtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Mzg4OTYsImV4cCI6MjA3OTAxNDg5Nn0.XUyQL9mbwQUtzxms3cVkG0EdrjPYFVhcqkWmdN2Vdsk

# DATABASE_URL은 Supabase 대시보드에서 가져오기
# 1. https://supabase.com/dashboard/project/mgfdswspyemrayrlvzki 접속
# 2. Settings > Database > Connection string > URI 선택
# 3. [YOUR-PASSWORD]를 실제 DB 비밀번호로 교체
DATABASE_URL=postgresql://postgres.vampstud01pass@db.mgfdswspyemrayrlvzki.supabase.co:5432/postgres
# 고캠핑 API (나중에 발급)
GOCAMPING_API_KEY=bf410f338486c27a9c1251097798bfdd32d5ac24a71aceb442c5685eaaf975a3
```

## 2. DATABASE_URL 가져오는 방법

1. Supabase 대시보드 접속: https://supabase.com/dashboard/project/mgfdswspyemrayrlvzki
2. 왼쪽 메뉴에서 **Settings** 클릭
3. **Database** 탭 선택
4. **Connection string** 섹션에서 **URI** 선택
5. 표시된 URL을 복사하고 `[YOUR-PASSWORD]`를 실제 데이터베이스 비밀번호로 교체

> ⚠️ 비밀번호를 잊어버렸다면:
> - Settings > Database > Database password > Reset database password

## 3. Prisma 마이그레이션 실행

환경 변수 설정 후, 다음 명령어를 순서대로 실행:

```bash
# 1. Prisma 클라이언트 생성
npx prisma generate

# 2. 마이그레이션 생성 및 적용
npx prisma migrate dev --name init

# 3. Prisma Studio로 DB 확인 (선택)
npx prisma studio
```

## 4. 관리자 계정 생성

마이그레이션 완료 후:

1. Supabase 대시보드 > **Authentication** > **Users** 이동
2. **Add user** 클릭
3. 이메일: `admin@dogcamp.com`
4. 비밀번호: (강한 비밀번호 설정)
5. **Auto Confirm User** 체크 (이메일 인증 건너뛰기)
6. 생성 후, 해당 유저 클릭 > **Raw user meta data** 섹션에서 `app_metadata` 편집:

```json
{
  "provider": "email",
  "providers": ["email"],
  "role": "ADMIN"
}
```

## 5. 확인 사항

- [ ] `.env.local` 파일 생성 및 DATABASE_URL 설정 완료
- [ ] `npx prisma generate` 실행 완료
- [ ] `npx prisma migrate dev --name init` 실행 완료
- [ ] Prisma Studio에서 테이블이 정상적으로 생성되었는지 확인
- [ ] 관리자 계정(`admin@dogcamp.com`) 생성 및 role 설정 완료

## 6. 트러블슈팅

### "Can't reach database server" 오류

- DATABASE_URL의 비밀번호가 정확한지 확인
- Supabase 프로젝트가 일시 중지(paused)되지 않았는지 확인
- 방화벽이나 VPN이 PostgreSQL 포트(5432 또는 6543)를 차단하지 않는지 확인

### 마이그레이션이 실패할 때

```bash
# 기존 마이그레이션 초기화 (주의: 데이터 손실)
npx prisma migrate reset

# 다시 마이그레이션
npx prisma migrate dev --name init
```

## 7. 다음 단계

DB 세팅이 완료되면:
- 고캠핑 API 키 발급 후 `.env.local`에 추가
- `npm run sync:gocamping` 실행하여 데이터 동기화
- Next.js 개발 서버 실행: `npm run dev`

