import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tent, Edit, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import AdminHeader from "@/components/AdminHeader";

// 이 페이지는 항상 동적으로 렌더링되어야 함 (빌드 시 정적 생성 방지)
export const dynamic = 'force-dynamic';

// 관리자 페이지용 캠핑장 데이터 가져오기
async function getAdminCampsites() {
  try {
    // 환경 변수 확인
    const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    console.log("[Admin] 환경 변수 체크:", {
      hasSupabaseUrl,
      hasServiceRoleKey,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + "...",
    });

    const supabase = getSupabaseAdmin();
    
    // 모든 데이터를 가져오기 위해 페이지네이션 사용
    let allCampsites: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: campsites, error } = await supabase
        .from("Campsite")
        .select(
          `
          *,
          dogPolicy:DogPolicy(*),
          facilities:CampsiteFacility(
            facilityTag:FacilityTag(*)
          )
        `
        )
        .order("createdAt", { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) {
        console.error("[Admin] Supabase query error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        break;
      }

      if (campsites && campsites.length > 0) {
        allCampsites = allCampsites.concat(campsites);
        from += pageSize;
        hasMore = campsites.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    console.log("[Admin] 총 조회된 캠핑장 수:", allCampsites.length);

    if (!allCampsites || allCampsites.length === 0) {
      return [];
    }

    return allCampsites.map((campsite: any) => ({
      id: campsite.id,
      name: campsite.name,
      region: campsite.address?.split(" ").slice(0, 2).join(" ") || "",
      address: campsite.address || "",
      phone: campsite.phone || "",
      mainImageUrl: campsite.mainImageUrl || "",
      dogAllowed: campsite.dogPolicy?.allowed || false,
      facilities: campsite.facilities?.map((cf: any) => cf.facilityTag?.name).filter(Boolean) || [],
      createdAt: campsite.createdAt,
    }));
  } catch (error: any) {
    console.error("[Admin] Failed to fetch campsites:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return [];
  }
}

export default async function AdminPage() {
  const campsites = await getAdminCampsites();
  
  // 환경 변수 체크
  const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envError = !hasServiceRoleKey || !hasSupabaseUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <AdminHeader showAddButton={true} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 환경 변수 오류 알림 */}
        {envError && (
          <div className="mb-6 rounded-lg border-2 border-red-300 bg-red-50 p-4">
            <h3 className="mb-2 font-semibold text-red-800">환경 변수 설정 오류</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
              {!hasSupabaseUrl && (
                <li>NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.</li>
              )}
              {!hasServiceRoleKey && (
                <li>SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.</li>
              )}
            </ul>
            <p className="mt-2 text-sm text-red-600">
              Vercel 대시보드에서 환경 변수를 설정해주세요.
            </p>
          </div>
        )}

        {/* Page Title */}
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-slate-900">
            캠핑장 관리
          </h2>
          <p className="text-slate-600">
            총 <span className="font-semibold text-green-600">{campsites.length}개</span>의 캠핑장이 등록되어 있습니다
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                전체 캠핑장
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {campsites.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                반려견 가능
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {campsites.filter((c) => c.dogAllowed).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                반려견 불가
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {campsites.filter((c) => !c.dogAllowed).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                이미지 등록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {campsites.filter((c) => c.mainImageUrl).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campsite Table */}
        <Card>
          <CardHeader>
            <CardTitle>캠핑장 목록</CardTitle>
            <CardDescription>
              등록된 캠핑장을 확인하고 관리할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 text-left text-sm font-semibold text-slate-700">
                      캠핑장명
                    </th>
                    <th className="pb-3 text-left text-sm font-semibold text-slate-700">
                      지역
                    </th>
                    <th className="pb-3 text-left text-sm font-semibold text-slate-700">
                      연락처
                    </th>
                    <th className="pb-3 text-center text-sm font-semibold text-slate-700">
                      반려견
                    </th>
                    <th className="pb-3 text-center text-sm font-semibold text-slate-700">
                      편의시설
                    </th>
                    <th className="pb-3 text-right text-sm font-semibold text-slate-700">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {campsites.map((campsite) => (
                    <tr key={campsite.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-blue-100">
                            {campsite.mainImageUrl ? (
                              <img
                                src={campsite.mainImageUrl}
                                alt={campsite.name}
                                className="h-full w-full rounded-lg object-cover"
                              />
                            ) : (
                              <Tent className="h-6 w-6 text-green-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {campsite.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {campsite.address.length > 40
                                ? campsite.address.substring(0, 40) + "..."
                                : campsite.address}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-slate-700">
                        {campsite.region}
                      </td>
                      <td className="py-4 text-sm text-slate-700">
                        {campsite.phone || "-"}
                      </td>
                      <td className="py-4 text-center">
                        {campsite.dogAllowed ? (
                          <Badge className="bg-green-100 text-green-700">
                            가능
                          </Badge>
                        ) : (
                          <Badge variant="secondary">불가</Badge>
                        )}
                      </td>
                      <td className="py-4 text-center text-sm text-slate-700">
                        {campsite.facilities.length}개
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/edit/${campsite.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/delete/${campsite.id}`}>
                            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {campsites.length === 0 && (
                <div className="py-12 text-center">
                  <Tent className="mx-auto h-16 w-16 text-slate-300" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    등록된 캠핑장이 없습니다
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    새로운 캠핑장을 등록해보세요
                  </p>
                  <Link href="/admin/new">
                    <Button className="mt-4 bg-green-600 hover:bg-green-700">
                      <Plus className="mr-2 h-4 w-4" />
                      캠핑장 등록
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Tent className="h-6 w-6 text-green-600" />
              <span className="font-semibold text-slate-900">DogCamp Admin</span>
            </div>
            <p className="text-sm text-slate-600">
              © 2025 DogCamp. 관리자 페이지
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

