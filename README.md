# 여행의 종점은 서울

서울역에 돌아와야 하는 시각에 맞춰 주변 명소를 추천하고, 서울 전체를 테마별 영상으로 탐색하는 시연 웹입니다.

- 현재 기상과 열차 도착 정보는 서울시 열린데이터광장과 Open-Meteo에서 조회합니다.
- 명소 영상은 게시자의 YouTube 플레이어로 재생됩니다.
- 저장한 장소와 방문 기록은 브라우저에 보관됩니다. Google Trends 파일은 브라우저에서 읽습니다.
- `/album`에서는 날짜별 여행 기록에 사진과 동영상을 담을 수 있습니다. 앨범 파일은 사용한 브라우저에 저장됩니다.
- 왼쪽 아래의 여행 챗봇에서 자연어로 출발과 복귀 시각, 관심사 등을 지정하고 서울역 왕복 경로를 확인합니다. 영상에 나온 후보는 출처를 함께 확인할 수 있습니다.

## 로컬에서 실행

Node.js를 사용합니다. 별도 JavaScript 패키지 설치가 필요하지 않습니다.

```sh
npm test
npm run build
npm start
```

기본 주소는 `http://127.0.0.1:8768`입니다. 외부 데이터가 응답하지 않으면 화면에 조회 상태를 표시합니다. 데이터와 사진의 출처는 사이트 하단에서 확인할 수 있습니다.

## Amazon SageMaker 설정

응답 가능한 SageMaker 실시간 추론 엔드포인트를 사용합니다. 해당 엔드포인트 ARN에 대해서만 `sagemaker:InvokeEndpoint`를 허용한 인증 정보를 배포 환경의 서버 비밀 설정에 등록합니다. 로컬에서는 서버 프로세스 환경으로 주입합니다. AWS 콘솔 링크만으로는 추론을 호출할 수 없습니다. [SageMaker InvokeEndpoint](https://docs.aws.amazon.com/sagemaker/latest/APIReference/API_runtime_InvokeEndpoint.html)

| 서버 설정 이름 | 값 |
| --- | --- |
| `AWS_REGION` | 엔드포인트가 배포된 AWS 리전 |
| `SAGEMAKER_ENDPOINT_NAME` | 기존 실시간 추론 엔드포인트 이름 |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | IAM 인증 정보 |
| `AWS_SESSION_TOKEN` | 임시 인증 정보를 사용할 때의 세션 토큰 |
| `SAGEMAKER_FORMAT` | 기본값 `chat`은 채팅 완성 형식, `tgi`는 텍스트 생성 형식 |

엔드포인트의 모델 및 컨테이너가 지원하는 요청과 응답 형식에 맞춰 설정합니다. 접속 설정이 없거나 호출이 실패하면 챗봇은 기본 조건 해석으로 동작하며 화면에 사용한 방식을 표시합니다. 질문과 일정 조건은 SageMaker 설정 시 조건 해석 요청에 사용됩니다. 운영시간, 이동 시간, 복귀 시각은 서버 계산기가 확인합니다. 인증 정보는 서버에서만 사용하며 소스와 빌드 산출물에 포함하지 않습니다.

서버에 `CONCIERGE_OSRM=on`을 설정하면 등록된 명소 좌표로 FOSSGIS 도보 경로를 조회합니다. 기본값은 서울역 경유 도보 추정이며, 화면에서 산정 기준을 확인할 수 있습니다. [FOSSGIS 공용 서비스 정책](https://routing.openstreetmap.de/about.html)

## 공모전 사전 시연 자료

이 저장소는 아이디어 검증과 신청서 준비를 위한 사전 시연 버전입니다. 주최 측 FAQ에 따라 본선에 제출하는 핵심 기능과 코드는 행사 현장에서 새로 개발해야 합니다. 아래 목록은 이 버전의 구성에 해당합니다. [서울관광 프롬프톤 공식 FAQ](https://prompt2026.sto.or.kr/)

- [CycloneDX 소프트웨어 구성 목록](sbom.cdx.json)
- [콘텐츠 출처와 사용 조건](THIRD_PARTY_NOTICES.md)
