import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  let response = NextResponse.redirect(new URL(next, request.url));

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.redirect(new URL(next, request.url));
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: "",
              ...options,
            });
            response = NextResponse.redirect(new URL(next, request.url));
            response.cookies.set({
              name,
              value: "",
              ...options,
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("OAuth callback error:", error);
      return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
    }

    return response;
  }

  // code가 없는 경우 로그인 페이지로 리다이렉트
  return NextResponse.redirect(new URL("/login?error=no_code", request.url));
}

