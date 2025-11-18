import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GoCamping API 키
const API_KEY = process.env.GOCAMPING_API_KEY;
const API_URL = "https://apis.data.go.kr/B551011/GoCamping/basedList";

interface GoCampingItem {
  contentId: string;
  facltNm: string;
  addr1: string;
  tel: string;
  homepage: string;
  firstImageUrl: string;
  intro: string;
  animalCmgCl: string;
  [key: string]: any;
}

export async function POST() {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "GOCAMPING_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const startTime = new Date();
  let itemsProcessed = 0;
  let itemsCreated = 0;
  let itemsUpdated = 0;
  let itemsFailed = 0;

  try {
    // 1. SourceSite 조회 또는 생성
    const { data: existingSourceSite, error: findError } = await supabaseAdmin
      .from("SourceSite")
      .select("id")
      .eq("name", "고캠핑(공공데이터포털)")
      .single();

    let sourceSiteId: string;

    if (findError || !existingSourceSite) {
      // SourceSite가 없으면 생성
      const { data: newSourceSite, error: createError } = await supabaseAdmin
        .from("SourceSite")
        .insert({
          name: "고캠핑(공공데이터포털)",
          baseUrl: API_URL,
          type: "JSON_API",
          enabled: true,
        })
        .select()
        .single();

      if (createError || !newSourceSite) {
        throw new Error("SourceSite 생성 실패");
      }
      sourceSiteId = newSourceSite.id;
    } else {
      sourceSiteId = existingSourceSite.id;
    }

    // 2. CrawlLog 생성
    const { data: crawlLog, error: logError } = await supabaseAdmin
      .from("CrawlLog")
      .insert({
        sourceSiteId: sourceSiteId,
        status: "RUNNING",
        startedAt: startTime.toISOString(),
      })
      .select()
      .single();

    if (logError) {
      console.error("CrawlLog 생성 에러:", logError);
      throw new Error("CrawlLog 생성 실패: " + logError.message);
    }

    // 3. GoCamping API 호출 (페이지 1만 가져오기 - 데모용)
    const url = `${API_URL}?serviceKey=${API_KEY}&numOfRows=100&pageNo=1&MobileOS=ETC&MobileApp=DogCamp&_type=json`;
    
    const response = await fetch(url);
    const data = await response.json();

    const items: GoCampingItem[] =
      data?.response?.body?.items?.item || [];

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("API 응답에 데이터가 없습니다.");
    }

    // 4. 각 캠핑장 처리
    for (const item of items) {
      try {
        itemsProcessed++;

        // 고유 ID 생성
        const externalId = `gocamping-${item.contentId}`;

        // 기존 캠핑장 확인
        const { data: existing } = await supabaseAdmin
          .from("Campsite")
          .select("id")
          .eq("externalId", externalId)
          .single();

        // 반려견 정책 파싱
        const dogAllowed = item.animalCmgCl?.includes("가능");
        let dogSizeCategory = null;
        if (dogAllowed) {
          if (item.animalCmgCl?.includes("소형견")) {
            dogSizeCategory = "SMALL";
          } else if (item.animalCmgCl?.includes("중형견")) {
            dogSizeCategory = "MEDIUM";
          } else if (item.animalCmgCl?.includes("대형견")) {
            dogSizeCategory = "LARGE";
          }
        }

        if (existing) {
          // 업데이트
          const { error: updateError } = await supabaseAdmin
            .from("Campsite")
            .update({
              name: item.facltNm || "",
              address: item.addr1 || "",
              phone: item.tel || null,
              mainImageUrl: item.firstImageUrl || null,
              externalUrl: item.homepage || null,
              intro: item.intro || null,
            })
            .eq("id", existing.id);

          if (updateError) {
            throw updateError;
          }

          // DogPolicy 업데이트
          const { data: existingPolicy } = await supabaseAdmin
            .from("DogPolicy")
            .select("id")
            .eq("campsiteId", existing.id)
            .single();

          if (existingPolicy) {
            await supabaseAdmin
              .from("DogPolicy")
              .update({
                allowed: dogAllowed,
                sizeCategory: dogSizeCategory,
                note: item.animalCmgCl || null,
              })
              .eq("id", existingPolicy.id);
          } else if (dogAllowed) {
            await supabaseAdmin.from("DogPolicy").insert({
              campsiteId: existing.id,
              allowed: dogAllowed,
              sizeCategory: dogSizeCategory,
              note: item.animalCmgCl || null,
            });
          }

          itemsUpdated++;
        } else {
          // 생성
          const { data: newCampsite, error: createError } = await supabaseAdmin
            .from("Campsite")
            .insert({
              externalId,
              name: item.facltNm || "",
              address: item.addr1 || "",
              phone: item.tel || null,
              mainImageUrl: item.firstImageUrl || null,
              externalUrl: item.homepage || null,
              intro: item.intro || null,
            })
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          // DogPolicy 생성
          if (dogAllowed && newCampsite) {
            await supabaseAdmin.from("DogPolicy").insert({
              campsiteId: newCampsite.id,
              allowed: dogAllowed,
              sizeCategory: dogSizeCategory,
              note: item.animalCmgCl || null,
            });
          }

          itemsCreated++;
        }
      } catch (itemError) {
        console.error(`Failed to process item ${item.contentId}:`, itemError);
        itemsFailed++;
      }
    }

    // 5. CrawlLog 업데이트 (성공)
    await supabaseAdmin
      .from("CrawlLog")
      .update({
        status: "SUCCESS",
        completedAt: new Date().toISOString(),
        itemsProcessed,
        itemsCreated,
        itemsUpdated,
        itemsFailed,
        message: `성공적으로 동기화 완료`,
      })
      .eq("id", crawlLog.id);

    return NextResponse.json({
      success: true,
      itemsProcessed,
      itemsCreated,
      itemsUpdated,
      itemsFailed,
    });
  } catch (error: any) {
    console.error("Sync error:", error);

    return NextResponse.json(
      {
        error: error.message || "동기화 중 오류가 발생했습니다.",
        itemsProcessed,
        itemsCreated,
        itemsUpdated,
        itemsFailed,
      },
      { status: 500 }
    );
  }
}

