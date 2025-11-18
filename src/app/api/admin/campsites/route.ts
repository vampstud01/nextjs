import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 간단한 관리자용 캠핑장 목록/생성 API
// 실제 운영 시에는 인증/권한 체크(middleware)를 반드시 추가해야 합니다.

export async function GET() {
  const campsites = await prisma.campsite.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      dogPolicy: true,
    },
  });

  return NextResponse.json({ items: campsites });
}

export async function POST(request: Request) {
  // TODO: 인증/권한 체크 로직 추가 (예: NextAuth, JWT, 혹은 간단한 헤더 기반 토큰)

  const body = await request.json();
  const {
    name,
    address,
    region,
    phone,
    mainImageUrl,
    externalUrl,
    dogPolicy,
  } = body;

  try {
    const campsite = await prisma.campsite.create({
      data: {
        name,
        address,
        region,
        phone,
        mainImageUrl,
        externalUrl,
        dogPolicy: dogPolicy
          ? {
              create: {
                ...dogPolicy,
              },
            }
          : undefined,
      },
      include: {
        dogPolicy: true,
      },
    });

    return NextResponse.json(campsite, { status: 201 });
  } catch (error) {
    console.error("Admin create campsite error", error);
    return NextResponse.json(
      { error: "캠핑장 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}


