"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tent, LogIn, LogOut, User } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-auth";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // 현재 사용자 정보 가져오기
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getUser();

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tent className="h-8 w-8 text-green-600" />
            <Link href="/">
              <h1 className="text-2xl font-bold text-slate-900">DogCamp</h1>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/search">
              <Button variant="ghost">캠핑장 찾기</Button>
            </Link>
            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {user.user_metadata?.full_name || user.email?.split("@")[0]}
                      </span>
                    </div>
                    <Button variant="outline" onClick={handleLogout} size="sm">
                      <LogOut className="mr-2 h-4 w-4" />
                      로그아웃
                    </Button>
                  </div>
                ) : (
                  <Link href="/login">
                    <Button variant="outline">
                      <LogIn className="mr-2 h-4 w-4" />
                      로그인
                    </Button>
                  </Link>
                )}
              </>
            )}
            <Link href="/admin">
              <Button variant="outline">관리자</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

