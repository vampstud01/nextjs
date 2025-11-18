import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DogSize } from "@prisma/client";

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
    const campsites = await prisma.campsite.findMany({
      where: {
        ...(region && { region: { contains: region } }),
        dogPolicy: {
          ...(dogSize && { sizeCategory: dogSize }),
          ...(dogCountNum && { maxDogs: { gte: dogCountNum } }),
        },
        ...(dateFromObj &&
          dateToObj && {
            availabilities: {
              some: {
                date: {
                  gte: dateFromObj,
                  lte: dateToObj,
                },
                isAvailable: true,
              },
            },
          }),
      },
      include: {
        dogPolicy: true,
        availabilities: dateFromObj && dateToObj
          ? {
              where: {
                date: {
                  gte: dateFromObj,
                  lte: dateToObj,
                },
              },
              orderBy: { date: "asc" },
            }
          : false,
      },
      take: 50,
    });

    return NextResponse.json({ items: campsites });
  } catch (error) {
    console.error("Search API error", error);
    return NextResponse.json(
      { error: "검색 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}


