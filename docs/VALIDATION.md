# 검증 기록

검증일: 2026.09.29

## 검증 대상과 실행 증거

- 소스 커밋: `363a2b2047f73cabee8eedbda4174df9c259660f`
- GitHub Actions 실행: https://github.com/jyb1018/portfoilo/actions/runs/36542260761
- build job: `109320232843` — 성공
- generated job: `109320628548` — 성공
- 생성 파일 저장 커밋: `59886dabc20550b3a289eb909529fa3d1e904434`
- deploy job: `109320628382` — 실패, Pages 배포 생성 API 404

문서만 갱신하는 이 커밋은 CI를 재실행하지 않습니다. 아래 성공 결과는 위 소스 커밋에 대한 결과이며, 사이트가 이미 공개되었다는 의미가 아닙니다.

## 완료한 확인

| 항목 | 실제 결과 |
| --- | --- |
| Node.js / npm | GitHub runner에서 24.21.0 / 11.19.0 실행 |
| 의존성 설치 | 잠금 파일 생성 후 npm ci 성공 |
| 콘텐츠·공개 경계·배포 경로 테스트 | 25개 통과, 실패 0 |
| Astro check | 20개 파일, 오류 0 / 경고 0 / 힌트 0 |
| Astro 정적 빌드 | 8페이지 생성 성공 |
| 이력서 PDF | 공유 콘텐츠에서 생성, public과 배포 artifact에 포함 |
| 링크/자산 검사 | 18개 파일, 내부 링크 93개 통과 |
| 실제 HTTP 브라우저 검증 | 19개 통과, 페이지 JavaScript 오류 0 |
| 루트 도메인 경로 | 별도 정적 내보내기 및 링크 93개 검사 통과 |
| 생성 파일 보존 | package-lock.json, public/resume.pdf, public/og.png를 main에 저장 |

브라우저 검증은 홈 320/360/390/768/1024/1440px, 사례 5개×360/1440px, 실제 링크 클릭, 인쇄 버튼, PDF 응답 바이트, 404를 포함합니다. 검증 결과는 `portfolio-verified` artifact의 `test-results/browser.json`에 있습니다.

CI에서 생성한 PDF의 SHA-256은 `5f8d5a48eff0a284e515e3c1b18050b338fa0b784bcabc0a96e4fe9b52d81304`입니다. 내려받아 두 페이지를 이미지로 렌더링하고, 겹침·잘림과 **건국대학교 · 컴퓨터공학부 · 2027년 2월 졸업예정** 표시를 확인했습니다.

## 남은 공개 배포 설정

빌드와 artifact 업로드는 성공했지만 `actions/deploy-pages`의 배포 생성 요청이 404로 실패했습니다. 로그는 GitHub Pages 활성화를 확인하도록 안내합니다.

1. 저장소 Settings → Pages → Build and deployment → Source를 **GitHub Actions**로 설정합니다.
2. Actions → **Portfolio - verify and deploy** → **Run workflow**에서 main을 실행합니다.
3. deploy job 성공 및 반환된 실제 page_url을 확인합니다.

현재 연결에서 저장소 이름은 `portfoilo`로 반환됩니다. CI는 실제 `GITHUB_REPOSITORY`를 읽으므로, 이후 이름을 `portfolio`로 바꾸면 다음 빌드의 경로도 새 이름을 따릅니다. 개인 도메인은 `site.config.json`과 GitHub Pages 설정·DNS를 함께 변경해야 합니다.

## 비차단 경고와 제한

- Astro 타입 검사에는 경고가 없었으나, 빌드 번들러에서 MDX의 `use astro:head-inject` 지시문 관련 경고 5개가 나왔습니다. 현재 사례 본문은 생성되었고 브라우저 검증도 통과했습니다. 추후 MDX에 추가 스타일·스크립트를 넣을 때 자산 전파를 다시 확인해야 합니다. 경고를 필터링하여 숨기지 않았습니다.
- 일부 GitHub Actions의 Node 20 런타임 지원 종료 안내가 나왔지만 runner에서 Node 24로 실행되어 현재 작업은 통과했습니다.
- 로컬 컨테이너의 npm 접근과 브라우저 HTTP 접근은 제한되어 있습니다. 로컬 인라인 HTML 화면 확인을 실제 HTTP 검증으로 표시하지 않았습니다. 정식 컴파일·실제 HTTP 검증의 증거는 GitHub runner 결과입니다.
- 한국어 글꼴이 다른 OS에서는 PDF 줄바꿈이 달라질 수 있습니다. 글꼴 파일 자체는 저장소나 artifact에 포함하지 않습니다.

## 콘텐츠와 익명화

졸업예정은 본인이 확인한 2027년 2월을 공유 프로필에 반영했습니다. 회사·운영 위치·내부 저장소는 공개하지 않습니다. 사이트와 PDF의 문구 및 출력 파일을 별도로 확인했습니다. 공개 가능한 추가 성과 수치나 구체적인 현업 협업 일화는 확인된 자료만 추가합니다.
