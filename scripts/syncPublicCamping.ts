/**
 * 고캠핑 OpenAPI 데이터 동기화 스크립트
 * 
 * 실행 방법:
 *   npm run sync:gocamping
 * 
 * 환경 변수 필요:
 *   GOCAMPING_API_KEY: 공공데이터포털에서 발급받은 serviceKey
 *   GOCAMPING_API_ENDPOINT: (선택) 기본값은 아래 BASE_URL
 */

import { PrismaClient } from '@prisma/client';

// 환경 변수 (실제로는 .env에서 로드)
const GOCAMPING_API_KEY = process.env.GOCAMPING_API_KEY || '';
const BASE_URL = process.env.GOCAMPING_API_ENDPOINT || 'https://apis.data.go.kr/B551011/GoCamping';

// Prisma 클라이언트
const prisma = new PrismaClient();

// ========================================
// 1. 고캠핑 API 타입 정의
// ========================================

interface GoCampingRawItem {
  contentId: string;
  facltNm: string;
  addr1: string;
  addr2?: string;
  doNm: string;
  sigunguNm: string;
  mapX?: string;
  mapY?: string;
  tel?: string;
  firstImageUrl?: string;
  homepage?: string;
  lineIntro?: string;
  intro?: string;
  induty?: string; // 업종: 일반야영장, 자동차야영장, 글램핑 등
  sbrsCl?: string; // 부대시설: 전기,온수,무선인터넷... (쉼표 구분)
  sbrsEtc?: string; // 기타 부대시설
  animalCmgCl?: string; // 애완동물출입 (가능, 불가능, 소형견가능 등)
}

interface GoCampingResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: GoCampingRawItem[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

// ========================================
// 2. API 호출 함수
// ========================================

async function fetchGoCampingPage(
  pageNo: number,
  numOfRows: number = 100
): Promise<GoCampingRawItem[]> {
  const params = new URLSearchParams({
    serviceKey: GOCAMPING_API_KEY,
    pageNo: String(pageNo),
    numOfRows: String(numOfRows),
    MobileOS: 'ETC',
    MobileApp: 'dogcamp',
    _type: 'json',
  });

  const url = `${BASE_URL}/basedList?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GoCampingResponse = await response.json();

    if (data.response.header.resultCode !== '0000') {
      throw new Error(`API Error: ${data.response.header.resultMsg}`);
    }

    return data.response.body.items?.item || [];
  } catch (error) {
    console.error(`[fetchGoCampingPage] Error on page ${pageNo}:`, error);
    return [];
  }
}

// ========================================
// 3. 필드 매핑 함수들
// ========================================

/**
 * animalCmgCl 필드를 DogPolicy 구조로 변환
 */
function mapAnimalToDogPolicy(animalCmgCl?: string) {
  const text = animalCmgCl?.trim() || '';
  let allowed = false; // 기본값: 불가
  let sizeCategory: 'SMALL' | 'MEDIUM' | 'LARGE' | null = null;

  // 불가능 키워드 체크
  if (text.includes('불가') || text.includes('금지')) {
    allowed = false;
  } else if (text.includes('가능') || text.includes('허용')) {
    allowed = true;

    // 크기 제한 체크
    if (text.includes('소형견') || text.includes('소형')) {
      sizeCategory = 'SMALL';
    } else if (text.includes('중형견') || text.includes('중형')) {
      sizeCategory = 'MEDIUM';
    } else if (text.includes('대형견') || text.includes('대형')) {
      sizeCategory = 'LARGE';
    }
  }

  return {
    allowed,
    sizeCategory,
    maxDogs: null, // 향후 파싱 로직 추가
    extraFee: null,
    indoorAllowed: null,
    outdoorOnly: null,
    note: text || null, // 원문 전체를 note에 저장
  };
}

/**
 * 부대시설 텍스트를 FacilityTag 이름 배열로 변환
 */
function parseFacilities(sbrsCl?: string, sbrsEtc?: string): string[] {
  const facilities: string[] = [];

  if (sbrsCl) {
    const tags = sbrsCl.split(',').map((s) => s.trim()).filter(Boolean);
    facilities.push(...tags);
  }

  if (sbrsEtc) {
    // sbrsEtc에도 쉼표 구분이 있을 수 있음
    const extras = sbrsEtc.split(',').map((s) => s.trim()).filter(Boolean);
    facilities.push(...extras);
  }

  return [...new Set(facilities)]; // 중복 제거
}

// ========================================
// 4. 메인 동기화 로직
// ========================================

async function syncPublicCamping() {
  console.log('========================================');
  console.log('고캠핑 데이터 동기화 시작');
  console.log('========================================');

  if (!GOCAMPING_API_KEY) {
    console.error('[ERROR] GOCAMPING_API_KEY 환경 변수가 설정되지 않았습니다.');
    console.error('');
    console.error('다음 단계를 수행하세요:');
    console.error('1. 공공데이터포털(data.go.kr) 접속');
    console.error('2. "고캠핑" 또는 "GoCamping" 검색');
    console.error('3. 활용 신청 후 serviceKey 발급');
    console.error('4. .env 파일에 GOCAMPING_API_KEY=발급받은키 추가');
    process.exit(1);
  }

  // source_site 조회 또는 생성
  let sourceSite = await prisma.sourceSite.findFirst({
    where: { name: '고캠핑(공공데이터포털)' },
  });

  if (!sourceSite) {
    sourceSite = await prisma.sourceSite.create({
      data: {
        name: '고캠핑(공공데이터포털)',
        baseUrl: BASE_URL,
        type: 'JSON_API',
        enabled: true,
      },
    });
    console.log(`[SourceSite] 생성: ${sourceSite.name}`);
  }

  // crawl_log 시작 기록
  const crawlLog = await prisma.crawlLog.create({
    data: {
      sourceSiteId: sourceSite.id,
      startedAt: new Date(),
      status: 'RUNNING',
      itemsProcessed: 0,
      itemsCreated: 0,
      itemsUpdated: 0,
      itemsFailed: 0,
    },
  });

  let totalProcessed = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalFailed = 0;
  let pageNo = 1;
  const pageSize = 100;

  try {
    while (true) {
      console.log(`\n[Fetch] 페이지 ${pageNo} 요청 중...`);
      const items = await fetchGoCampingPage(pageNo, pageSize);

      if (items.length === 0) {
        console.log('[Fetch] 더 이상 데이터가 없습니다. 종료합니다.');
        break;
      }

      console.log(`[Fetch] ${items.length}개 캠핑장 데이터 받음`);

      for (const raw of items) {
        try {
          totalProcessed++;
          const id = `gocamping-${raw.contentId}`;
          const region = `${raw.doNm} ${raw.sigunguNm}`.trim();
          const dogPolicy = mapAnimalToDogPolicy(raw.animalCmgCl);
          const facilities = parseFacilities(raw.sbrsCl, raw.sbrsEtc);

          // 기존 캠핑장 확인
          const existingCampsite = await prisma.campsite.findUnique({
            where: { id },
          });

          // Campsite upsert
          const campsite = await prisma.campsite.upsert({
            where: { id },
            update: {
              name: raw.facltNm,
              address: raw.addr2 ? `${raw.addr1} ${raw.addr2}`.trim() : raw.addr1,
              region,
              latitude: raw.mapY ? parseFloat(raw.mapY) : null,
              longitude: raw.mapX ? parseFloat(raw.mapX) : null,
              phone: raw.tel || null,
              mainImageUrl: raw.firstImageUrl || null,
              externalUrl: raw.homepage || null,
              sourceSiteId: sourceSite.id,
            },
            create: {
              id,
              name: raw.facltNm,
              address: raw.addr2 ? `${raw.addr1} ${raw.addr2}`.trim() : raw.addr1,
              region,
              latitude: raw.mapY ? parseFloat(raw.mapY) : null,
              longitude: raw.mapX ? parseFloat(raw.mapX) : null,
              phone: raw.tel || null,
              mainImageUrl: raw.firstImageUrl || null,
              externalUrl: raw.homepage || null,
              sourceSiteId: sourceSite.id,
            },
          });

          // 통계 카운트
          if (existingCampsite) {
            totalUpdated++;
          } else {
            totalCreated++;
          }

          // DogPolicy upsert
          await prisma.dogPolicy.upsert({
            where: { campsiteId: campsite.id },
            update: dogPolicy,
            create: {
              campsiteId: campsite.id,
              ...dogPolicy,
            },
          });

        // FacilityTag 및 CampsiteFacility 처리
        for (const facName of facilities) {
          // FacilityTag 존재 확인 또는 생성
          let tag = await prisma.facilityTag.findFirst({
            where: { name: facName },
          });

          if (!tag) {
            tag = await prisma.facilityTag.create({
              data: { name: facName },
            });
          }

          // CampsiteFacility 연결 (이미 있으면 무시)
          await prisma.campsiteFacility.upsert({
            where: {
              campsiteId_facilityTagId: {
                campsiteId: campsite.id,
                facilityTagId: tag.id,
              },
            },
            update: {},
            create: {
              campsiteId: campsite.id,
              facilityTagId: tag.id,
            },
          });
        }
        } catch (itemError) {
          console.error(`[ERROR] 캠핑장 ${raw.contentId} 처리 실패:`, itemError);
          totalFailed++;
        }
      }

      pageNo += 1;

      // 페이지당 1초 딜레이 (서버 부하 방지)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // crawl_log 완료 기록
    await prisma.crawlLog.update({
      where: { id: crawlLog.id },
      data: {
        completedAt: new Date(),
        status: 'SUCCESS',
        itemsProcessed: totalProcessed,
        itemsCreated: totalCreated,
        itemsUpdated: totalUpdated,
        itemsFailed: totalFailed,
        message: '동기화가 성공적으로 완료되었습니다.',
      },
    });

    console.log('\n========================================');
    console.log('동기화 완료');
    console.log(`총 처리: ${totalProcessed}개`);
    console.log(`신규: ${totalCreated}개, 업데이트: ${totalUpdated}개, 실패: ${totalFailed}개`);
    console.log('========================================');
  } catch (error) {
    console.error('[ERROR] 동기화 중 오류 발생:', error);

    // crawl_log 실패 기록
    await prisma.crawlLog.update({
      where: { id: crawlLog.id },
      data: {
        completedAt: new Date(),
        status: 'FAILED',
        itemsProcessed: totalProcessed,
        itemsCreated: totalCreated,
        itemsUpdated: totalUpdated,
        itemsFailed: totalFailed,
        message: error instanceof Error ? error.message : String(error),
      },
    });

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
syncPublicCamping();

