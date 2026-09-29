// Source revisions are pinned. SVGs are downloaded once, reviewed and committed.
export const deviconRef='54cfe13ac10eaa1ef817a343ab0a9437eb3c2e08';
export const simpleIconsRef='d4e6ba93e48f178898707f0145ec285f28b64b38';
const dev=(id,name,file)=>({id,name,source:`https://raw.githubusercontent.com/devicons/devicon/${deviconRef}/icons/${file}`,project:'Devicon',license:'MIT'});
export const brands=[
 dev('react','React','react/react-original.svg'),
 dev('vite','Vite','vitejs/vitejs-original.svg'),
 dev('nodejs','Node.js','nodejs/nodejs-original.svg'),
 dev('express','Express','express/express-original.svg'),
 dev('socketio','Socket.IO','socketio/socketio-original.svg'),
 dev('nginx','Nginx','nginx/nginx-original.svg'),
 dev('redis','Redis','redis/redis-original.svg'),
 dev('postgresql','PostgreSQL','postgresql/postgresql-original.svg'),
 dev('prisma','Prisma','prisma/prisma-original.svg'),
 dev('cloudflare','Cloudflare','cloudflare/cloudflare-original.svg'),
 dev('docker','Docker','docker/docker-original.svg'),
 dev('aws','Amazon Web Services','amazonwebservices/amazonwebservices-original-wordmark.svg'),
 dev('githubactions','GitHub Actions','githubactions/githubactions-original.svg'),
 dev('typescript','TypeScript','typescript/typescript-original.svg'),
 dev('kotlin','Kotlin','kotlin/kotlin-original.svg'),
 dev('android','Android','android/android-original.svg'),
 dev('python','Python','python/python-original.svg'),
 dev('opencv','OpenCV','opencv/opencv-original.svg'),
 dev('pytorch','PyTorch','pytorch/pytorch-original.svg'),
 dev('fastapi','FastAPI','fastapi/fastapi-original.svg'),
 dev('sqlite','SQLite','sqlite/sqlite-original.svg'),
 dev('playwright','Playwright','playwright/playwright-original.svg'),
 dev('git','Git','git/git-original.svg'),
 dev('github','GitHub','github/github-original.svg'),
 dev('markdown','Markdown','markdown/markdown-original.svg'),
 dev('bash','Bash','bash/bash-original.svg'),
 {id:'obs',name:'OBS Studio',source:`https://raw.githubusercontent.com/simple-icons/simple-icons/${simpleIconsRef}/icons/obsstudio.svg`,project:'Simple Icons',license:'CC0-1.0'}
];
export const licenses=[
 {file:'DEVICON-LICENSE.txt',source:`https://raw.githubusercontent.com/devicons/devicon/${deviconRef}/LICENSE`},
 {file:'SIMPLE-ICONS-LICENSE.txt',source:`https://raw.githubusercontent.com/simple-icons/simple-icons/${simpleIconsRef}/LICENSE.md`}
];
