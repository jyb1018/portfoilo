/** Public, logical architecture maps. A box is a responsibility, not necessarily a service. */
const node=(id,x,y,title,lines,logos=[],tag='',pending=false)=>({id,x,y,w:x===444?352:304,h:134,title,lines,logos,tag,pending});
const edge=(from,to,path,label,x,y,pending=false)=>({from,to,path,label,x,y,pending});
const groups=(a,b,c)=>[a,b,c].map((label,i)=>({x:[24,424,880][i],y:164,w:[344,392,344][i],h:640,label}));
const stage=(title,detail,logos)=>({title,detail,logos});
export const diagrams=[
{
 id:'pokeros',title:'PokerOS',subtitle:'명령의 검증, 확정 상태의 전파, 영속 데이터의 복구를 분리했습니다.',
 scope:'논리 구성 · 배포 규모와는 구분합니다',
 groups:groups('CLIENT / 운영 화면','APPLICATION / 요청 처리','DATA / 상태와 영속 데이터'),
 nodes:[
  node('operator',44,230,'React · Vite',['운영자 웹 / 테이블 · 좌석 · 딜러','권한 범위에 맞는 화면과 명령'],['react','vite'],'WEB'),
  node('ingress',444,230,'Nginx',['정적 프론트엔드 · 동일 출처 프록시','/api · /socket.io'],['nginx'],'INGRESS'),
  node('objects',900,230,'Cloudflare R2',['배경 이미지 · 오브젝트 저장','AWS SDK의 S3 호환 API'],['cloudflare'],'OBJECT STORAGE'),
  node('clock',44,440,'React · 공개 클락',['읽기 전용 포커 클락 화면','권한·토큰 범위의 상태 조회 / 구독'],['react'],'DISPLAY'),
  node('app',444,440,'Node.js · Express',['세션 / 권한 · 업무 명령 검증','Socket.IO: 확정 스냅샷 전파'],['nodejs','express','socketio'],'SERVER'),
  node('runtime',900,440,'Redis',['운영 상태 · 세션 · Pub/Sub','operation lock · Lua CAS'],['redis'],'RUNTIME AUTHORITY'),
  node('reconnect',44,650,'재접속 · 동기화 정책',['room 재가입 → HTTP snapshot','동기화 전까지 변경 UI를 잠급니다'],[],'CLIENT RULE'),
  node('persistence',444,650,'Prisma',['서버 내부의 영속화 계층','명령 · 이벤트 · checkpoint'],['prisma'],'DATA ACCESS'),
  node('postgres',900,650,'PostgreSQL',['계정 / 업무 메타데이터','복구용 journal · snapshot'],['postgresql'],'DURABLE STORE')
 ],
 edges:[
  edge('operator','ingress','M348 297H444','HTTP',396,283),
  edge('ingress','app','M620 364V440','/api',646,408),
  edge('app','operator','M444 466H390V398H196V364','Socket.IO · 확정 상태',254,390),
  edge('app','clock','M444 526H348','조회 / 구독',397,516),
  edge('app','runtime','M796 515H900','검증 / 확정',848,501),
  edge('app','objects','M796 467H848V297H900','S3 API',849,397),
  edge('app','persistence','M620 574V650','영속화',647,617),
  edge('persistence','postgres','M796 717H900','SQL',848,703)
 ],
 railTitle:'BUILD & DELIVERY / 애플리케이션과 구분한 배포 구성',
 rail:[stage('GitHub Actions','CI 검증 · 이미지 빌드',['githubactions']),stage('Docker','서버 / 웹 컨테이너',['docker']),stage('AWS','개발·운영 배포 경계 분리',['aws'])],
 notes:[
  ['명령과 알림','HTTP로 변경을 요청하고 서버가 확정한 상태만 Socket.IO로 전파합니다.'],
  ['데이터의 권위','Redis 운영 상태와 PostgreSQL 복구 기록의 역할을 구분합니다. Prisma는 서버 내부 라이브러리입니다.'],
  ['연결과 복구','연결 성공만으로 동기화를 완료하지 않습니다. 구독과 snapshot 복구가 끝난 뒤 변경 UI를 엽니다.']
 ],
 boundary:'실제 서버 수, 운영 위치, 계정과 네트워크 주소는 생략했습니다. 배포 구성의 존재를 모든 기능의 운영 배포 완료로 해석하지 않습니다.',
 evidence:['서버 package.json','아키텍처·실시간 동기화 명세','README의 Docker·AWS 배포 구성']
},
{
 id:'pokerplus',title:'PokerPlus',subtitle:'플레이어 서비스가 소유한 데이터와 외부 시스템의 권한을 분리했습니다.',
 scope:'외부 점선 경로는 전체 실연동 증명이 아닙니다',
 groups:groups('CLIENT / 서비스 접점','APPLICATION / 자체 구현','EXTERNAL & DATA / 경계'),
 nodes:[
  node('player',44,230,'React · Vite',['플레이어 웹 / 대회 · 공지','신청 · 취소 · 내 정보'],['react','vite'],'PLAYER WEB'),
  node('api',444,230,'Node.js · Express',['/api/v1 · API-first JSON 계약','세션 인증 · CSRF · 요청 ID'],['nodejs','express'],'HTTP API'),
  node('member',900,230,'회원 관리 API',['어댑터 소스 · 신뢰 경계 구현','유효 로그인 전체 증거는 별도'],[],'EXTERNAL / GATED',true),
  node('admin',44,440,'React · 관리자 화면',['등록 / 취소 검토 · 대회 공개','공지 발행 · 감사 내역'],['react'],'ADMIN WEB'),
  node('services',444,440,'권한 · DTO · 업무 서비스',['플레이어 안전 데이터로 투영','등록 / 취소 · 공지 · 감사 기록'],[],'SAME SERVER'),
  node('operating',900,440,'PokerOS 연동 경계',['계약 · 주입 가능한 어댑터','실제 동기화 / live status는 별도'],[],'SOURCE / GATED',true),
  node('ownership',44,650,'직접 데이터 접근을 피합니다',['운영 시스템의 DB / Redis를','직접 읽거나 수정하지 않습니다'],[],'OWNERSHIP RULE'),
  node('prisma',444,650,'Prisma',['repository 경계 · migration','자체 세션 / 신청 / 감사 영속화'],['prisma'],'DATA ACCESS'),
  node('db',900,650,'PostgreSQL',['플레이어 서비스 자체 데이터','공개 read model · 감사 이벤트'],['postgresql'],'OWNED STORE')
 ],
 edges:[
  edge('player','api','M348 297H444','HTTP / JSON',396,283),
  edge('admin','services','M348 507H444','관리 API',396,493),
  edge('api','services','M620 364V440','권한 검증',655,408),
  edge('api','member','M796 297H900','어댑터',848,283,true),
  edge('services','operating','M796 507H900','계약 경계',848,493,true),
  edge('services','prisma','M620 574V650','업무 저장',655,617),
  edge('prisma','db','M796 717H900','SQL',848,703)
 ],
 railTitle:'LOCAL VERIFICATION / 외부 시스템 없이 검증하는 자체 기능',
 rail:[stage('Docker Compose','격리된 PostgreSQL 테스트 DB',['docker']),stage('실제 API + DB','mock 경계와 실 DB 검증 분리',['nodejs','postgresql']),stage('Playwright','공개 / 로컬 세션 E2E',['playwright'])],
 notes:[
  ['자체 기능의 완료 범위','플레이어·관리자 기능과 자체 PostgreSQL 저장 경로를 외부 통합과 분리합니다.'],
  ['외부 경계는 점선으로','회원 인증과 운영 시스템의 계약·소스 구현을 전체 실연동 완료처럼 표시하지 않습니다.'],
  ['로컬 E2E의 의미','실제 Express·브라우저·PostgreSQL 검증은 외부 로그인 제공자와 운영 데이터 동기화 성공의 증거가 아닙니다.']
 ],
 boundary:'앱 전체의 공개 운영, 외부 시스템 동기화, 결제·정산 완료를 주장하지 않습니다. 점선은 일반 런타임의 확정된 연결이 아닌 별도 검증 경계입니다.',
 evidence:['서버 package.json','현재 구현 상태 목록','인증·API 계약 및 로컬 E2E 명세']
},
{
 id:'monitorcontrol',title:'MonitorControl',subtitle:'관리 명령, 기기의 실제 적용 상태, 미디어 전송 경로를 분리했습니다.',
 scope:'4개 매장 사용 · 그중 한 매장 38대',
 groups:groups('CONTROL & CONTENT / 관리','BACKEND / 정책과 영속화','DEVICE / Android TV 런타임'),
 nodes:[
  node('web',44,230,'React · Vite',['중앙 관리자 웹','기기 승인 · 정책 · 콘텐츠 관리'],['react','vite'],'ADMIN'),
  node('server',444,230,'Node.js · Express · ws',['TypeScript API · 기기 인증','명령 전달 / heartbeat / 로그'],['nodejs','typescript','express'],'CONTROL API'),
  node('android',900,230,'Kotlin · Android TV',['OkHttp: HTTP / WebSocket','정책 적용 · 상태 / 오류 보고'],['kotlin','android'],'NATIVE CLIENT'),
  node('storage',44,440,'Cloudflare R2 / S3 API',['서명 URL 기반 직접 업로드','미디어 / APK 오브젝트 배포'],['cloudflare'],'OBJECT STORAGE'),
  node('database',444,440,'Prisma · PostgreSQL',['기기 · 정책 · manifest metadata','목표 상태와 보고 상태 관리'],['prisma','postgresql'],'PERSISTENCE'),
  node('playback',900,440,'Media3 · WebView',['ExoPlayer 사이니지 재생','웹 포커 클락 · 검증된 로컬 캐시'],['android'],'PLAYBACK'),
  node('target',44,650,'목표 ≠ 적용 완료',['서버의 목표 정책과 기기가','보고한 적용 상태를 구분합니다'],[],'OPERATING RULE'),
  node('runtime',444,650,'Docker · AWS EC2',['서버 / 관리자 웹 / APK 배포','개발·운영 설정과 배포를 분리'],['docker','aws'],'DEPLOYMENT CONFIG'),
  node('offline',900,650,'오프라인에서도 이어집니다',['마지막 유효 콘텐츠를 유지','재접속 · heartbeat로 상태 회복'],[],'DEVICE RULE')
 ],
 edges:[
  edge('web','server','M348 286H444','관리 REST',396,272),
  edge('server','android','M796 280H900','WebSocket',848,266),
  edge('android','server','M900 331H796','heartbeat',848,352),
  edge('server','database','M620 364V440','SQL',648,408),
  edge('web','storage','M196 364V440','서명 PUT',236,408),
  edge('android','playback','M1052 364V440','정책 적용',1090,408),
  edge('storage','playback','M196 574V611H1052V574','미디어 다운로드 / 무결성 확인',620,602)
 ],
 railTitle:'RELEASE PIPELINE / 변경된 배포 대상과 Android 빌드를 구분합니다',
 rail:[stage('GitHub Actions','서버 · 웹 · Android 검증',['githubactions']),stage('Docker / Gradle','이미지 · Android APK 빌드',['docker','android']),stage('배포 · 업데이트','운영 스크립트 · APK 메타데이터',['aws'])],
 notes:[
  ['서버를 거치지 않는 업로드','관리자 웹은 인증 후 서명 URL을 받아 오브젝트 저장소에 직접 업로드합니다. 서버는 완료 시 메타데이터를 확인합니다.'],
  ['실시간 채널과 보고 경로','ws 기반 WebSocket으로 명령을 전달하고, HTTP heartbeat로 실제 기기 상태와 적용 결과를 확인합니다.'],
  ['오프라인 재생','연결이 끊겨도 마지막 유효 콘텐츠를 유지합니다. 기기의 재생 계층과 서버의 목표 정책을 별도 책임으로 다룹니다.']
 ],
 boundary:'4개 매장 / 한 매장 38대는 확인된 사용 범위입니다. 그림의 기기 박스는 앱의 논리 역할이며 전체 기기 수를 뜻하지 않습니다. MQTT·IoT Core는 구현 경로로 넣지 않았습니다.',
 evidence:['서버 package.json','Android Gradle 의존성','아키텍처의 업로드·기기 제어·배포 항목','본인이 확인한 매장 사용 범위']
},
{
 id:'poker-ocr-overlay',title:'PokerOCROverlay',subtitle:'인식 결과를 제품 상태로 변환한 뒤 React 오버레이와 OBS로 전달합니다.',
 scope:'source-scoped MVP · 범용 인식 검증과 구분',
 groups:groups('INPUT & PRESENTATION / 입출력','INFERENCE & STATE / 처리','ADAPTER & VALIDATION / 연결'),
 nodes:[
  node('capture',44,230,'카메라 · 영상 리플레이',['영상 프레임 입력','검증 시 해시 고정된 소스 사용'],[],'CAPTURE'),
  node('recognition',444,230,'Python · OpenCV · PyTorch',['카드 탐지 / 인식 · 상태 추적','프로필별 모델 · 임계값'],['python','opencv','pytorch'],'OCR PIPELINE'),
  node('ocrApi',900,230,'FastAPI · Uvicorn',['Python OCR 상태 제공','/ws/state WebSocket'],['fastapi'],'PYTHON SERVER'),
  node('react',44,440,'React · Vite',['방송 오버레이 / 제어 화면','수동 보정 우선 상태 표시'],['react','vite'],'FRONTEND'),
  node('broadcast',444,440,'Node.js · Express · ws',['Broadcast API · 이벤트 / projection','수동 보정과 OCR 상태를 통합'],['nodejs','express'],'BROADCAST SERVER'),
  node('bridge',900,440,'OCR Bridge CLI',['TypeScript / Node.js 어댑터','OCR 상태 → 방송 이벤트'],['typescript','nodejs'],'BRIDGE'),
  node('obs',44,650,'OBS Studio',['Browser Source로 오버레이 표시','방송 / 녹화 화면 합성'],['obs'],'OUTPUT'),
  node('db',444,650,'Prisma · SQLite',['방송 세션 · 핸드 이벤트','overlay snapshot 영속화'],['prisma','sqlite'],'BROADCAST STORE'),
  node('evaluation',900,650,'리플레이 · 제품 경로 평가',['Python / 브라우저 기반 검증','정확도 · 안정성 · end-to-end 지연'],['python','playwright'],'OFFLINE VERIFICATION')
 ],
 edges:[
  edge('capture','recognition','M348 297H444','프레임',396,283),
  edge('recognition','ocrApi','M796 297H900','인식 상태',848,283),
  edge('ocrApi','bridge','M1052 364V440','WebSocket',1091,408),
  edge('bridge','broadcast','M900 506H796','방송 이벤트',848,492),
  edge('broadcast','react','M444 483H348','WS 상태',396,469),
  edge('react','broadcast','M348 547H444','보정 명령',396,567),
  edge('react','obs','M196 574V650','브라우저',233,618),
  edge('broadcast','db','M620 574V650','SQL',650,618)
 ],
 railTitle:'VERIFICATION LOOP / 런타임 처리와 별도로 검증합니다',
 rail:[stage('고정 리플레이','소스·프로필·모델 조건 고정',['python']),stage('실패 사례 · 지표','정확도 / 안정성 / 지연 분리',['opencv']),stage('제품 경로 검증','인식 → API → 실제 브라우저',['playwright'])],
 notes:[
  ['서로 다른 두 런타임','Python 인식 서버와 Node.js 방송 API는 OCR Bridge를 통해 연결됩니다. 인식 결과를 화면에 바로 던지는 구조가 아닙니다.'],
  ['수동 보정의 우선순위','방송 API에서 이벤트를 제품 상태로 투영하고, React가 수동 보정 우선순위를 반영한 상태를 표시합니다.'],
  ['범위가 있는 검증','고정 소스의 MVP와 범용 52장 인식 성능을 구분합니다. 오프라인 평가 박스는 항상 가동되는 실시간 서버가 아닙니다.']
 ],
 boundary:'모델 학습·일반화 검증과 제품 런타임을 구분했습니다. 제한된 소스의 통과 결과를 범용 인식 정확도나 모든 환경의 지연 성능으로 확장하지 않습니다.',
 evidence:['README의 OCR Bridge·Broadcast API 경로','Python requirements','Broadcast API package.json·Prisma schema']
},
{
 id:'ai-development-harness',title:'AI Development Harness',subtitle:'공통 규칙과 프로젝트 고유 규칙을 보존하며, 필요한 도구만 선택합니다.',
 scope:'프로젝트 로컬 지침·CLI · 상시 서버가 아닙니다',
 groups:groups('DISTRIBUTION / 설치와 갱신','PROJECT LOCAL / 지침과 라우팅','HOST / 도구와 실행 증거'),
 nodes:[
  node('git',44,230,'Git Submodule',['소스 revision 고정','stable / edge / pinned 정책'],['git'],'SOURCE PACKAGE'),
  node('rules',444,230,'AGENTS · CORE · Skills',['Markdown 지침 · 모델 프로필','목표 / 권한 / 검증의 공통 경계'],['markdown'],'LOCAL RULES'),
  node('host',900,230,'AI 코딩 호스트',['프로젝트 지침을 필요할 때 로드','도구 노출·인증·승인은 호스트 책임'],['bash'],'EXECUTION HOST'),
  node('wrapper',44,440,'Python Wrapper CLI',['install · status · pull · upgrade','충돌 확인 · dry-run · 복구'],['python'],'LIFECYCLE'),
  node('router',444,440,'tooling.py · 선택형 스킬',['doctor / capability 라우팅','없는 기능은 명시적 fallback'],['python'],'READ-ONLY DISCOVERY'),
  node('tools',900,440,'호스트 도구 · MCP',['CLI / 브라우저 / GitHub 등','노출·인증·권한이 확인된 도구만'],['playwright','github'],'OPTIONAL CAPABILITIES',true),
  node('domain',44,650,'프로젝트 고유 규칙',['런타임 / 도메인 계약은 보존','전역 설정을 자동 변경하지 않습니다'],[],'LOCAL OWNERSHIP'),
  node('verification',444,650,'테스트 · 리뷰 · 재검증',['프로젝트에 맞는 검사 명령','설치 여부와 실제 실행 성공을 구분'],['git'],'VERIFICATION'),
  node('evidence',900,650,'실행 증거 · 변경 기록',['검증 결과 · diff · 기준점','미실행 / 실패 / 한계를 명시합니다'],['markdown'],'REPORT')
 ],
 edges:[
  edge('git','wrapper','M196 364V440','소스 고정',232,408),
  edge('wrapper','rules','M348 477H393V297H444','설치 / 갱신',394,391),
  edge('rules','host','M796 297H900','필요 시 로드',848,283),
  edge('rules','router','M620 364V440','작업별 선택',660,408),
  edge('router','tools','M796 507H900','권한 확인',848,493,true),
  edge('host','tools','M1052 364V440','호스트 제공',1092,408,true),
  edge('router','verification','M620 574V650','검증 선택',657,618),
  edge('verification','evidence','M796 717H900','결과 기록',848,703)
 ],
 railTitle:'BOUNDARIES / 자동화를 늘리기보다 실행 경계를 명확하게 합니다',
 rail:[stage('공통 코어','얇은 지침 · 선택형 스킬',['markdown']),stage('프로젝트별 검증','도메인 테스트 / 로컬 규칙 유지',['python']),stage('Git 기반 변경','관리 파일 충돌 확인 · 이력',['git'])],
 notes:[
  ['하네스는 별도 AI 서버가 아닙니다','로컬 지침·스킬·CLI를 배포하는 패키지입니다. 별도의 중앙 오케스트레이터나 외부 API가 항상 가동되는 것처럼 표현하지 않습니다.'],
  ['도구는 선택적으로 연결됩니다','Playwright·GitHub 등은 작업과 호스트 환경에 따라 선택됩니다. 로고는 사용 가능한 도구의 예시이며 항상 설치·실행된다는 뜻이 아닙니다.'],
  ['공통화의 경계','목표·권한·검증 규칙은 공통화하되, 각 프로젝트의 도메인 계약과 테스트는 그대로 남깁니다.']
 ],
 boundary:'특정 호스트의 모든 도구 사용이나 모델 성능 향상을 인증하지 않습니다. 점선은 호스트에서 제공·허용될 때만 가능한 선택 경로입니다.',
 evidence:['README의 3.0 구조·선택형 도구 계약','lifecycle wrapper 안내','설치 상태와 실행 증거의 분리 원칙']
}
];
export const getDiagram=id=>diagrams.find(d=>d.id===id);
