import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createId } from "@paralleldrive/cuid2";

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
  let sourceSiteId: string | undefined;
  let crawlLogId: string | undefined;
  let startIndex = 0; // 시작 인덱스
  const batchSize = 100; // 한 번에 처리할 항목 수

  try {
    // Supabase Admin 클라이언트 가져오기
    const supabase = getSupabaseAdmin();

    // 1. SourceSite 조회 또는 생성
    const { data: existingSourceSite, error: findError } = await supabase
      .from("SourceSite")
      .select("id, lastProcessedIndex")
      .eq("name", "고캠핑(공공데이터포털)")
      .single();

    if (findError || !existingSourceSite) {
      // SourceSite가 없으면 생성
      const newSourceSiteId = createId();
      const { data: newSourceSite, error: createError } = await supabase
        .from("SourceSite")
        .insert({
          id: newSourceSiteId,
          name: "고캠핑(공공데이터포털)",
          baseUrl: API_URL,
          type: "JSON_API",
          enabled: true,
          lastProcessedIndex: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error("SourceSite 생성 에러 상세:", createError);
        throw new Error(
          `SourceSite 생성 실패: ${createError.message || JSON.stringify(createError)}`
        );
      }

      if (!newSourceSite) {
        throw new Error("SourceSite 생성 실패: 데이터가 반환되지 않았습니다.");
      }
      sourceSiteId = newSourceSite.id;
      startIndex = 0;
    } else {
      sourceSiteId = existingSourceSite.id;
      startIndex = existingSourceSite.lastProcessedIndex || 0;
    }

    console.log(`동기화 시작: ${startIndex}번째 항목부터 처리합니다.`);

    // 2. CrawlLog 생성
    const newCrawlLogId = createId();
    const { data: crawlLog, error: logError } = await supabase
      .from("CrawlLog")
      .insert({
        id: newCrawlLogId,
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

    if (crawlLog) {
      crawlLogId = crawlLog.id;
    }

    // 3. GoCamping API 호출 - 필요한 범위만 가져오기
    // 시작 페이지와 필요한 페이지 수 계산
    const numOfRows = 100; // 한 페이지당 항목 수
    const startPage = Math.floor(startIndex / numOfRows) + 1;
    const startOffset = startIndex % numOfRows; // 페이지 내 시작 위치
    const endIndex = startIndex + batchSize; // 처리할 마지막 인덱스

    // 먼저 전체 개수 확인 (첫 페이지만 호출)
    const firstPageUrl = `${API_URL}?serviceKey=${API_KEY}&numOfRows=100&pageNo=1&MobileOS=ETC&MobileApp=DogCamp&_type=json`;
    const firstPageResponse = await fetch(firstPageUrl);
    const firstPageData = await firstPageResponse.json();

    const totalCount =
      firstPageData?.response?.body?.totalCount ||
      firstPageData?.response?.body?.items?.item?.length ||
      0;

    if (totalCount === 0) {
      throw new Error("API 응답에 데이터가 없습니다.");
    }

    // 시작 인덱스가 전체 개수를 초과하면 동기화 완료
    if (startIndex >= totalCount) {
      console.log(`모든 데이터를 처리했습니다. (${startIndex}/${totalCount})`);
      return NextResponse.json({
        success: true,
        message: "모든 데이터를 처리했습니다.",
        itemsProcessed: 0,
        itemsCreated: 0,
        itemsUpdated: 0,
        itemsFailed: 0,
      });
    }

    // 필요한 페이지 범위 계산
    const endPage = Math.ceil(endIndex / numOfRows);
    const actualEndIndex = Math.min(endIndex, totalCount);

    console.log(
      `처리 범위: ${startIndex}번째 ~ ${actualEndIndex - 1}번째 항목 (총 ${totalCount}개 중)`
    );
    console.log(`필요한 페이지: ${startPage} ~ ${endPage}`);

    // 필요한 페이지들 가져오기
    const allItems: GoCampingItem[] = [];
    for (let pageNo = startPage; pageNo <= endPage; pageNo++) {
      const pageUrl = `${API_URL}?serviceKey=${API_KEY}&numOfRows=${numOfRows}&pageNo=${pageNo}&MobileOS=ETC&MobileApp=DogCamp&_type=json`;
      const pageResponse = await fetch(pageUrl);
      const pageData = await pageResponse.json();

      const pageItems = pageData?.response?.body?.items?.item || [];
      if (Array.isArray(pageItems)) {
        allItems.push(...pageItems);
        console.log(`페이지 ${pageNo} 완료 (${allItems.length}개 수집)`);
      }

      // API 호출 제한을 고려한 짧은 대기
      if (pageNo < endPage) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // 시작 인덱스부터 필요한 만큼만 슬라이스
    const items = allItems.slice(startOffset, startOffset + batchSize);

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("처리할 데이터가 없습니다.");
    }

    console.log(
      `총 ${items.length}개 항목을 가져왔습니다. (${startIndex}번째부터 시작)`
    );

    // 4. 각 캠핑장 처리
    for (const item of items) {
      try {
        itemsProcessed++;

        // 고유 ID 생성
        const externalId = `gocamping-${item.contentId}`;

        // 기존 캠핑장 확인
        const { data: existing } = await supabase
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
          const { error: updateError } = await supabase
            .from("Campsite")
            .update({
              name: item.facltNm || "",
              address: item.addr1 || "",
              phone: item.tel || null,
              mainImageUrl: item.firstImageUrl || null,
              externalUrl: item.homepage || null,
              intro: item.intro || null,
              updatedAt: new Date().toISOString(),
            })
            .eq("id", existing.id);

          if (updateError) {
            throw updateError;
          }

          // DogPolicy 업데이트
          const { data: existingPolicy } = await supabase
            .from("DogPolicy")
            .select("id")
            .eq("campsiteId", existing.id)
            .single();

          if (existingPolicy) {
            await supabase
              .from("DogPolicy")
              .update({
                allowed: dogAllowed,
                sizeCategory: dogSizeCategory,
                note: item.animalCmgCl || null,
              })
              .eq("id", existingPolicy.id);
          } else if (dogAllowed) {
            const newDogPolicyId = createId();
            await supabase.from("DogPolicy").insert({
              id: newDogPolicyId,
              campsiteId: existing.id,
              allowed: dogAllowed,
              sizeCategory: dogSizeCategory,
              note: item.animalCmgCl || null,
            });
          }

          itemsUpdated++;
        } else {
          // 생성
          const newCampsiteId = createId();
          const now = new Date().toISOString();
          const { data: newCampsite, error: createError } = await supabase
            .from("Campsite")
            .insert({
              id: newCampsiteId,
              externalId,
              name: item.facltNm || "",
              address: item.addr1 || "",
              phone: item.tel || null,
              mainImageUrl: item.firstImageUrl || null,
              externalUrl: item.homepage || null,
              intro: item.intro || null,
              createdAt: now,
              updatedAt: now,
            })
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          // DogPolicy 생성
          if (dogAllowed && newCampsite) {
            const newDogPolicyId = createId();
            await supabase.from("DogPolicy").insert({
              id: newDogPolicyId,
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

    // 5. 처리 완료 후 상태 업데이트
    const newLastProcessedIndex = startIndex + itemsProcessed;
    const isComplete = newLastProcessedIndex >= totalCount;

    // SourceSite의 lastProcessedIndex 업데이트
    await supabase
      .from("SourceSite")
      .update({
        lastProcessedIndex: newLastProcessedIndex,
      })
      .eq("id", sourceSiteId);

    // CrawlLog 업데이트 (성공)
    if (crawlLogId) {
      await supabase
        .from("CrawlLog")
        .update({
          status: isComplete ? "SUCCESS" : "SUCCESS",
          completedAt: new Date().toISOString(),
          itemsProcessed,
          itemsCreated,
          itemsUpdated,
          itemsFailed,
          message: isComplete
            ? `모든 데이터 동기화 완료 (${newLastProcessedIndex}/${totalCount})`
            : `부분 동기화 완료 (${newLastProcessedIndex}/${totalCount}, 다음 실행 시 ${newLastProcessedIndex}번째부터 계속)`,
        })
        .eq("id", crawlLogId);
    }

    return NextResponse.json({
      success: true,
      itemsProcessed,
      itemsCreated,
      itemsUpdated,
      itemsFailed,
      lastProcessedIndex: newLastProcessedIndex,
      totalCount,
      isComplete,
      message: isComplete
        ? "모든 데이터 동기화가 완료되었습니다."
        : `부분 동기화 완료. 다음 실행 시 ${newLastProcessedIndex}번째 항목부터 계속됩니다.`,
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    // 처리된 항목이 있다면 lastProcessedIndex 업데이트
    if (sourceSiteId && itemsProcessed > 0) {
      try {
        const supabase = getSupabaseAdmin();
        const newLastProcessedIndex = startIndex + itemsProcessed;
        
        await supabase
          .from("SourceSite")
          .update({
            lastProcessedIndex: newLastProcessedIndex,
          })
          .eq("id", sourceSiteId);
        
        console.log(`에러 발생 전까지 ${itemsProcessed}개 처리 완료. lastProcessedIndex를 ${newLastProcessedIndex}로 업데이트했습니다.`);
      } catch (updateError) {
        console.error("Failed to update lastProcessedIndex:", updateError);
      }
    }

    // CrawlLog가 생성되었다면 실패 상태로 업데이트
    if (crawlLogId) {
      try {
        const supabase = getSupabaseAdmin();
        await supabase
          .from("CrawlLog")
          .update({
            status: "FAILED",
            completedAt: new Date().toISOString(),
            itemsProcessed,
            itemsCreated,
            itemsUpdated,
            itemsFailed,
            message: error.message || "동기화 중 오류가 발생했습니다.",
          })
          .eq("id", crawlLogId);
      } catch (logUpdateError) {
        console.error("Failed to update CrawlLog:", logUpdateError);
      }
    }

    return NextResponse.json(
      {
        error: error.message || "동기화 중 오류가 발생했습니다.",
        itemsProcessed,
        itemsCreated,
        itemsUpdated,
        itemsFailed,
        message: itemsProcessed > 0
          ? `에러 발생 전까지 ${itemsProcessed}개 처리 완료. 다음 실행 시 이어서 진행됩니다.`
          : undefined,
      },
      { status: 500 }
    );
  }
}

