# 🐕 DogCamp DB 세팅 가이드

## ✅ 현재 상태
- [x] `.env.local` 파일 생성 완료
- [x] Prisma 스키마 작성 완료
- [ ] DATABASE_URL 비밀번호 설정 필요
- [ ] Prisma 마이그레이션 실행 필요
- [ ] 관리자 계정 생성 필요

---

## 📝 지금 해야 할 일

### 1단계: DATABASE_URL 비밀번호 가져오기

#### 방법 A: Supabase 대시보드에서 Connection String 복사

1. **Supabase 대시보드 접속**  
   👉 https://supabase.com/dashboard/project/mgfdswspyemrayrlvzki

2. 왼쪽 메뉴에서 **Settings** (⚙️) 클릭

3. **Database** 탭 선택

4. **Connection string** 섹션에서:
   - **URI** 탭 선택
   - 표시된 PostgreSQL URL을 복사

5. `.env.local` 파일을 열고 `DATABASE_URL` 줄을 복사한 URL로 교체

#### 방법 B: 비밀번호만 교체

만약 데이터베이스 비밀번호를 알고 계시다면:

1. `.env.local` 파일을 열기
2. `DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db...` 에서  
   `[YOUR-PASSWORD]` 부분을 실제 비밀번호로 교체

> ⚠️ **비밀번호를 잊으셨나요?**  
> Supabase 대시보드 > Settings > Database > Database Settings > **Reset database password**

---

### 2단계: Prisma 마이그레이션 실행

터미널에서 다음 명령어를 순서대로 실행하세요:

```bash
# 1. Prisma 클라이언트 생성
npx prisma generate

# 2. 마이그레이션 생성 및 적용
npx prisma migrate dev --name init

# 3. (선택) Prisma Studio로 DB 확인
npx prisma studio
```

#### 예상 결과

마이그레이션이 성공하면 다음과 같은 테이블이 생성됩니다:
- ✅ `Campsite` - 캠핑장 정보
- ✅ `DogPolicy` - 애완견 정책
- ✅ `Availability` - 예약 가능 날짜
- ✅ `FacilityTag` - 편의시설 태그
- ✅ `CampsiteFacility` - 캠핑장-편의시설 연결
- ✅ `SourceSite` - 크롤링 소스 사이트
- ✅ `CrawlLog` - 크롤링 로그

---

### 3단계: 관리자 계정 생성

#### Supabase 대시보드에서 생성

1. **Authentication** > **Users** 이동
2. **Add user** 클릭
3. 다음 정보 입력:
   - Email: `admin@dogcamp.com`
   - Password: (강한 비밀번호 설정)
   - ✅ **Auto Confirm User** 체크
4. **Create user** 클릭
5. 생성된 유저를 클릭하고 아래로 스크롤
6. **Raw User Meta Data** 섹션에서 **Edit** 클릭
7. `app_metadata`에 다음 추가:

```json
{
  "provider": "email",
  "providers": ["email"],
  "role": "ADMIN"
}
```

8. **Save** 클릭

---

## 🔍 확인 사항

### Prisma Studio에서 확인

```bash
npx prisma studio
```

브라우저가 열리면:
- 왼쪽에 모든 모델(테이블)이 보여야 함
- 각 테이블을 클릭해서 구조 확인

### Supabase 대시보드에서 확인

1. **Table Editor** 메뉴로 이동
2. 생성된 테이블 목록 확인:
   - `Campsite`
   - `DogPolicy`
   - `Availability`
   - `FacilityTag`
   - `CampsiteFacility`
   - `SourceSite`
   - `CrawlLog`

---

## ⚠️ 트러블슈팅

### "Can't reach database server" 오류

**원인**: DATABASE_URL이 잘못되었거나 프로젝트가 일시 중지됨

**해결**:
1. Supabase 대시보드에서 프로젝트 상태 확인
2. DATABASE_URL의 비밀번호가 정확한지 확인
3. Connection string을 다시 복사해서 교체

### "Pool request timeout" 오류

**원인**: Supabase의 connection pooler 사용 시 발생 가능

**해결**:
1. `.env.local`의 DATABASE_URL을 **Direct connection** 방식으로 변경:

```env
# Pooler 방식 (기본)
DATABASE_URL=postgresql://postgres.[프로젝트ID]:[비밀번호]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct 방식 (마이그레이션용)
DATABASE_URL=postgresql://postgres:[비밀번호]@db.mgfdswspyemrayrlvzki.supabase.co:5432/postgres
```

2. 마이그레이션 실행 시에는 **Direct connection** 사용
3. 실제 앱 실행 시에는 **Pooler** 사용 가능

### 마이그레이션 초기화 (데이터 손실 주의!)

```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```

---

## 🎯 다음 단계

DB 세팅이 완료되면:

1. **고캠핑 API 키 발급**
   - 공공데이터포털(data.go.kr) 접속
   - "고캠핑" 또는 "GoCamping" 검색
   - 활용 신청 → serviceKey 발급
   - `.env.local`의 `GOCAMPING_API_KEY`에 추가

2. **데이터 동기화 테스트**
   ```bash
   npm run sync:gocamping
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

---

## 📚 참고 문서

- [Supabase 프로젝트 대시보드](https://supabase.com/dashboard/project/mgfdswspyemrayrlvzki)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [공공데이터포털](https://www.data.go.kr)

