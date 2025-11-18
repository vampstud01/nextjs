"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tent, ArrowLeft, Plus, LogOut, RefreshCw, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase-auth";
import { useState } from "react";

interface AdminHeaderProps {
  showAddButton?: boolean;
}

export default function AdminHeader({ showAddButton = false }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (!confirm("로그아웃 하시겠습니까?")) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      alert("로그아웃에 실패했습니다.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Tent className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-slate-900">DogCamp</h1>
            </Link>
            <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-700">
              관리자
            </Badge>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                홈으로
              </Button>
            </Link>
            <Link href="/admin">
              <Button 
                variant={pathname === "/admin" ? "secondary" : "ghost"} 
                size="sm"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                대시보드
              </Button>
            </Link>
            <Link href="/admin/sync">
              <Button 
                variant={pathname === "/admin/sync" ? "secondary" : "ghost"} 
                size="sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                동기화
              </Button>
            </Link>
            {showAddButton && (
              <Link href="/admin/new">
                <Button className="bg-green-600 hover:bg-green-700" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  캠핑장 등록
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}

