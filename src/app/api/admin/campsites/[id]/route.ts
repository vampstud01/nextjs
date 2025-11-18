import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 특정 캠핑장 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: campsite, error } = await supabase
      .from("Campsite")
      .select(
        `
        *,
        dogPolicy:DogPolicy(*)
      `
      )
      .eq("id", params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!campsite) {
      return NextResponse.json(
        { error: "캠핑장을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(campsite);
  } catch (error) {
    console.error("Admin GET campsite error", error);
    return NextResponse.json(
      { error: "캠핑장 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 캠핑장 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // 1. 캠핑장 정보 수정
    const { error: campsiteError } = await supabase
      .from("Campsite")
      .update({
        name: body.name,
        address: body.address,
        phone: body.phone || null,
        mainImageUrl: body.mainImageUrl || null,
        externalUrl: body.externalUrl || null,
        intro: body.intro || null,
      })
      .eq("id", params.id);

    if (campsiteError) {
      throw campsiteError;
    }

    // 2. 기존 DogPolicy 확인
    const { data: existingPolicy } = await supabase
      .from("DogPolicy")
      .select("*")
      .eq("campsiteId", params.id)
      .single();

    if (body.dogAllowed) {
      // 반려견 가능: DogPolicy 업데이트 또는 생성
      const policyData = {
        allowed: body.dogAllowed,
        sizeCategory: body.dogSizeCategory || null,
        maxDogs: body.dogMaxCount || null,
        extraFee: body.dogExtraFee || null,
        note: body.dogNote || null,
      };

      if (existingPolicy) {
        // 업데이트
        const { error: updateError } = await supabase
          .from("DogPolicy")
          .update(policyData)
          .eq("campsiteId", params.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // 생성
        const { error: insertError } = await supabase.from("DogPolicy").insert({
          campsiteId: params.id,
          ...policyData,
        });

        if (insertError) {
          throw insertError;
        }
      }
    } else {
      // 반려견 불가: 기존 DogPolicy 삭제
      if (existingPolicy) {
        const { error: deleteError } = await supabase
          .from("DogPolicy")
          .delete()
          .eq("campsiteId", params.id);

        if (deleteError) {
          throw deleteError;
        }
      }
    }

    // 3. 업데이트된 캠핑장 조회
    const { data: updatedCampsite, error: fetchError } = await supabase
      .from("Campsite")
      .select(
        `
        *,
        dogPolicy:DogPolicy(*)
      `
      )
      .eq("id", params.id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    return NextResponse.json(updatedCampsite);
  } catch (error) {
    console.error("Admin PUT campsite error", error);
    return NextResponse.json(
      { error: "캠핑장 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 캠핑장 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. DogPolicy 먼저 삭제 (외래키 제약 조건 때문에)
    const { error: policyError } = await supabase
      .from("DogPolicy")
      .delete()
      .eq("campsiteId", params.id);

    if (policyError && policyError.code !== "PGRST116") {
      // PGRST116: No rows found (정책이 없는 경우)
      throw policyError;
    }

    // 2. CampsiteFacility 삭제
    const { error: facilityError } = await supabase
      .from("CampsiteFacility")
      .delete()
      .eq("campsiteId", params.id);

    if (facilityError && facilityError.code !== "PGRST116") {
      throw facilityError;
    }

    // 3. Campsite 삭제
    const { error: campsiteError } = await supabase
      .from("Campsite")
      .delete()
      .eq("id", params.id);

    if (campsiteError) {
      throw campsiteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin DELETE campsite error", error);
    return NextResponse.json(
      { error: "캠핑장 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

