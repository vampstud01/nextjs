"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tent, Trash2, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";

export default function DeleteCampsitePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [campsite, setCampsite] = useState<any>(null);

  useEffect(() => {
    const fetchCampsite = async () => {
      try {
        const response = await fetch(`/api/admin/campsites/${params.id}`);
        if (!response.ok) {
          throw new Error("캠핑장 정보를 불러오는데 실패했습니다");
        }

        const data = await response.json();
        setCampsite(data);
      } catch (error) {
        console.error("Error fetching campsite:", error);
        alert("캠핑장 정보를 불러오는데 실패했습니다.");
        router.push("/admin");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampsite();
  }, [params.id, router]);

  const handleDelete = async () => {
    if (!confirm(`정말로 "${campsite.name}" 캠핑장을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/campsites/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("캠핑장 삭제에 실패했습니다");
      }

      alert("캠핑장이 성공적으로 삭제되었습니다!");
      router.push("/admin");
    } catch (error) {
      console.error("Error deleting campsite:", error);
      alert("캠핑장 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-green-600" />
          <p className="mt-4 text-slate-600">캠핑장 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!campsite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>캠핑장을 찾을 수 없습니다</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/admin">
              <Button className="w-full">목록으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <AdminHeader />

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-slate-900">
            캠핑장 삭제
          </h2>
          <p className="text-slate-600">
            삭제하려는 캠핑장의 정보를 확인해주세요
          </p>
        </div>

        {/* Warning */}
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">경고</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-700">
              이 작업은 되돌릴 수 없습니다. 캠핑장과 관련된 모든 정보가 영구적으로 삭제됩니다.
            </p>
          </CardContent>
        </Card>

        {/* Campsite Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>삭제할 캠핑장 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-blue-100">
                {campsite.mainImageUrl ? (
                  <img
                    src={campsite.mainImageUrl}
                    alt={campsite.name}
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <Tent className="h-10 w-10 text-green-600" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {campsite.name}
                </h3>
                <p className="text-sm text-slate-600">{campsite.address}</p>
              </div>
            </div>

            <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-slate-700">연락처</p>
                <p className="mt-1 text-sm text-slate-900">
                  {campsite.phone || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">반려견 동반</p>
                <p className="mt-1 text-sm text-slate-900">
                  {campsite.dogPolicy?.allowed ? "가능" : "불가"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/admin">
            <Button variant="outline">취소</Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                삭제 중...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                삭제하기
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

