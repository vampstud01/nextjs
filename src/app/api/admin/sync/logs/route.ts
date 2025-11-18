import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: logs, error } = await supabase
      .from("CrawlLog")
      .select("*")
      .order("startedAt", { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    return NextResponse.json({ logs: logs || [] });
  } catch (error) {
    console.error("Failed to fetch sync logs:", error);
    return NextResponse.json(
      { error: "로그 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

