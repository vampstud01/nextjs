import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Dog,
  Phone,
  ExternalLink,
  Tent,
  Check,
  X,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

// Mock data - 나중에 실제 DB에서 가져올 것
function getCampsiteData(id: string) {
  const data: any = {
    "gocamping-100704": {
      id: "gocamping-100704",
      name: "옥당걸숲속관광농원",
      region: "경상북도 김천시",
      address: "경북 김천시 부항면 안간1길 700",
      phone: "054-434-7773",
      mainImageUrl:
        "https://gocamping.or.kr/upload/camp/100704/thumb/thumb_720_3455yavJjzbNkRM0fR7yOVtb.jpg",
      externalUrl: "http://옥당걸.kr",
      dogPolicy: {
        allowed: true,
        sizeCategory: "SMALL",
        note: "가능(소형견)",
        maxCount: 1,
        extraFee: 0,
      },
      facilities: [
        "전기",
        "무선인터넷",
        "장작판매",
        "온수",
        "트렘폴린",
        "물놀이장",
        "놀이터",
        "산책로",
        "운동시설",
        "마트.편의점",
        "식당",
      ],
      description:
        "자연 속에서 힐링할 수 있는 아늑한 캠핑장입니다. 소형견과 함께 즐거운 시간을 보낼 수 있습니다.",
      operationPeriod: "연중무휴",
      checkIn: "14:00",
      checkOut: "11:00",
      capacity: 50,
    },
    "test-campsite-1": {
      id: "test-campsite-1",
      name: "반려견 천국 캠핑장",
      region: "경기도 가평군",
      address: "경기도 가평군 북면 백둔로 123",
      phone: "031-123-4567",
      mainImageUrl: "https://example.com/image.jpg",
      externalUrl: "https://example.com/camping",
      dogPolicy: {
        allowed: true,
        sizeCategory: "MEDIUM",
        note: "소형견, 중형견 가능. 대형견은 사전 문의 필요.",
        maxCount: 2,
        extraFee: 10000,
      },
      facilities: ["전기", "온수", "샤워실", "화장실", "마트.편의점"],
      description:
        "반려견 전용 운동장과 산책로가 마련된 최고의 펫프렌들리 캠핑장입니다.",
      operationPeriod: "3월~11월",
      checkIn: "15:00",
      checkOut: "12:00",
      capacity: 30,
    },
  };

  return (
    data[id] || {
      id,
      name: "캠핑장을 찾을 수 없습니다",
      region: "-",
      address: "-",
      dogPolicy: { allowed: false },
      facilities: [],
    }
  );
}

function getDogSizeBadge(sizeCategory: string | null) {
  if (!sizeCategory) return <Badge variant="secondary">전체</Badge>;
  if (sizeCategory === "SMALL")
    return <Badge className="bg-green-100 text-green-700">소형견 (~10kg)</Badge>;
  if (sizeCategory === "MEDIUM")
    return <Badge className="bg-blue-100 text-blue-700">중형견 (10~25kg)</Badge>;
  if (sizeCategory === "LARGE")
    return (
      <Badge className="bg-purple-100 text-purple-700">대형견 (25kg~)</Badge>
    );
  return <Badge variant="secondary">{sizeCategory}</Badge>;
}

export default function CampsiteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const campsite = getCampsiteData(params.id);

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
        {/* Back Button */}
        <Link href="/search">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <Card className="overflow-hidden">
              <div className="relative h-96 bg-gradient-to-br from-green-100 to-blue-100">
                {campsite.mainImageUrl ? (
                  <img
                    src={campsite.mainImageUrl}
                    alt={campsite.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Tent className="h-32 w-32 text-green-300" />
                  </div>
                )}
                <div className="absolute right-4 top-4 flex gap-2">
                  {campsite.dogPolicy.allowed && (
                    <Badge className="bg-green-600 text-white">
                      <Dog className="mr-1 h-4 w-4" />
                      반려견 가능
                    </Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl">{campsite.name}</CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-1 text-base">
                      <MapPin className="h-5 w-5" />
                      {campsite.region}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-slate-600">{campsite.address}</p>
                  {campsite.phone && (
                    <p className="mt-2 flex items-center gap-2 text-slate-600">
                      <Phone className="h-4 w-4" />
                      {campsite.phone}
                    </p>
                  )}
                </div>

                {campsite.description && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="mb-2 font-semibold text-slate-900">
                        캠핑장 소개
                      </h3>
                      <p className="text-slate-600">{campsite.description}</p>
                    </div>
                  </>
                )}

                {campsite.operationPeriod && (
                  <>
                    <Separator />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-slate-500">운영 기간</p>
                        <p className="mt-1 font-medium text-slate-900">
                          {campsite.operationPeriod}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">수용 인원</p>
                        <p className="mt-1 font-medium text-slate-900">
                          {campsite.capacity}명
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">입실 시간</p>
                        <p className="mt-1 font-medium text-slate-900">
                          {campsite.checkIn}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">퇴실 시간</p>
                        <p className="mt-1 font-medium text-slate-900">
                          {campsite.checkOut}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Dog Policy */}
            <Card className="border-2 border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dog className="h-6 w-6 text-green-600" />
                  반려견 동반 정책
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {campsite.dogPolicy.allowed ? (
                    <>
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">
                        반려견 동반 가능
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-900">
                        반려견 동반 불가
                      </span>
                    </>
                  )}
                </div>

                {campsite.dogPolicy.allowed && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-600">허용 크기</p>
                        <div className="mt-1">
                          {getDogSizeBadge(campsite.dogPolicy.sizeCategory)}
                        </div>
                      </div>

                      {campsite.dogPolicy.maxCount && (
                        <div>
                          <p className="text-sm text-slate-600">
                            최대 동반 가능 마리 수
                          </p>
                          <p className="mt-1 font-medium text-slate-900">
                            {campsite.dogPolicy.maxCount}마리
                          </p>
                        </div>
                      )}

                      {campsite.dogPolicy.extraFee !== undefined && (
                        <div>
                          <p className="text-sm text-slate-600">추가 요금</p>
                          <p className="mt-1 font-medium text-slate-900">
                            {campsite.dogPolicy.extraFee === 0
                              ? "없음"
                              : `${campsite.dogPolicy.extraFee.toLocaleString()}원`}
                          </p>
                        </div>
                      )}

                      {campsite.dogPolicy.note && (
                        <div>
                          <p className="text-sm text-slate-600">참고사항</p>
                          <p className="mt-1 text-slate-900">
                            {campsite.dogPolicy.note}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Facilities */}
            {campsite.facilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>편의시설</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {campsite.facilities.map((facility: string) => (
                      <div
                        key={facility}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3"
                      >
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-slate-700">
                          {facility}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>예약 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm text-blue-900">
                    예약 가능 여부와 요금은 공식 사이트에서 확인해주세요
                  </p>
                </div>

                {campsite.externalUrl && (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                    asChild
                  >
                    <a
                      href={campsite.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-5 w-5" />
                      공식 사이트에서 예약하기
                    </a>
                  </Button>
                )}

                {campsite.phone && (
                  <Button variant="outline" size="lg" className="w-full" asChild>
                    <a href={`tel:${campsite.phone}`}>
                      <Phone className="mr-2 h-5 w-5" />
                      전화 문의
                    </a>
                  </Button>
                )}

                <Separator />

                <div className="space-y-3 text-sm">
                  <h4 className="font-semibold text-slate-900">
                    예약 시 확인사항
                  </h4>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>반려견 정책을 사전에 확인해주세요</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>입/퇴실 시간을 꼭 지켜주세요</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>캠핑장 내 규칙을 준수해주세요</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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

