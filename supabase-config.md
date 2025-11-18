# Supabase 설정 (dogcamp)

## 1. 프로젝트 기본 정보
- 프로젝트 이름: dogcamp
- Supabase URL: https://mgfdswspyemrayrlvzki.supabase.co
- 지역(Region): (콘솔에 표시된 값 그대로 사용)
- 요금제: Free (트래픽/사용자가 늘면 Pro 검토)

## 2. 인증(Auth) 정책

### 2.1 로그인 방식
- 이메일 + 비밀번호: 사용
- 소셜 로그인(Google 등): 현재는 사용하지 않음 (추후 필요 시 추가)

### 2.2 이메일 인증 정책
- 회원가입 후 이메일 검증: **하지 않음**
  - 이유:
    - 초기 관리자/테스트 단계에서는 가입 허들을 낮추기 위함
    - 추후 일반 사용자 기능 확대 시, 이메일 인증을 켜는 방향으로 전환 가능
  - 유의사항:
    - 비밀번호를 잊어버렸을 때를 대비해 비밀번호 재설정 메일이 제대로 가는지 나중에 점검 필요

## 3. 비밀번호 정책
- 최소 길이: 8자 이상
- 요구 조건(권장):
  - 숫자 1개 이상
  - 영문 1개 이상
  - 특수문자는 선택
- 실제 정책 적용은 Supabase Auth 기본 정책을 사용하고,
  프론트엔드 폼 검증에서 위 기준을 안내/검사하는 형태로 구현

## 4. RLS(Row Level Security) 전략

### 4.1 현재 단계 (MVP, 관리자 중심)
- 대상 테이블 (예시): `campsite`, `dog_policy`, `availability`, `facility_tag`, `campsite_facility`, `source_site`, `crawl_log`
- 사용자는 사실상 관리자만 존재하므로:
  - 초기에는 관리자 UI/API에서만 접근하게 만들고,
  - RLS는 Off 상태로 시작해도 무방
- 보안은 “Supabase Auth + ROLE_ADMIN 체크”로 처리

### 4.2 추후 단계 (일반 사용자 기능 추가 시)
- 유저 리뷰/즐겨찾기 테이블 추가 예정:
  - 예: `review`, `favorite_campsite`
- 해당 테이블에는 RLS를 활성화하고,
  - 각 레코드의 `user_id = auth.uid()` 인 경우에만 읽기/쓰기 허용하는 정책 적용

## 5. 환경 변수(.env.local 예시)

NEXT_PUBLIC_SUPABASE_URL=https://mgfdswspyemrayrlvzki.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=실제_anon_키_값

# 서버에서만 쓸 서비스 키가 필요해지면 (예: 배치 작업)
# SUPABASE_SERVICE_ROLE_KEY=서비스_키_값- 위 키들은 **코드에 하드코딩하지 않고**, `.env.local`에만 저장
- Git에 커밋하지 않도록 `.gitignore`로 `.env*` 파일 제외

위 키들은 코드에 하드코딩하지 않고, .env.local에만 저장
Git에 커밋하지 않도록 .gitignore로 .env* 파일 제외


---

### 2. `admin-auth.md` (관리자: `admin@dogcamp.com` 기준)
:
  - `ADMIN`: 모든 관리 기능 접근 가능
    - 캠핑장 CRUD
    - 애완견 정책 수정
    - 크롤링/데이터 연동 로그 조회
- 향후 필요 시:
  - `EDITOR` (일부 수정만 가능), `VIEWER` (조회만 가능) 등으로 확장 여지를 남겨둠

## 2. 롤 저장 위치

- Supabase `auth.users`의 `app_metadata.role` 필드 사용
- 예시:
 
  {
    "app_metadata": {
      "role": "ADMIN"
    }
  }
  ## 3. 관리자 계정 생성 프로세스

### 3.1 첫 관리자 계정
- 이메일: `admin@dogcamp.com`
- 생성 절차:
  1. Supabase 콘솔 → Authentication → Users에서
     - 이메일: `admin@dogcamp.com`
     - 비밀번호: (강한 비밀번호로 직접 설정)
     - 이메일 인증은 사용하지 않으므로, 별도의 인증 메일 확인 없이 바로 사용 가능
  2. 해당 유저의 `app_metadata.role`을 `"ADMIN"`으로 설정

### 3.2 추가 관리자
- 추후 기능:
  - 관리자 페이지에서 `ADMIN`이 다른 유저 이메일을 입력하면,
    - 해당 유저의 role을 `"ADMIN"` 또는 `"EDITOR"`로 승격하는 API 제공
- 초기 단계에서는:
  - 필요 시 Supabase 콘솔에서 직접 추가/수정

## 4. 접근 제어 방식

### 4.1 페이지 라우트 보호(`/admin/*`)
- 정책:
  - `/admin/*` 라우트는 항상 로그인된 `ADMIN`만 접근 가능
- 구현 아이디어:
  - 클라이언트:
    - Supabase Auth를 사용해 현재 세션/유저 정보 조회
    - `role !== "ADMIN"`이면 `/login` 또는 권한 부족 페이지로 리다이렉트
  - 서버:
    - Next.js의 `middleware.ts`에서 `/admin` 경로에 대해 쿠키/토큰 검사 후,
      권한이 없으면 리다이렉트

### 4.2 API 라우트 보호(`/api/admin/*`)
- 정책:
  - `/api/admin/*`는 항상 서버 측에서 `role === "ADMIN"`인지 검사
- 구현 아이디어:
  1. 요청 헤더나 쿠키에서 Supabase 세션/JWT 추출
  2. Supabase SDK나 JWT 검증으로 유저 아이디/role 확인
  3. `role !== "ADMIN"`이면 403 Forbidden 응답

## 5. 에러 처리 UX

- 인증 실패:
  - 로그인 페이지로 리다이렉트 + “다시 로그인해 주세요” 메시지
- 권한 부족:
  - “관리자 권한이 필요한 페이지입니다” 안내 및 홈/로그인 링크 제공

  