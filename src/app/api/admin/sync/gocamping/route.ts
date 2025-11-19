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

// 배치 처리 함수
async function processBatch(
  supabase: any,
  items: GoCampingItem[],
  startIndex: number
): Promise<{
  processed: number;
  created: number;
  updated: number;
  failed: number;
}> {
  let processed = 0;
  let created = 0;
  let updated = 0;
  let failed = 0;

    for (const item of items) {
      try {
      processed++;

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

        updated++;
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

        created++;
        }
      } catch (itemError) {
        console.error(`Failed to process item ${item.contentId}:`, itemError);
      failed++;
    }
  }

  return { processed, created, updated, failed };
      }

export async function POST() {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "GOCAMPING_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const startTime = new Date();
  let totalItemsProcessed = 0;
  let totalItemsCreated = 0;
  let totalItemsUpdated = 0;
  let totalItemsFailed = 0;
  let sourceSiteId: string | undefined;
  let crawlLogId: string | undefined;
  let startIndex = 0;
  const batchSize = 100;
  const defaultDailyLimit = parseInt(
    process.env.DAILY_API_CALL_LIMIT || "1000",
    10
  );

  try {
    const supabase = getSupabaseAdmin();

    // 1. SourceSite 조회 또는 생성
    const { data: existingSourceSite, error: findError } = await supabase
      .from("SourceSite")
      .select(
        "id, lastProcessedIndex, dailyApiCallLimit, dailyApiCallCount, lastApiCallDate"
      )
      .eq("name", "고캠핑(공공데이터포털)")
      .single();

    const today = new Date().toISOString().split("T")[0];

    if (findError || !existingSourceSite) {
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
          dailyApiCallLimit: defaultDailyLimit,
          dailyApiCallCount: 0,
          lastApiCallDate: today,
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

      // 날짜가 바뀌었으면 카운터 리셋
      const lastDate = existingSourceSite.lastApiCallDate
        ? new Date(existingSourceSite.lastApiCallDate)
            .toISOString()
            .split("T")[0]
        : null;

      if (lastDate !== today) {
        console.log(
          `날짜가 바뀌었습니다. API 호출 카운터를 리셋합니다. (${lastDate} → ${today})`
        );
        await supabase
          .from("SourceSite")
          .update({
            dailyApiCallCount: 0,
            lastApiCallDate: today,
          })
          .eq("id", sourceSiteId);
      }
    }

    // 현재 API 호출 제한 정보 가져오기
    const { data: currentSourceSite } = await supabase
      .from("SourceSite")
      .select("dailyApiCallLimit, dailyApiCallCount")
      .eq("id", sourceSiteId)
      .single();

    const dailyLimit = currentSourceSite?.dailyApiCallLimit || defaultDailyLimit;
    let currentApiCallCount = currentSourceSite?.dailyApiCallCount || 0;

    console.log(
      `동기화 시작: ${startIndex}번째 항목부터 처리합니다. (오늘 API 호출: ${currentApiCallCount}/${dailyLimit})`
    );

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

    // 3. 전체 개수 확인 (API 호출 1회)
    const firstPageUrl = `${API_URL}?serviceKey=${API_KEY}&numOfRows=100&pageNo=1&MobileOS=ETC&MobileApp=DogCamp&_type=json`;
    const firstPageResponse = await fetch(firstPageUrl);
    const firstPageData = await firstPageResponse.json();
    currentApiCallCount++;

    const totalCount =
      firstPageData?.response?.body?.totalCount ||
      firstPageData?.response?.body?.items?.item?.length ||
      0;

    if (totalCount === 0) {
      throw new Error("API 응답에 데이터가 없습니다.");
    }

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

    // 4. 여러 배치를 자동으로 처리하는 루프
    const numOfRows = 100;
    let currentIndex = startIndex;
    let batchNumber = 0;

    while (currentIndex < totalCount) {
      // API 호출 제한 확인
      if (currentApiCallCount >= dailyLimit) {
        console.log(
          `하루 API 호출 제한에 도달했습니다. (${currentApiCallCount}/${dailyLimit})`
        );
        break;
      }

      batchNumber++;
      const batchStartIndex = currentIndex;
      const batchEndIndex = Math.min(currentIndex + batchSize, totalCount);

      console.log(
        `\n[배치 ${batchNumber}] ${batchStartIndex}번째 ~ ${batchEndIndex - 1}번째 항목 처리 시작...`
      );

      // 필요한 페이지 범위 계산
      const startPage = Math.floor(batchStartIndex / numOfRows) + 1;
      const endPage = Math.ceil(batchEndIndex / numOfRows);
      const startOffset = batchStartIndex % numOfRows;

      // 필요한 페이지들 가져오기
      const allItems: GoCampingItem[] = [];
      for (let pageNo = startPage; pageNo <= endPage; pageNo++) {
        if (currentApiCallCount >= dailyLimit) {
          console.log(`API 호출 제한 도달. 중단합니다.`);
          break;
        }

        const pageUrl = `${API_URL}?serviceKey=${API_KEY}&numOfRows=${numOfRows}&pageNo=${pageNo}&MobileOS=ETC&MobileApp=DogCamp&_type=json`;
        const pageResponse = await fetch(pageUrl);
        const pageData = await pageResponse.json();
        currentApiCallCount++;

        const pageItems = pageData?.response?.body?.items?.item || [];
        if (Array.isArray(pageItems)) {
          allItems.push(...pageItems);
        }

        // API 호출 제한을 고려한 대기
        if (pageNo < endPage) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // 시작 인덱스부터 필요한 만큼만 슬라이스
      const items = allItems.slice(
        startOffset,
        startOffset + (batchEndIndex - batchStartIndex)
      );

      if (items.length === 0) {
        console.log("처리할 데이터가 없습니다.");
        break;
      }

      // 배치 처리
      const batchResult = await processBatch(supabase, items, batchStartIndex);

      totalItemsProcessed += batchResult.processed;
      totalItemsCreated += batchResult.created;
      totalItemsUpdated += batchResult.updated;
      totalItemsFailed += batchResult.failed;

      currentIndex = batchEndIndex;

      // SourceSite의 lastProcessedIndex 업데이트
      await supabase
        .from("SourceSite")
        .update({
          lastProcessedIndex: currentIndex,
          dailyApiCallCount: currentApiCallCount,
          lastApiCallDate: today,
        })
        .eq("id", sourceSiteId);

      console.log(
        `[배치 ${batchNumber}] 완료: 처리 ${batchResult.processed}개, 생성 ${batchResult.created}개, 업데이트 ${batchResult.updated}개, 실패 ${batchResult.failed}개`
      );
      console.log(
        `진행 상황: ${currentIndex}/${totalCount} (${Math.round((currentIndex / totalCount) * 100)}%)`
      );
      console.log(`API 호출: ${currentApiCallCount}/${dailyLimit}`);

      // API 호출 제한에 도달했으면 중단
      if (currentApiCallCount >= dailyLimit) {
        console.log(`하루 API 호출 제한에 도달했습니다.`);
        break;
      }

      // 배치 간 짧은 대기
      if (currentIndex < totalCount) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // 5. 최종 상태 업데이트
    const isComplete = currentIndex >= totalCount;

    if (crawlLogId) {
      await supabase
        .from("CrawlLog")
        .update({
          status: isComplete ? "SUCCESS" : "SUCCESS",
          completedAt: new Date().toISOString(),
          itemsProcessed: totalItemsProcessed,
          itemsCreated: totalItemsCreated,
          itemsUpdated: totalItemsUpdated,
          itemsFailed: totalItemsFailed,
          message: isComplete
            ? `모든 데이터 동기화 완료 (${currentIndex}/${totalCount})`
            : `부분 동기화 완료 (${currentIndex}/${totalCount}, 다음 실행 시 ${currentIndex}번째부터 계속)`,
      })
        .eq("id", crawlLogId);
    }

    return NextResponse.json({
      success: true,
      itemsProcessed: totalItemsProcessed,
      itemsCreated: totalItemsCreated,
      itemsUpdated: totalItemsUpdated,
      itemsFailed: totalItemsFailed,
      lastProcessedIndex: currentIndex,
      totalCount,
      isComplete,
      apiCallsUsed: currentApiCallCount,
      apiCallsRemaining: dailyLimit - currentApiCallCount,
      message: isComplete
        ? "모든 데이터 동기화가 완료되었습니다."
        : `부분 동기화 완료. ${currentApiCallCount}/${dailyLimit} API 호출 사용. 다음 실행 시 ${currentIndex}번째 항목부터 계속됩니다.`,
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
    if (sourceSiteId && totalItemsProcessed > 0) {
      try {
        const supabase = getSupabaseAdmin();
        const newLastProcessedIndex = startIndex + totalItemsProcessed;

        await supabase
          .from("SourceSite")
          .update({
            lastProcessedIndex: newLastProcessedIndex,
          })
          .eq("id", sourceSiteId);

        console.log(
          `에러 발생 전까지 ${totalItemsProcessed}개 처리 완료. lastProcessedIndex를 ${newLastProcessedIndex}로 업데이트했습니다.`
        );
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
            itemsProcessed: totalItemsProcessed,
            itemsCreated: totalItemsCreated,
            itemsUpdated: totalItemsUpdated,
            itemsFailed: totalItemsFailed,
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
        itemsProcessed: totalItemsProcessed,
        itemsCreated: totalItemsCreated,
        itemsUpdated: totalItemsUpdated,
        itemsFailed: totalItemsFailed,
        message:
          totalItemsProcessed > 0
            ? `에러 발생 전까지 ${totalItemsProcessed}개 처리 완료. 다음 실행 시 이어서 진행됩니다.`
            : undefined,
      },
      { status: 500 }
    );
  }
}
