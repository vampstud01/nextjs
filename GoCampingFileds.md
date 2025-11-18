## 고캠핑 → Campsite 매핑

| GoCamping 필드명 | 의미/설명                     | dogcamp 모델/필드         | 변환 규칙/비고                                  |
|------------------|-------------------------------|---------------------------|-------------------------------------------------|
| contentId        | 고캠핑 고유 ID                | Campsite.id               | `"public-" + contentId` 처럼 prefix 붙여 사용   |
| facltNm          | 야영장명(캠핑장 이름)         | Campsite.name             | 그대로 사용                                     |
| addr1            | 주소1                         | Campsite.address          | `addr1` 사용, `addr2` 있으면 뒤에 괄호로 추가  |
| addr2            | 주소2(상세 주소)              | Campsite.address          | `addr1 + ' ' + addr2` 조합                      |
| doNm             | 도 이름(시/도)                | Campsite.region           | `doNm + ' ' + sigunguNm` 형태로 조합            |
| sigunguNm        | 시군구 이름                   | Campsite.region           | 위와 동일                                      |
| mapX             | 경도 (X 좌표)                 | Campsite.longitude        | `Number(mapX)` or `null`                        |
| mapY             | 위도 (Y 좌표)                 | Campsite.latitude         | `Number(mapY)` or `null`                        |
| tel              | 전화번호                      | Campsite.phone            | 공백/`-` 정리 정도만                           |
| firstImageUrl    | 대표 이미지 URL               | Campsite.mainImageUrl     | 없으면 `null`                                   |
| homepage         | 홈페이지(예약/소개 페이지)    | Campsite.externalUrl      | 그대로 사용                                     |
| lineIntro        | 한줄 소개                     | (추가 시) Campsite.summary| 나중에 `summary` 필드 추가 고려                 |
| intro            | 상세 소개                     | (추가 시) Campsite.description | 나중에 `description` 필드 추가 고려        |
| induty           | 업종(일반야영장/글램핑 등)    | (추가 시) Campsite.type   | enum으로 매핑: CAMPING/GLAMPING/CARAVAN 등      |
| facltDivNm       | 시설 구분                     | FacilityTag & CampsiteFacility | 편의시설 태그로 분해/매핑                 |

## 고캠핑 → DogPolicy 매핑

| GoCamping 필드명 | 의미/설명                           | dogcamp 모델/필드       | 변환 규칙/비고                                         |
|------------------|-------------------------------------|-------------------------|--------------------------------------------------------|
| animalCmgCl      | 애완동물 동반 여부(코드/텍스트)    | DogPolicy.allowed       | `불가` → false, `가능`/`가능(소형견)` → true           |
| animalCmgCl      | same                               | DogPolicy.sizeCategory  | `소형견` 포함 → SMALL, `중형` → MEDIUM, `대형` → LARGE |
| animalCmgCl      | same                               | DogPolicy.note          | 원문 전체를 note에 그대로 저장                         |
| sbrsCl           | 부대시설(쉼터/산책로 등 텍스트)    | DogPolicy.note or FacilityTag | 반려견 관련 키워드 있으면 note에 추가        |
| ? (추가 필드)    | 최대 마리 수/추가요금 관련 필드    | DogPolicy.maxDogs       | 있으면 숫자로 변환, 없으면 null                        |
| ?                | 추가 요금 관련 필드               | DogPolicy.extraFee      | “1마리당 10000원” 등은 숫자 추출, 원문은 note에        |
| ?                | 실내/실외 가능 여부 관련 텍스트    | DogPolicy.indoorAllowed / outdoorOnly | 규칙 기반 파싱      |


## 고캠핑 → FacilityTag 매핑

| GoCamping 필드명 | 예시 값                          | dogcamp 모델/필드        | 변환 규칙/비고                                  |
|------------------|----------------------------------|--------------------------|-----------------------------------------------|
| sbrsCl           | `전기,온수,무선인터넷,운동시설` | FacilityTag.name         | `,` 기준 split → 트림 후 태그로 upsert         |
| sbrsCl           | same                             | CampsiteFacility         | 각 태그에 대해 (campsiteId, facilityTagId) 생성 |
| sbrsEtc          | 기타 시설 설명                  | (선택) FacilityTag.name or Campsite.note | 반려견 관련 키워드는 DogPolicy.note에도 추가 |

## 고캠핑 → Availability 매핑 (있을 경우)

| GoCamping 필드명 | 의미/설명                   | dogcamp 모델/필드         | 변환 규칙/비고                                   |
|------------------|-----------------------------|---------------------------|--------------------------------------------------|
| availDate| 예약 가능 날짜              | Availability.date         | `new Date()`로 변환                              |
| isResv   | 해당 날짜 예약 가능 여부    | Availability.isAvailable  | `Y/N` 또는 코드 값을 boolean으로 변환           |
| minStay  | 최소 숙박일                 | Availability.minStayNights| 숫자로 변환                                     |
| price    | 기준일 최저가               | Availability.basePriceFrom| 숫자로 변환 (원 단위)                            |

