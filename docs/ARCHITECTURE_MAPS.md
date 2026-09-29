# 프로젝트 아키텍처 다이어그램

상단 System Overview는 유지하고, 5개 프로젝트 상세 페이지에 전체 논리 구성도를 추가했습니다. 실제 운영 화면이나 인프라 복제도가 아닙니다. 회사·매장·원본 비공개 저장소의 식별자는 포함하지 않습니다.

## 콘텐츠를 수정하는 위치

- `content/architecture/diagrams.mjs`: 박스, 연결, 한국어 설명, 구현/검증 경계
- `content/architecture/brands.mjs`: 사용 기술과 고정된 SVG 원본 URL
- `src/lib/architecture.mjs`: 이미지·다운로드·텍스트 대안·출처 UI
- `public/styles/architecture.css`: 상세 페이지의 반응형 표시
- `scripts/build-architectures.mjs`: 같은 데이터에서 독립 실행형 SVG 5개 생성

각 박스는 논리적 책임이며 별도 프로세스나 서버 수를 뜻하지 않습니다. PostgreSQL과 Redis의 역할, HTTP와 실시간 통신의 책임, 선택 도구와 검증 대기 API를 구분합니다.

## 기술 검토 범위

| 프로젝트 | 대조한 자료 | 반드시 유지할 구분 |
| --- | --- | --- |
| PokerOS | 서버 의존성, 아키텍처/실시간 명세, Docker/AWS 배포 구성 | HTTP 명령, Socket.IO 확정 상태, Redis 운영 권위, PostgreSQL 복구 기록 |
| PokerPlus | 서버 의존성, 현재 구현 상태 목록, API 및 E2E 경계 | 자체 기능과 외부 제공자 연동 검증을 분리합니다. 점선을 운영 완료로 바꾸지 않습니다. |
| MonitorControl | 서버 의존성, Android Gradle, 업로드/디바이스/배포 구성 | ws와 OkHttp, HTTP heartbeat, S3 호환 직접 업로드, 기기 로컬 캐시 |
| PokerOCROverlay | README 제품 경로, Python 의존성, Broadcast API와 Prisma schema | FastAPI와 Node.js 방송 API, OCR Bridge, SQLite, source-scoped 검증 |
| AI Development Harness | README, lifecycle wrapper, 도구 선택 계약 | 로컬 지침/CLI이며 상시 서버가 아닙니다. 도구는 호스트 권한에 따라 선택됩니다. |

검토일: 2026-09-29. 비공개 원본 코드/주소는 이 공개 저장소에 복사하지 않았습니다. 구현된 라이브러리와 API를 표현하되 모든 기능의 운영 배포 완료를 주장하지 않습니다.

## 로고 원본과 라이선스

Devicon v2.17.0의 고정 commit과 Simple Icons의 고정 commit에서 SVG 원본 27개를 가져옵니다. 원본 색상·비율을 바꾸지 않고 밝은 바탕 위에 표시합니다. 글꼴 파일은 가져오지 않습니다.

`public/brands/manifest.json`에 실제 취득일, 정확한 원본 URL, SHA-256을 기록합니다. MIT/CC0 라이선스 원문과 출처를 같은 디렉터리에 보존합니다. SVG 라이선스와 브랜드의 상표 권리는 구분하며 제휴·보증을 암시하지 않습니다. 상세 페이지에서도 출처에 접근할 수 있습니다.

```sh
# 최초 자산 취득 또는 누락된 고정 원본 복원
node scripts/vendor-architecture-icons.mjs
# 체크인된 원본과 해시를 확인한 뒤 오프라인 생성
npm run diagrams
```

CI 첫 실행이 취득한 원본과 생성 SVG를 검증 artifact에 포함하고, main의 generated job이 저장합니다. 이후 일반 빌드는 로컬 SVG만 사용합니다. 취득 실패·해시 불일치·위험한 SVG는 오류로 종료하며 대체 로고를 만들어 성공으로 처리하지 않습니다. 기존 manifest와 다른 출처로 바꾸려면 사람이 출처·라이선스·변경 원본을 검토해야 합니다.

## 확인 방법

```sh
npm test
npm run release
```

일반 브라우저 검사와 별도로 5개 프로젝트 × 3개 화면 폭, 실제 SVG 다운로드, 텍스트 대안, SVG의 텍스트 폭, 내장 원본 로고, 외부 이미지 요청 부재를 확인합니다. 실행 결과와 PNG 검토본은 `test-results/architecture/`에 기록됩니다. 스크립트 존재와 실제 통과는 별개이며 해당 커밋의 CI 결과를 확인해야 합니다.

SVG는 로고 이미지를 내부에 포함하므로 개별 다운로드 후에도 CDN 연결 없이 표시됩니다. 작은 화면에서는 다이어그램 영역만 가로로 스크롤되며 페이지 자체는 넘치지 않습니다. 원본 새 탭 열기, SVG 다운로드, 키보드 스크롤, 텍스트 대안을 제공합니다.
