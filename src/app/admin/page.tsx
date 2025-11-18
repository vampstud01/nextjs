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
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/AdminHeader";

// 관리자 페이지용 캠핑장 데이터 가져오기
async function getAdminCampsites() {
  try {
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
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Supabase query error:", error);
      return [];
    }

    if (!campsites) {
      return [];
    }

    return campsites.map((campsite: any) => ({
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
  } catch (error) {
    console.error("Failed to fetch campsites:", error);
    return [];
  }
}

export default async function AdminPage() {
  const campsites = await getAdminCampsites();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <AdminHeader showAddButton={true} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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

