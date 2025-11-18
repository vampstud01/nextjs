import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type DogSize = "SMALL" | "MEDIUM" | "LARGE";

// 검색 API
// GET /api/search?region=...&date_from=...&date_to=...&dog_size=SMALL&dog_count=1
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const region = searchParams.get("region") ?? undefined;
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");
  const dogSize = searchParams.get("dog_size") as DogSize | null;
  const dogCount = searchParams.get("dog_count");

  const dateFromObj = dateFrom ? new Date(dateFrom) : undefined;
  const dateToObj = dateTo ? new Date(dateTo) : undefined;
  const dogCountNum = dogCount ? Number(dogCount) : undefined;

  try {
    // Supabase 쿼리 빌더
    let query = supabase
      .from('Campsite')
      .select(`
        *,
        dogPolicy:DogPolicy(*),
        availabilities:Availability(*)
      `)
      .limit(50);

    // 지역 필터
    if (region) {
      query = query.ilike('region', `%${region}%`);
    }

    const { data: campsites, error } = await query;

    if (error) {
      throw error;
    }

    // 클라이언트 사이드 필터링 (Supabase의 제한 사항 때문)
    let filteredCampsites = campsites || [];

    // 반려견 정책 필터
    if (dogSize || dogCountNum) {
      filteredCampsites = filteredCampsites.filter(campsite => {
        const policy = campsite.dogPolicy;
        if (!policy) return false;

        if (dogSize && policy.sizeCategory !== dogSize) return false;
        if (dogCountNum && policy.maxDogs && policy.maxDogs < dogCountNum) return false;

        return true;
      });
    }

    // 날짜별 가용성 필터
    if (dateFromObj && dateToObj) {
      filteredCampsites = filteredCampsites.filter(campsite => {
        const availabilities = campsite.availabilities || [];
        return availabilities.some((avail: any) => {
          const availDate = new Date(avail.date);
          return availDate >= dateFromObj && 
                 availDate <= dateToObj && 
                 avail.isAvailable;
        });
      });

      // 날짜 범위 내의 가용성만 포함
      filteredCampsites = filteredCampsites.map(campsite => ({
        ...campsite,
        availabilities: campsite.availabilities?.filter((avail: any) => {
          const availDate = new Date(avail.date);
          return availDate >= dateFromObj && availDate <= dateToObj;
        }).sort((a: any, b: any) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      }));
    }

    return NextResponse.json({ items: filteredCampsites });
  } catch (error) {
    console.error("Search API error", error);
    return NextResponse.json(
      { error: "검색 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}


