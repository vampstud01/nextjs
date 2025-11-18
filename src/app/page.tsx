import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Dog, Tent, Heart } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-amber-50">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 to-blue-600 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAzLTRzMyAyIDMgNGMwIDItMiA0LTMgNHMtMy0yLTMtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
            <Dog className="h-5 w-5" />
            <span className="text-sm font-medium">반려견과 함께하는 특별한 여행</span>
          </div>
          <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            반려견 동반 가능 캠핑장을
            <br />
            한눈에 찾아보세요
          </h2>
          <p className="mb-8 text-lg text-green-50 sm:text-xl">
            전국 3,500개 이상의 캠핑장 정보와 반려견 정책을 확인하고
            <br />
            완벽한 캠핑 장소를 찾아보세요
          </p>

          {/* Search Box */}
          <Card className="mx-auto max-w-3xl shadow-2xl">
            <CardContent className="p-6">
              <div className="grid gap-4 sm:grid-cols-3">
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
                      <SelectItem value="jeonbuk">전북특별자치도</SelectItem>
                      <SelectItem value="jeonnam">전라남도</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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

                <div className="flex items-end">
                  <Link href="/search" className="w-full">
                    <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                      <Search className="mr-2 h-4 w-4" />
                      캠핑장 찾기
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-2 text-4xl font-bold text-green-600">10+</div>
              <p className="text-sm text-slate-600">등록된 캠핑장</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-2 text-4xl font-bold text-blue-600">6</div>
              <p className="text-sm text-slate-600">반려견 동반 가능</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-2 text-4xl font-bold text-amber-600">11</div>
              <p className="text-sm text-slate-600">편의시설 종류</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-2 text-4xl font-bold text-purple-600">3.5K</div>
              <p className="text-sm text-slate-600">고캠핑 연동 데이터</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h3 className="mb-4 text-3xl font-bold text-slate-900">
              DogCamp의 특별한 기능
            </h3>
            <p className="text-lg text-slate-600">
              반려견과 함께하는 캠핑을 더 쉽고 즐겁게
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-2 border-green-100">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Dog className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>반려견 정책 상세 정보</CardTitle>
                <CardDescription>
                  허용 크기, 마리 수, 추가 요금 등 상세한 반려견 정책을 한눈에 확인하세요
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-blue-100">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>지역별 검색</CardTitle>
                <CardDescription>
                  원하는 지역의 캠핑장을 빠르게 찾고 위치 정보를 확인하세요
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-amber-100">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                  <Heart className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle>편의시설 정보</CardTitle>
                <CardDescription>
                  전기, 온수, 샤워장 등 필요한 편의시설을 미리 체크하세요
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h3 className="mb-4 text-3xl font-bold">
            지금 바로 완벽한 캠핑장을 찾아보세요
          </h3>
          <p className="mb-8 text-lg text-green-50">
            반려견과 함께 떠나는 특별한 캠핑 여행이 기다립니다
          </p>
          <Link href="/search">
            <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
              <Search className="mr-2 h-5 w-5" />
              캠핑장 둘러보기
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
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
