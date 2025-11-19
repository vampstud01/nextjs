import { Button } from "@/components/ui/button";
import { Tent } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CampsiteList from "@/components/CampsiteList";
import { Suspense } from "react";

// 실제 DB에서 캠핑장 데이터 가져오기
async function getCampsites() {
  try {
    // Supabase 클라이언트를 사용하여 캠핑장 데이터 가져오기
    // 모든 데이터를 가져오기 위해 range 사용
    // 외래 키 관계를 명시적으로 지정: DogPolicy.campsiteId -> Campsite.id
    const { data: campsites, error } = await supabase
      .from('Campsite')
      .select(`
        *,
        DogPolicy!DogPolicy_campsiteId_fkey(*),
        facilities:CampsiteFacility(
          facilityTag:FacilityTag(*)
        )
      `)
      .order('name', { ascending: true })
      .range(0, 9999); // 충분히 큰 범위로 설정

    if (error) {
      console.error("Supabase query error:", error);
      return [];
    }

    if (!campsites) {
      return [];
    }

    // 디버깅: dogPolicy가 있는 캠핑장 개수 확인
    const withDogPolicy = campsites.filter((c: any) => {
      const policy = Array.isArray(c.DogPolicy) ? c.DogPolicy[0] : (c.DogPolicy || c.dogPolicy);
      return policy !== null && policy !== undefined;
    }).length;
    const dogFriendlyCount = campsites.filter((c: any) => {
      const policy = Array.isArray(c.DogPolicy) ? c.DogPolicy[0] : (c.DogPolicy || c.dogPolicy);
      return policy?.allowed === true;
    }).length;
    console.log(`[Search] Total campsites: ${campsites.length}, With dogPolicy: ${withDogPolicy}, Dog-friendly: ${dogFriendlyCount}`);
    
    // 샘플 데이터 구조 확인
    if (campsites.length > 0) {
      const sample = campsites[0];
      const samplePolicy = Array.isArray(sample.DogPolicy) ? sample.DogPolicy[0] : (sample.DogPolicy || sample.dogPolicy);
      console.log(`[Search] Sample campsite structure:`, {
        id: sample.id,
        name: sample.name,
        hasDogPolicy: !!samplePolicy,
        hasDogPolicyKey: 'DogPolicy' in sample,
        hasDogPolicyKeyLower: 'dogPolicy' in sample,
        dogPolicyType: typeof samplePolicy,
        dogPolicyValue: samplePolicy,
        allKeys: Object.keys(sample),
      });
    }

    return campsites.map((campsite: any) => {
      // DogPolicy는 배열이거나 단일 객체일 수 있음
      const dogPolicy = Array.isArray(campsite.DogPolicy) 
        ? campsite.DogPolicy[0] 
        : campsite.DogPolicy || campsite.dogPolicy;
      
      return {
        id: campsite.id,
        name: campsite.name,
        region: campsite.address?.split(" ").slice(0, 2).join(" ") || "",
        address: campsite.address || "",
        phone: campsite.phone || "",
        mainImageUrl: campsite.mainImageUrl || "",
        externalUrl: campsite.externalUrl || "",
        dogPolicy: dogPolicy ? {
          allowed: dogPolicy.allowed ?? false,
          sizeCategory: dogPolicy.sizeCategory || null,
          note: dogPolicy.note || "",
        } : {
          allowed: false,
          sizeCategory: null,
          note: "",
        },
        facilities: campsite.facilities?.map((cf: any) => cf.facilityTag?.name).filter(Boolean) || [],
      };
    });
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

        <Suspense fallback={<div className="text-center py-12">로딩 중...</div>}>
          <CampsiteList campsites={campsites} />
        </Suspense>
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

