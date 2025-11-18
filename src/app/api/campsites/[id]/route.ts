import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const campsite = await prisma.campsite.findUnique({
      where: { id },
      include: {
        dogPolicy: true,
        availabilities: {
          orderBy: { date: "asc" },
          take: 90,
        },
        facilities: {
          include: {
            facilityTag: true,
          },
        },
        sourceSite: true,
      },
    });

    if (!campsite) {
      return NextResponse.json(
        { error: "캠핑장을 찾을 수 없습니다." },
        { status: 404 },
      );
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


