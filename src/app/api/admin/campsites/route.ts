import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 간단한 관리자용 캠핑장 목록/생성 API
// 실제 운영 시에는 인증/권한 체크(middleware)를 반드시 추가해야 합니다.

export async function GET() {
  const { data: campsites, error } = await supabase
    .from('Campsite')
    .select(`
      *,
      dogPolicy:DogPolicy(*)
    `)
    .order('createdAt', { ascending: false })
    .limit(100);

  if (error) {
    console.error("Admin GET campsites error", error);
    return NextResponse.json(
      { error: "캠핑장 목록 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({ items: campsites || [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. 캠핑장 생성
    const { data: campsite, error: campsiteError } = await supabase
      .from("Campsite")
      .insert({
        name: body.name,
        address: body.address,
        phone: body.phone || null,
        mainImageUrl: body.mainImageUrl || null,
        externalUrl: body.externalUrl || null,
        intro: body.intro || null,
      })
      .select()
      .single();

    if (campsiteError || !campsite) {
      throw campsiteError;
    }

    // 2. DogPolicy 생성 (반려견 가능한 경우)
    if (body.dogAllowed) {
      const { error: policyError } = await supabase.from("DogPolicy").insert({
        campsiteId: campsite.id,
        allowed: body.dogAllowed,
        sizeCategory: body.dogSizeCategory || null,
        maxDogs: body.dogMaxCount || null,
        extraFee: body.dogExtraFee || null,
        note: body.dogNote || null,
      });

      if (policyError) {
        // 롤백: 캠핑장 삭제
        await supabase.from("Campsite").delete().eq("id", campsite.id);
        throw policyError;
      }
    }

    // 3. 생성된 캠핑장과 정책을 함께 조회
    const { data: fullCampsite, error: fetchError } = await supabase
      .from("Campsite")
      .select(
        `
        *,
        dogPolicy:DogPolicy(*)
      `
      )
      .eq("id", campsite.id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    return NextResponse.json(fullCampsite, { status: 201 });
  } catch (error) {
    console.error("Admin create campsite error", error);
    return NextResponse.json(
      { error: "캠핑장 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


