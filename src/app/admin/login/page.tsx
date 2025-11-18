"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tent, LogIn, Loader2, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // 로그인 시도
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        throw signInError;
      }

      if (!data.user) {
        throw new Error("로그인에 실패했습니다.");
      }

      // 관리자 권한 확인
      const role = data.user.app_metadata?.role;
      if (role !== "ADMIN") {
        // 로그아웃
        await supabase.auth.signOut();
        throw new Error("관리자 권한이 없습니다.");
      }

      // 성공: 관리자 페이지로 이동
      router.push("/admin");
      router.refresh();
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-amber-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Tent className="h-12 w-12 text-green-600" />
            <h1 className="text-3xl font-bold text-slate-900">DogCamp</h1>
          </Link>
          <p className="mt-2 text-slate-600">관리자 로그인</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center">관리자 인증</CardTitle>
            <CardDescription className="text-center">
              관리자 계정으로 로그인해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@dogcamp.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    로그인
                  </>
                )}
              </Button>
            </form>

            {/* Back to Home */}
            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
                홈으로 돌아가기
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-medium">안내사항</p>
          <ul className="mt-2 space-y-1 text-blue-700">
            <li>• 관리자 권한이 있는 계정만 로그인할 수 있습니다</li>
            <li>• 계정 문의: admin@dogcamp.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

