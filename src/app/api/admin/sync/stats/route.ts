import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    // 1. 전체 캠핑장 수
    const { count: totalCampsites } = await supabaseAdmin
      .from("Campsite")
      .select("*", { count: "exact", head: true });

    // 2. 마지막 동기화 날짜
    const { data: lastSync } = await supabaseAdmin
      .from("CrawlLog")
      .select("completedAt")
      .eq("status", "SUCCESS")
      .order("completedAt", { ascending: false })
      .limit(1)
      .single();

    // 3. 성공한 동기화 수
    const { count: successfulSyncs } = await supabaseAdmin
      .from("CrawlLog")
      .select("*", { count: "exact", head: true })
      .eq("status", "SUCCESS");

    // 4. 실패한 동기화 수
    const { count: failedSyncs } = await supabaseAdmin
      .from("CrawlLog")
      .select("*", { count: "exact", head: true })
      .eq("status", "FAILED");

    return NextResponse.json({
      totalCampsites: totalCampsites || 0,
      lastSyncDate: lastSync?.completedAt || null,
      successfulSyncs: successfulSyncs || 0,
      failedSyncs: failedSyncs || 0,
    });
  } catch (error) {
    console.error("Failed to fetch sync stats:", error);
    return NextResponse.json(
      { error: "통계 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

