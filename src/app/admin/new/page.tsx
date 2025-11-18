"use client";

import { useState } from "react";
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
import { Tent, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewCampsitePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/campsites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("캠핑장 등록에 실패했습니다");
      }

      alert("캠핑장이 성공적으로 등록되었습니다!");
      router.push("/admin");
    } catch (error) {
      console.error("Error creating campsite:", error);
      alert("캠핑장 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <Tent className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-slate-900">DogCamp Admin</h1>
            </Link>
            <Link href="/admin">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                목록으로
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-slate-900">
            새 캠핑장 등록
          </h2>
          <p className="text-slate-600">
            캠핑장 정보를 입력하고 등록해주세요
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>캠핑장의 기본 정보를 입력하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">캠핑장 이름 *</Label>
                <Input
                  id="name"
                  placeholder="예: 옥당걸숲속관광농원"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">주소 *</Label>
                <Input
                  id="address"
                  placeholder="예: 경북 김천시 부항면 안간1길 700"
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
                    placeholder="예: 054-434-7773"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="externalUrl">예약 링크</Label>
                  <Input
                    id="externalUrl"
                    placeholder="https://..."
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
                  placeholder="https://..."
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
                  placeholder="캠핑장에 대한 간단한 소개를 입력하세요"
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
              <CardDescription>반려견 동반에 대한 정책을 설정하세요</CardDescription>
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
                      placeholder="예: 입장 시 예방접종 증명서 필요"
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
              disabled={isLoading}
            >
              {isLoading ? (
                "등록 중..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  등록하기
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

