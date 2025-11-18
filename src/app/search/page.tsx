import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MapPin, Dog, Phone, ExternalLink, Tent, Filter } from "lucide-react";
import Link from "next/link";

// 실제 데이터베이스에서 가져올 데이터 (현재는 하드코딩)
const campsites = [
  {
    id: "gocamping-100704",
    name: "옥당걸숲속관광농원",
    region: "경상북도 김천시",
    address: "경북 김천시 부항면 안간1길 700",
    phone: "054-434-7773",
    mainImageUrl: "https://gocamping.or.kr/upload/camp/100704/thumb/thumb_720_3455yavJjzbNkRM0fR7yOVtb.jpg",
    externalUrl: "http://옥당걸.kr",
    dogPolicy: {
      allowed: true,
      sizeCategory: "SMALL",
      note: "가능(소형견)",
    },
    facilities: ["전기", "무선인터넷", "장작판매", "온수", "트렘폴린", "물놀이장", "놀이터", "산책로", "운동시설", "마트.편의점", "식당"],
  },
  {
    id: "gocamping-102000",
    name: "노아오토캠핑장",
    region: "충청남도 금산군",
    address: "충남 금산군 제원면 금강로 626",
    phone: "041-450-8289",
    dogPolicy: {
      allowed: true,
      sizeCategory: null,
      note: "가능",
    },
    facilities: ["전기", "무선인터넷", "장작판매", "온수", "마트.편의점"],
  },
  {
    id: "gocamping-101464",
    name: "어게인 스쿨",
    region: "강원도 횡성군",
    address: "강원특별자치도 횡성군 강림면 주천강로 488",
    phone: "070-4159-0070",
    dogPolicy: {
      allowed: true,
      sizeCategory: "SMALL",
      note: "가능(소형견)",
    },
    facilities: [],
  },
  {
    id: "gocamping-7561",
    name: "와우파크",
    region: "강원도 강릉시",
    address: "강원 강릉시 사천면 공회당길 7-13",
    phone: "033-651-0202",
    mainImageUrl: "https://gocamping.or.kr/upload/camp/7561/thumb/thumb_720_8787Mp6FrOMIdBwHnCc2QIk5.jpg",
    externalUrl: "http://wawoopark.co.kr/",
    dogPolicy: {
      allowed: true,
      sizeCategory: null,
      note: "가능",
    },
    facilities: [],
  },
  {
    id: "gocamping-100298",
    name: "캠핑808",
    region: "충청북도 충주시",
    address: "충북 충주시 동량면 미라실로 689-1",
    phone: "010-4474-8089",
    mainImageUrl: "https://gocamping.or.kr/upload/camp/100298/thumb/thumb_720_200701XcWJ7LMwvso2JHho5s.jpg",
    externalUrl: "https://camping808.com",
    dogPolicy: {
      allowed: true,
      sizeCategory: "SMALL",
      note: "가능(소형견)",
    },
    facilities: [],
  },
  {
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
    },
    facilities: [],
  },
];

function getDogSizeBadge(sizeCategory: string | null) {
  if (!sizeCategory) return <Badge variant="secondary">전체</Badge>;
  if (sizeCategory === "SMALL") return <Badge className="bg-green-100 text-green-700">소형견</Badge>;
  if (sizeCategory === "MEDIUM") return <Badge className="bg-blue-100 text-blue-700">중형견</Badge>;
  if (sizeCategory === "LARGE") return <Badge className="bg-purple-100 text-purple-700">대형견</Badge>;
  return <Badge variant="secondary">{sizeCategory}</Badge>;
}

export default function SearchPage() {
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
            반려견 동반 가능 캠핑장
          </h2>
          <p className="text-slate-600">
            총 <span className="font-semibold text-green-600">{campsites.length}개</span>의 캠핑장을 찾았습니다
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  필터
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    지역
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="전국" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전국</SelectItem>
                      <SelectItem value="gyeonggi">경기도</SelectItem>
                      <SelectItem value="gangwon">강원도</SelectItem>
                      <SelectItem value="chungbuk">충청북도</SelectItem>
                      <SelectItem value="chungnam">충청남도</SelectItem>
                      <SelectItem value="gyeongbuk">경상북도</SelectItem>
                      <SelectItem value="gyeongnam">경상남도</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    반려견 크기
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="small">소형견 (~10kg)</SelectItem>
                      <SelectItem value="medium">중형견 (10~25kg)</SelectItem>
                      <SelectItem value="large">대형견 (25kg~)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    정렬
                  </label>
                  <Select defaultValue="name">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">이름순</SelectItem>
                      <SelectItem value="region">지역순</SelectItem>
                      <SelectItem value="recent">최신순</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700">
                  필터 적용
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Campsite List */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {campsites.map((campsite) => (
                <Card key={campsite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="grid md:grid-cols-3">
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-green-100 to-blue-100 md:h-auto">
                      {campsite.mainImageUrl ? (
                        <img
                          src={campsite.mainImageUrl}
                          alt={campsite.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Tent className="h-16 w-16 text-green-300" />
                        </div>
                      )}
                      <div className="absolute right-2 top-2">
                        {campsite.dogPolicy.allowed && (
                          <Badge className="bg-green-600">
                            <Dog className="mr-1 h-3 w-3" />
                            반려견 가능
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-2">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">
                              {campsite.name}
                            </CardTitle>
                            <CardDescription className="mt-1 flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {campsite.region}
                            </CardDescription>
                          </div>
                          {getDogSizeBadge(campsite.dogPolicy.sizeCategory)}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Address & Phone */}
                        <div className="space-y-2 text-sm text-slate-600">
                          <p>{campsite.address}</p>
                          {campsite.phone && (
                            <p className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {campsite.phone}
                            </p>
                          )}
                        </div>

                        {/* Dog Policy */}
                        <div>
                          <p className="mb-1 text-sm font-medium text-slate-700">
                            반려견 정책
                          </p>
                          <p className="text-sm text-slate-600">
                            {campsite.dogPolicy.note}
                          </p>
                        </div>

                        {/* Facilities */}
                        {campsite.facilities.length > 0 && (
                          <div>
                            <p className="mb-2 text-sm font-medium text-slate-700">
                              편의시설
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {campsite.facilities.slice(0, 5).map((facility) => (
                                <Badge key={facility} variant="outline" className="text-xs">
                                  {facility}
                                </Badge>
                              ))}
                              {campsite.facilities.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{campsite.facilities.length - 5}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Link href={`/campsites/${campsite.id}`} className="flex-1">
                            <Button variant="outline" className="w-full">
                              상세보기
                            </Button>
                          </Link>
                          {campsite.externalUrl && (
                            <Button
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              asChild
                            >
                              <a
                                href={campsite.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                예약하기
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <div className="flex gap-2">
                <Button variant="outline" disabled>
                  이전
                </Button>
                <Button className="bg-green-600">1</Button>
                <Button variant="outline" disabled>
                  다음
                </Button>
              </div>
            </div>
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

