"use client";

import { useState, useMemo } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MapPin, Dog, Phone, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface DogPolicy {
  allowed: boolean;
  sizeCategory: string | null;
  note: string;
}

interface Campsite {
  id: string;
  name: string;
  region: string;
  address: string;
  phone: string;
  mainImageUrl: string;
  externalUrl: string;
  dogPolicy: DogPolicy;
  facilities: string[];
}

interface CampsiteListProps {
  campsites: Campsite[];
}

const ITEMS_PER_PAGE = 12; // 페이지당 아이템 수

function getDogSizeBadge(sizeCategory: string | null) {
  if (!sizeCategory) return <Badge variant="secondary">전체</Badge>;
  if (sizeCategory === "SMALL")
    return <Badge className="bg-green-100 text-green-700">소형견</Badge>;
  if (sizeCategory === "MEDIUM")
    return <Badge className="bg-blue-100 text-blue-700">중형견</Badge>;
  if (sizeCategory === "LARGE")
    return <Badge className="bg-purple-100 text-purple-700">대형견</Badge>;
  return <Badge variant="secondary">{sizeCategory}</Badge>;
}

export default function CampsiteList({ campsites }: CampsiteListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 초기값 가져오기
  const [selectedRegion, setSelectedRegion] = useState<string>(
    searchParams.get("region") || "all"
  );
  const [selectedDogSize, setSelectedDogSize] = useState<string>(
    searchParams.get("dogSize") || "all"
  );
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sort") || "name"
  );
  const [showOnlyDogFriendly, setShowOnlyDogFriendly] = useState<boolean>(
    searchParams.get("dogOnly") === "true"
  );
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.get("page") || "1")
  );

  // 지역 목록 추출
  const regions = useMemo(() => {
    const uniqueRegions = Array.from(
      new Set(campsites.map((c) => c.region).filter(Boolean))
    );
    return ["all", ...uniqueRegions.sort()];
  }, [campsites]);

  // 필터링 및 정렬된 캠핑장 목록
  const filteredCampsites = useMemo(() => {
    let filtered = [...campsites];

    // 반려견 전용 필터
    if (showOnlyDogFriendly) {
      const beforeCount = filtered.length;
      filtered = filtered.filter((c) => {
        // dogPolicy가 존재하고 allowed가 정확히 true인 경우만 통과
        if (!c.dogPolicy) {
          return false;
        }
        // allowed가 boolean이고 true인지 확인
        const isAllowed = typeof c.dogPolicy.allowed === 'boolean' && c.dogPolicy.allowed === true;
        if (!isAllowed) {
          console.log(`[Filter] Rejected: ${c.name}, allowed: ${c.dogPolicy.allowed}, type: ${typeof c.dogPolicy.allowed}, dogPolicy:`, c.dogPolicy);
        }
        return isAllowed;
      });
      console.log(`[Filter] Before: ${beforeCount}, After: ${filtered.length}, Dog-friendly filter: ${showOnlyDogFriendly}`);
      
      // 필터링 후 검증: allowed가 false인 캠핑장이 있는지 확인
      const invalidCampsites = filtered.filter((c) => !c.dogPolicy || c.dogPolicy.allowed !== true);
      if (invalidCampsites.length > 0) {
        console.error(`[Filter] ERROR: ${invalidCampsites.length} invalid campsites passed filter:`, invalidCampsites.map(c => ({
          name: c.name,
          allowed: c.dogPolicy?.allowed,
          hasDogPolicy: !!c.dogPolicy
        })));
      }
    }

    // 지역 필터
    if (selectedRegion !== "all") {
      filtered = filtered.filter((c) => c.region === selectedRegion);
    }

    // 반려견 크기 필터
    if (selectedDogSize !== "all") {
      filtered = filtered.filter((c) => {
        if (!c.dogPolicy.allowed) return false;
        if (selectedDogSize === "all_dogs") return true;
        return c.dogPolicy.sizeCategory === selectedDogSize;
      });
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "region":
          return a.region.localeCompare(b.region);
        case "dog_friendly":
          return (
            (b.dogPolicy.allowed ? 1 : 0) - (a.dogPolicy.allowed ? 1 : 0)
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [campsites, selectedRegion, selectedDogSize, sortBy, showOnlyDogFriendly]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredCampsites.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCampsites = filteredCampsites.slice(startIndex, endIndex);

  // 페이지 범위 계산 (최대 5개 버튼 표시)
  const getPageRange = () => {
    const range = [];
    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };

  // URL 업데이트
  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === "all" || value === "false" || value === "1") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    router.push(`/search?${newParams.toString()}`, { scroll: false });
  };

  // 필터 변경 핸들러
  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로
    updateURL({ 
      region: value, 
      dogSize: selectedDogSize, 
      sort: sortBy,
      dogOnly: showOnlyDogFriendly.toString(),
      page: "1"
    });
  };

  const handleDogSizeChange = (value: string) => {
    setSelectedDogSize(value);
    setCurrentPage(1);
    updateURL({ 
      region: selectedRegion, 
      dogSize: value, 
      sort: sortBy,
      dogOnly: showOnlyDogFriendly.toString(),
      page: "1"
    });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
    updateURL({ 
      region: selectedRegion, 
      dogSize: selectedDogSize, 
      sort: value,
      dogOnly: showOnlyDogFriendly.toString(),
      page: "1"
    });
  };

  const handleDogOnlyToggle = (checked: boolean) => {
    setShowOnlyDogFriendly(checked);
    setCurrentPage(1);
    updateURL({
      region: selectedRegion,
      dogSize: selectedDogSize,
      sort: sortBy,
      dogOnly: checked.toString(),
      page: "1"
    });
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({
      region: selectedRegion,
      dogSize: selectedDogSize,
      sort: sortBy,
      dogOnly: showOnlyDogFriendly.toString(),
      page: page.toString()
    });
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 필터 초기화
  const resetFilters = () => {
    setSelectedRegion("all");
    setSelectedDogSize("all");
    setSortBy("name");
    setShowOnlyDogFriendly(false);
    setCurrentPage(1);
    router.push("/search", { scroll: false });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-4">
      {/* Filters Sidebar */}
      <aside className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dog className="h-5 w-5 text-green-600" />
              검색 필터
            </CardTitle>
            <CardDescription>
              원하는 조건으로 캠핑장을 찾아보세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 반려견 전용 체크박스 */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">반려견 동반</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dog-friendly"
                  checked={showOnlyDogFriendly}
                  onCheckedChange={handleDogOnlyToggle}
                />
                <label
                  htmlFor="dog-friendly"
                  className="text-sm text-slate-700 cursor-pointer"
                >
                  반려견 가능 캠핑장만 보기
                </label>
              </div>
            </div>

            <Separator />

            {/* 지역 필터 */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">지역</Label>
              <Select value={selectedRegion} onValueChange={handleRegionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="전체 지역" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 지역</SelectItem>
                  {regions.slice(1).map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* 반려견 크기 필터 */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">반려견 크기</Label>
              <Select
                value={selectedDogSize}
                onValueChange={handleDogSizeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="all_dogs">반려견 가능 (전체)</SelectItem>
                  <SelectItem value="SMALL">소형견 (~10kg)</SelectItem>
                  <SelectItem value="MEDIUM">중형견 (10~25kg)</SelectItem>
                  <SelectItem value="LARGE">대형견 (25kg~)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* 정렬 */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">정렬</Label>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="이름순" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">이름순</SelectItem>
                  <SelectItem value="region">지역순</SelectItem>
                  <SelectItem value="dog_friendly">반려견 가능 우선</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* 필터 초기화 */}
            <Button
              variant="outline"
              className="w-full"
              onClick={resetFilters}
            >
              필터 초기화
            </Button>
          </CardContent>
        </Card>
      </aside>

      {/* Results */}
      <div className="lg:col-span-3 space-y-6">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              캠핑장 검색 결과
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              총 <span className="font-semibold text-green-600">{filteredCampsites.length}</span>개의 캠핑장
              {totalPages > 1 && (
                <span className="ml-2 text-slate-500">
                  ({currentPage} / {totalPages} 페이지)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Empty State */}
        {filteredCampsites.length === 0 && (
          <Card className="p-12 text-center">
            <Dog className="mx-auto h-16 w-16 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              검색 결과가 없습니다
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              다른 조건으로 다시 검색해보세요
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={resetFilters}
            >
              필터 초기화
            </Button>
          </Card>
        )}

        {/* Campsite Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {paginatedCampsites.map((campsite) => (
            <Card
              key={campsite.id}
              className="overflow-hidden transition-shadow hover:shadow-lg"
            >
              <div className="relative h-48 bg-gradient-to-br from-green-100 to-blue-100">
                {campsite.mainImageUrl ? (
                  <img
                    src={campsite.mainImageUrl}
                    alt={campsite.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Dog className="h-16 w-16 text-green-300" />
                  </div>
                )}
                {campsite.dogPolicy.allowed && (
                  <Badge className="absolute right-2 top-2 bg-green-600 text-white">
                    <Dog className="mr-1 h-3 w-3" />
                    반려견 가능
                  </Badge>
                )}
              </div>

              <CardHeader>
                <CardTitle className="text-xl">{campsite.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {campsite.region}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-slate-600">
                  <p>{campsite.address}</p>
                  {campsite.phone && (
                    <p className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {campsite.phone}
                    </p>
                  )}
                </div>

                {campsite.dogPolicy && campsite.dogPolicy.allowed === true && (
                  <div className="rounded-lg bg-green-50 p-3">
                    <div className="flex items-center gap-2">
                      <Dog className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        반려견 정책
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {getDogSizeBadge(campsite.dogPolicy.sizeCategory)}
                      {campsite.dogPolicy.note && (
                        <span className="text-xs text-green-700">
                          {campsite.dogPolicy.note}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {campsite.facilities.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-700">
                      편의시설
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {campsite.facilities.slice(0, 5).map((facility) => (
                        <Badge key={facility} variant="secondary" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                      {campsite.facilities.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{campsite.facilities.length - 5}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex gap-2">
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
                        <ExternalLink className="mr-1 h-4 w-4" />
                        예약
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-10 w-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* First Page */}
            {getPageRange()[0] > 1 && (
              <>
                <Button
                  variant={currentPage === 1 ? "default" : "outline"}
                  onClick={() => handlePageChange(1)}
                  className={currentPage === 1 ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  1
                </Button>
                {getPageRange()[0] > 2 && (
                  <span className="px-2 text-slate-400">...</span>
                )}
              </>
            )}

            {/* Page Numbers */}
            {getPageRange().map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => handlePageChange(page)}
                className={
                  currentPage === page
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                {page}
              </Button>
            ))}

            {/* Last Page */}
            {getPageRange()[getPageRange().length - 1] < totalPages && (
              <>
                {getPageRange()[getPageRange().length - 1] < totalPages - 1 && (
                  <span className="px-2 text-slate-400">...</span>
                )}
                <Button
                  variant={currentPage === totalPages ? "default" : "outline"}
                  onClick={() => handlePageChange(totalPages)}
                  className={
                    currentPage === totalPages
                      ? "bg-green-600 hover:bg-green-700"
                      : ""
                  }
                >
                  {totalPages}
                </Button>
              </>
            )}

            {/* Next Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-10 w-10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

