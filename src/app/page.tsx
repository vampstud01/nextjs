import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserProfileForm } from "@/components/user-profile-form";
import { UserCard } from "@/components/user-card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <main className="mx-auto w-full max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-slate-900">
            Next.js + shadcn/ui
          </h1>
          <p className="text-xl text-slate-600">
            프로젝트 기초 세팅이 완료되었습니다! 🎉
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Badge variant="secondary">Next.js 14</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="secondary">Tailwind CSS</Badge>
            <Badge variant="secondary">shadcn/ui</Badge>
          </div>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Next.js 14</CardTitle>
              <CardDescription>
                최신 App Router와 Server Components를 활용하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                TypeScript, ESLint, Tailwind CSS가 모두 설정되어 있습니다.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <a
                  href="https://nextjs.org/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  문서 보기
                </a>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>shadcn/ui</CardTitle>
              <CardDescription>
                아름답고 접근 가능한 컴포넌트 라이브러리
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                필요한 컴포넌트만 선택해서 프로젝트에 추가할 수 있습니다.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <a
                  href="https://ui.shadcn.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  컴포넌트 탐색
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>실용적인 예시</CardTitle>
                  <CardDescription>
                    설치된 컴포넌트들을 활용한 실제 사용 예시
                  </CardDescription>
                </div>
                <UserProfileForm />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <UserCard
                  name="김철수"
                  role="프론트엔드 개발자"
                  email="chulsoo@example.com"
                  status="active"
                />
                <UserCard
                  name="이영희"
                  role="백엔드 개발자"
                  email="younghee@example.com"
                  status="busy"
                />
                <UserCard
                  name="박민수"
                  role="풀스택 개발자"
                  email="minsu@example.com"
                  status="offline"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>설치된 컴포넌트</CardTitle>
            <CardDescription>
              다음 컴포넌트들이 설치되어 있으며 바로 사용 가능합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {[
                "Button",
                "Card",
                "Input",
                "Label",
                "Form",
                "Dialog",
                "Badge",
                "Avatar",
              ].map((component) => (
                <div
                  key={component}
                  className="rounded-md border border-slate-200 bg-white p-3 text-center text-sm font-medium text-slate-700"
                >
                  {component}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <div className="text-sm text-slate-600">
              <p className="font-semibold">추가 설치 명령어:</p>
              <code className="mt-2 block rounded bg-slate-100 p-2">
                npx shadcn@latest add [component-name]
              </code>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
