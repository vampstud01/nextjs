import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface Params {
  params: {
    id: string;
  };
}

// 캠핑장 상세 조회 API
// GET /api/campsites/:id
export async function GET(_request: Request, { params }: Params) {
  const { id } = params;

  try {
    const { data: campsite, error } = await supabase
      .from('Campsite')
      .select(`
        *,
        dogPolicy:DogPolicy(*),
        availabilities:Availability(*),
        facilities:CampsiteFacility(
          facilityTag:FacilityTag(*)
        ),
        sourceSite:SourceSite(*)
      `)
      .eq('id', id)
      .single();

    if (error || !campsite) {
      return NextResponse.json(
        { error: "캠핑장을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 가용성을 날짜 순으로 정렬하고 최대 90개로 제한
    if (campsite.availabilities) {
      campsite.availabilities = campsite.availabilities
        .sort((a: any, b: any) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        .slice(0, 90);
    }

    return NextResponse.json(campsite);
  } catch (error) {
    console.error("Campsite detail API error", error);
    return NextResponse.json(
      { error: "캠핑장 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}


