import { createBrowserClient } from "@supabase/ssr";

// 브라우저용 Supabase 클라이언트 (Auth 포함)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// 관리자 권한 확인
export async function isAdmin() {
  const supabase = createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  // app_metadata에서 role 확인
  const role = user.app_metadata?.role;
  return role === "ADMIN";
}

// 현재 사용자 정보 가져오기
export async function getCurrentUser() {
  const supabase = createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

