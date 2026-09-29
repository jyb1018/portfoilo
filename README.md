# 정유빈 (unen) · Portfolio

AI-Native Software Engineer의 한국어 웹 포트폴리오와 A4 2페이지 이력서입니다. 다크 기본안, 5개 사례 상세, 실무 프로젝트 익명화, 반응형 화면을 제공합니다.

## 개발과 검증

Node.js 24를 사용합니다. 의존성 잠금 파일이 있으면 `npm ci`, 최초 생성 시에만 `npm install`을 실행하세요.

```sh
npm install
npx playwright install chromium
npm run dev
```

로컬 주소는 `http://localhost:4321/portfolio/`입니다. Linux에서 PDF를 생성할 때는 시스템 한국어 폰트가 필요합니다. CI에서는 `fonts-noto-cjk`를 설치하며, 폰트 파일은 저장소나 웹에 배포하지 않습니다.

```sh
npm test
npm run release
```

`release`는 공유 이미지 생성 → Astro 타입 검사/빌드 → PDF 재생성 → 내부 링크 검사 → 실제 HTTP 브라우저 검증을 실행합니다. 빌드 성공과 실제 Pages 배포 성공은 별개입니다. 결과는 Actions의 build/deploy job에서 각각 확인하세요.

## 편집 위치

| 내용 | 파일 |
| --- | --- |
| 이름·소개·연락처·학교·졸업예정 | `content/profile.json` |
| 프로젝트 요약·순서·이력서 문단 | `content/projects/*.mdx`의 frontmatter |
| 프로젝트 상세 | 같은 MDX 파일의 본문 |
| 디자인 | `public/styles/site.css` |
| 인쇄 스타일 | `public/styles/resume.css` |
| 사이트/도메인 | `site.config.json` |
| 공통 레이아웃 | `src/lib/render.mjs` |

졸업예정은 본인 확인에 따라 `graduationYear: 2027`, `graduationMonth: 2`이며 웹과 PDF에 **2027년 2월 졸업예정**으로 표시됩니다. 연도만 공개할 때는 월을 `null`, 미확정이면 둘 다 `null`로 두세요.

웹과 이력서는 같은 콘텐츠를 사용합니다. PDF는 이미 출력된 바이너리를 직접 수정하지 말고 콘텐츠 수정 후 다시 생성하세요. 실무·개인 프로젝트가 크게 늘어나면 2페이지 구성을 조정해야 합니다. 하단과 본문이 겹치면 PDF 생성이 실패합니다.

## GitHub Pages

저장소 Settings → Pages → Build and deployment → Source를 **GitHub Actions**로 선택하세요. `main` push 또는 Actions의 수동 실행으로 빌드·검증·배포합니다. 저장소 접근권한과 Pages 최초 활성화 권한은 별개입니다.

CI는 `GITHUB_REPOSITORY`에서 실제 소유자와 저장소명을 읽어 사이트 경로를 결정하므로 이름 변경 후에도 다음 빌드가 새 경로를 사용합니다. 로컬 기본값은 `https://jyb1018.github.io/portfolio/`입니다. `unen.github.io`는 GitHub 계정명이 `unen`인 경우의 주소이며, 표시 닉네임으로 임의 사용할 수 있는 주소가 아닙니다.

빌드 성공 시 별도 `generated` job이 검증된 `package-lock.json`, `public/resume.pdf`, `public/og.png`만 main에 일반 커밋합니다. 동시 변경을 덮어쓰는 force push는 사용하지 않습니다. 이 job은 PR에서는 실행하지 않습니다. 웹과 PDF는 Pages artifact에도 함께 포함됩니다. 다운로드 가능한 검증 결과는 `portfolio-verified` artifact에 보존됩니다.

## 개인 도메인

사용자가 도메인을 연결할 때 아래 세 값을 함께 변경하세요.

```json
{
  "site": "https://your-domain.example",
  "base": "/",
  "customDomain": "your-domain.example"
}
```

실제 소유 도메인으로 바꾼 뒤 GitHub Pages Custom domain과 DNS를 설정하세요. DNS CNAME 대상은 `jyb1018.github.io`이며 저장소 경로를 붙이지 않습니다. `customDomain`이 설정되면 저장소명 기반 자동 경로보다 우선합니다. GitHub Actions 배포에서는 CNAME 파일만으로 Pages 설정을 대신할 수 없습니다.

공식 안내: https://docs.astro.build/en/guides/deploy/github/

## 의존성 없는 정적 미리보기

```sh
node scripts/build-static.mjs
node scripts/serve.mjs
```

정식 Astro 경로와 같은 콘텐츠와 HTML 표현 함수를 사용하는 경량 내보내기입니다. 현재 본문의 제목·문단·목록·강조·인라인 코드만 지원하며, JSX/import/표 등은 조용히 생략하지 않고 거부합니다. 고급 MDX는 정식 Astro 빌드를 사용하세요.

PDF와 공유 PNG는 생성된 파일입니다. 최초 checkout에서 없다면 네트워크가 되는 환경에서 `npm run release`를 먼저 수행하거나 성공한 CI artifact를 받으세요. 경량 빌드 자체는 PDF를 재생성하지 않습니다.

```sh
PREVIEW_DIR=dist-static npm run resume
AUDIT_DIR=dist-static npm run audit
npm run export:preview
```

`preview.html`은 별도 브라우저에서 열 수 있는 단일 파일 미리보기입니다. 생성 파일이므로 직접 편집하거나 버전 관리하지 않습니다.

## 공개 정보와 수치

회사명, 내부 도메인, 운영 위치, 원본 저장소 링크를 공개하지 않습니다. 실제 화면 대신 명시적으로 표시한 개념도를 사용합니다. 공개 링크는 GitHub 프로필과 공개 하네스 저장소만 허용합니다. MonitorControl은 **4개 매장 사용 / 그중 한 매장 38대**이며 전체 합계나 성능 개선율이 아닙니다.

```sh
PRIVATE_TERMS="금지문자열1,금지문자열2" AUDIT_DIR=dist npm run audit
```

비공개 검사 목록 자체를 커밋하지 마세요. PDF 텍스트와 실제 화면으로 교체하는 이미지는 별도로 점검해야 합니다. 미확인 성과·협업 일화는 추가하지 않았습니다. `docs/CONTENT_REVIEW.md`와 `docs/VALIDATION.md`를 참고하세요.
