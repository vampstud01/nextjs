import { Button } from "@/components/ui/button";
import { Tent } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CampsiteList from "@/components/CampsiteList";

// 실제 DB에서 캠핑장 데이터 가져오기
async function getCampsites() {
  try {
    const campsites = await prisma.campsite.findMany({
      include: {
        dogPolicy: true,
        facilities: {
          include: {
            facility: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      take: 100, // 최대 100개
    });

    return campsites.map((campsite) => ({
      id: campsite.id,
      name: campsite.name,
      region: campsite.address?.split(" ").slice(0, 2).join(" ") || "",
      address: campsite.address || "",
      phone: campsite.phone || "",
      mainImageUrl: campsite.mainImageUrl || "",
      externalUrl: campsite.externalUrl || "",
      dogPolicy: {
        allowed: campsite.dogPolicy?.allowed || false,
        sizeCategory: campsite.dogPolicy?.sizeCategory || null,
        note: campsite.dogPolicy?.note || "",
      },
      facilities: campsite.facilities.map((cf) => cf.facility.name),
    }));
  } catch (error) {
    console.error("Failed to fetch campsites:", error);
    return [];
  }
}

export default async function SearchPage() {
  const campsites = await getCampsites();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-amber-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Tent className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-slate-900">DogCamp</h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/search">
                <Button variant="ghost">캠핑장 찾기</Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline">관리자</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-slate-900">
            캠핑장 검색
          </h2>
          <p className="text-slate-600">
            총 <span className="font-semibold text-green-600">{campsites.length}개</span>의 캠핑장
          </p>
        </div>

        <CampsiteList campsites={campsites} />
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Tent className="h-6 w-6 text-green-600" />
              <span className="font-semibold text-slate-900">DogCamp</span>
            </div>
            <p className="text-sm text-slate-600">
              © 2025 DogCamp. 반려견과 함께하는 캠핑 여행
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

