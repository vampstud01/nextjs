# Next.js + shadcn/ui 프로젝트

이 프로젝트는 Next.js 14와 shadcn/ui로 구성된 모던 웹 애플리케이션입니다.

## 🚀 기술 스택

- **Next.js 14** - App Router, Server Components
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **shadcn/ui** - 아름답고 접근 가능한 컴포넌트
- **React Hook Form** - 폼 관리
- **Zod** - 스키마 검증
- **ESLint** - 코드 품질 관리

## 📦 설치된 컴포넌트

현재 프로젝트에 다음 shadcn/ui 컴포넌트가 설치되어 있습니다:

- ✅ Button
- ✅ Card
- ✅ Input
- ✅ Label
- ✅ Form
- ✅ Dialog
- ✅ Badge
- ✅ Avatar

## 🎯 시작하기

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

개발 서버가 실행되면 다음을 볼 수 있습니다:
- 프로젝트 개요 및 기술 스택
- 사용자 프로필 편집 폼 (Dialog + Form + Input)
- 사용자 카드 목록 (Card + Avatar + Badge)
- 설치된 컴포넌트 목록

### 빌드

```bash
npm run build
```

### 프로덕션 서버 실행

```bash
npm start
```

## 🎨 shadcn/ui 컴포넌트 추가

필요한 컴포넌트를 추가하려면:

```bash
npx shadcn@latest add [component-name]
```

예시:
```bash
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add dropdown-menu
```

사용 가능한 모든 컴포넌트는 [shadcn/ui 문서](https://ui.shadcn.com)에서 확인할 수 있습니다.

## 📁 프로젝트 구조

```
nextjs/
├── src/
│   ├── app/                      # Next.js App Router 페이지
│   │   ├── page.tsx             # 메인 페이지
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   └── globals.css          # 전역 스타일
│   ├── components/              # React 컴포넌트
│   │   ├── ui/                  # shadcn/ui 컴포넌트
│   │   ├── user-profile-form.tsx # 사용자 프로필 폼 예시
│   │   └── user-card.tsx        # 사용자 카드 예시
│   └── lib/                     # 유틸리티 함수
│       └── utils.ts
├── public/                      # 정적 파일
├── components.json              # shadcn/ui 설정
└── package.json
```

## 💡 예시 컴포넌트

### UserProfileForm

Dialog와 Form을 사용한 사용자 프로필 편집 폼입니다.
- React Hook Form으로 폼 상태 관리
- Zod로 입력값 검증
- Dialog로 모달 구현

### UserCard

Avatar, Badge, Card를 조합한 사용자 정보 카드입니다.
- 상태 표시 (활성/오프라인/바쁨)
- 아바타 이미지 및 폴백
- 반응형 레이아웃

## 🔧 주요 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint

# shadcn/ui 컴포넌트 추가
npx shadcn@latest add [component-name]
```

## 📚 더 알아보기

- [Next.js 문서](https://nextjs.org/docs)
- [shadcn/ui 문서](https://ui.shadcn.com)
- [Tailwind CSS 문서](https://tailwindcss.com)
- [React Hook Form 문서](https://react-hook-form.com)
- [Zod 문서](https://zod.dev)
