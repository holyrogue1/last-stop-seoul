# 콘텐츠 출처와 사용 조건

2026 서울관광 프롬프톤 사전 시연 버전의 출처와 이용 조건을 기록합니다. 본선 산출물의 SBOM과 출처 목록은 행사 현장에서 개발한 결과물을 기준으로 작성합니다. [공식 공고와 라이선스 안내](https://prompt2026.sto.or.kr/)

## 배포 파일

| 파일 | 출처 및 권리 |
| --- | --- |
| `web/assets/spoqa-regular.woff2`, `spoqa-bold.woff2` | Spoqa Han Sans Neo. [원본과 SIL OFL 1.1 라이선스](https://github.com/spoqa/spoqa-han-sans/blob/main/LICENSE), [배포본 라이선스 전문](web/assets/spoqa-OFL.txt) |
| `web/assets/hero.webp`, `hero-small.webp`, `seoullo.webp` | Sean Young, 서울로7017에서 바라본 서울역. [원본](https://commons.wikimedia.org/wiki/File:Cityscape_of_Jung-gu_Seoul_Station_Seoullo_7017_20240216.jpg), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `web/assets/station.webp` | Narubaru7, 문화역서울284. [원본](https://commons.wikimedia.org/wiki/File:문화역서울284_2024.jpg), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `web/assets/palace.webp` | Mobius6, 덕수궁. [원본](https://commons.wikimedia.org/wiki/File:Deoksugung_Palace_20240409_088.jpg), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `web/assets/market.webp` | Francisco Anzola, 남대문시장. [원본](https://commons.wikimedia.org/wiki/File:Deserted_namdaemun_market_%282533880394%29.jpg), [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| `web/assets/museum.webp` | EllalineSeoul, 서울역사박물관. [원본](https://commons.wikimedia.org/wiki/File:Seoul_Museum_of_History_in_2025.jpg), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `web/assets/banpo.webp` | Wvdp, 반포대교 달빛무지개분수. [원본](https://commons.wikimedia.org/wiki/File:Banpo_Bridge_Moonlight_Rainbow_Fountain_at_night_-_2023-08-14.jpg), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `web/assets/last-stop-seoul.png` | 이 프로젝트의 기하 도형 기반 로고 |
| `web/assets/travel-magpie.webp` | 이 프로젝트를 위해 OpenAI 이미지 생성 도구로 제작한 까치 캐릭터. [생성물 이용약관](https://openai.com/policies/terms-of-use/#content) |

사진은 웹 표시를 위해 크롭하거나 WebP로 압축했습니다. CC BY 이미지와 글꼴을 배포할 때는 해당 권리 정보와 라이선스를 함께 보존합니다.

## 연동 서비스와 데이터

| 제공자 | 이용 방식과 범위 |
| --- | --- |
| YouTube | 게시자가 공개하고 임베드를 허용한 영상의 원본 플레이어와 원본 링크를 제공합니다. 영상 메타데이터와 썸네일은 제공자 출처를 사용합니다. 영상 파일이나 자막 원문은 배포물에 포함되지 않습니다. 사용자가 후보 추출에 입력하는 메모는 직접 작성했거나 사용할 권한이 있는 자료여야 합니다. [개발자 정책](https://developers.google.com/youtube/terms/developer-policies), [플레이어 임베드 안내](https://support.google.com/youtube/answer/171780) |
| 서울시 열린데이터광장 | 공개 샘플 API의 지하철 열차 도착과 광화문·덕수궁 권역 혼잡도를 조회합니다. 운영 전환 시 데이터별 사용 조건과 인증·호출 한도를 적용합니다. [열차 도착](https://data.seoul.go.kr/dataList/OA-12764/A/1/datasetView.do), [권역 혼잡도](https://data.seoul.go.kr/dataList/OA-21778/A/1/datasetView.do) |
| Open-Meteo | 서울역 날씨를 조회합니다. 데이터 출처는 Open-Meteo이며 무료 서버는 비상업용을 전제로 합니다. 상업 운영에는 해당 용도의 서비스 이용권 또는 대체 공급원 설정이 필요합니다. [데이터 출처와 이용 조건](https://open-meteo.com/en/terms) |
| Google Maps, Google Trends | 사용자 요청 시 지도 및 트렌드 페이지를 엽니다. 트렌드 비교용 CSV는 브라우저에서 처리합니다. [Maps URLs](https://developers.google.com/maps/documentation/urls/get-started), [Google Trends 데이터 활용](https://support.google.com/trends/answer/4365538) |
| FOSSGIS, OpenStreetMap | 서버에서 선택적으로 도보 경로를 조회합니다. OpenStreetMap 데이터 출처를 표시하며 공용 서비스의 호출·사용 정책이 적용됩니다. OSRM 실행 파일과 지도 데이터베이스는 배포물에 포함되지 않습니다. [FOSSGIS 이용 정책](https://routing.openstreetmap.de/about.html), [OpenStreetMap 저작권 및 ODbL](https://www.openstreetmap.org/copyright) |
| Amazon SageMaker | 서버 설정으로 연결되는 추론 서비스입니다. 외부 모델 가중치와 컨테이너는 이 배포물에 포함되지 않습니다. 엔드포인트 인계 시 모델의 배포·사용 조건을 별도로 확인합니다. [InvokeEndpoint](https://docs.aws.amazon.com/sagemaker/latest/APIReference/API_runtime_InvokeEndpoint.html) |

공모전 결과물 인수 시 제3자 자료는 각 제공자 조건으로 사용합니다. 제3자 자산 자체의 저작권이나 외부 서비스 계약을 양도 범위에 넣으려면 별도 권리 확인이 필요합니다.
