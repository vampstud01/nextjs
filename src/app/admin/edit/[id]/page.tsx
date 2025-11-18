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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";

export default function EditCampsitePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    mainImageUrl: "",
    externalUrl: "",
    intro: "",
    dogAllowed: true,
    dogSizeCategory: "SMALL",
    dogMaxCount: 1,
    dogExtraFee: 0,
    dogNote: "",
  });

  useEffect(() => {
    const fetchCampsite = async () => {
      try {
        const response = await fetch(`/api/admin/campsites/${params.id}`);
        if (!response.ok) {
          throw new Error("캠핑장 정보를 불러오는데 실패했습니다");
        }

        const data = await response.json();
        setFormData({
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          mainImageUrl: data.mainImageUrl || "",
          externalUrl: data.externalUrl || "",
          intro: data.intro || "",
          dogAllowed: data.dogPolicy?.allowed ?? true,
          dogSizeCategory: data.dogPolicy?.sizeCategory || "SMALL",
          dogMaxCount: data.dogPolicy?.maxDogs || 1,
          dogExtraFee: data.dogPolicy?.extraFee || 0,
          dogNote: data.dogPolicy?.note || "",
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/campsites/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("캠핑장 수정에 실패했습니다");
      }

      alert("캠핑장 정보가 성공적으로 수정되었습니다!");
      router.push("/admin");
    } catch (error) {
      console.error("Error updating campsite:", error);
      alert("캠핑장 수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <AdminHeader />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-slate-900">
            캠핑장 수정
          </h2>
          <p className="text-slate-600">
            캠핑장 정보를 수정해주세요
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>캠핑장의 기본 정보를 수정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">캠핑장 이름 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">주소 *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">연락처</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="externalUrl">예약 링크</Label>
                  <Input
                    id="externalUrl"
                    type="url"
                    value={formData.externalUrl}
                    onChange={(e) => handleChange("externalUrl", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainImageUrl">대표 이미지 URL</Label>
                <Input
                  id="mainImageUrl"
                  type="url"
                  value={formData.mainImageUrl}
                  onChange={(e) => handleChange("mainImageUrl", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="intro">소개</Label>
                <textarea
                  id="intro"
                  className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
                  value={formData.intro}
                  onChange={(e) => handleChange("intro", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dog Policy */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>반려견 정책</CardTitle>
              <CardDescription>반려견 동반에 대한 정책을 수정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dogAllowed"
                  checked={formData.dogAllowed}
                  onCheckedChange={(checked) =>
                    handleChange("dogAllowed", checked)
                  }
                />
                <label
                  htmlFor="dogAllowed"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  반려견 동반 가능
                </label>
              </div>

              {formData.dogAllowed && (
                <>
                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="dogSizeCategory">허용 크기</Label>
                    <Select
                      value={formData.dogSizeCategory}
                      onValueChange={(value) =>
                        handleChange("dogSizeCategory", value)
                      }
                    >
                      <SelectTrigger id="dogSizeCategory">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMALL">소형견 (~10kg)</SelectItem>
                        <SelectItem value="MEDIUM">중형견 (10~25kg)</SelectItem>
                        <SelectItem value="LARGE">대형견 (25kg~)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dogMaxCount">최대 마리 수</Label>
                      <Input
                        id="dogMaxCount"
                        type="number"
                        min="1"
                        value={formData.dogMaxCount}
                        onChange={(e) =>
                          handleChange("dogMaxCount", parseInt(e.target.value))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dogExtraFee">추가 요금 (원)</Label>
                      <Input
                        id="dogExtraFee"
                        type="number"
                        min="0"
                        value={formData.dogExtraFee}
                        onChange={(e) =>
                          handleChange("dogExtraFee", parseInt(e.target.value))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dogNote">참고사항</Label>
                    <Input
                      id="dogNote"
                      value={formData.dogNote}
                      onChange={(e) => handleChange("dogNote", e.target.value)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href="/admin">
              <Button type="button" variant="outline">
                취소
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  저장하기
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

