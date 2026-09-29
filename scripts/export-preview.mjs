/** Single-file offline preview. The deployed site remains ordinary static HTML. */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadContent } from '../src/lib/content.mjs';
import { basePath, esc } from '../src/lib/render.mjs';
const root = process.cwd();
const dir = path.resolve(process.env.PREVIEW_DIR || 'dist-static');
const { profile, projects, config } = await loadContent(root);
const routes = [['/', 'index.html'], ['/resume/', 'resume/index.html'], ['/404.html', '404.html'],
  ...projects.map(p => [`/projects/${p.data.id}/`, `projects/${p.data.id}/index.html`])];
const pages = {};
for (const [route, file] of routes) {
  const html = await readFile(path.join(dir, file), 'utf8');
  const body = html.match(/<body([^>]*)>([\s\S]*)<\/body>/);
  if (!body) throw Error(`Missing body in ${file}`);
  pages[route] = { html: body[2], className: /class="([^"]*)"/.exec(body[1])?.[1] || '',
    title: /<title>(.*?)<\/title>/.exec(html)?.[1] || profile.name };
}
const styles = (await Promise.all(['site.css', 'resume.css'].map(f => readFile(path.join(dir, 'styles', f), 'utf8')))).join('\n');
const app = await readFile(path.join(dir, 'app.js'), 'utf8');
const pdf = (await readFile(path.join(dir, 'resume.pdf'))).toString('base64');
const favicon = (await readFile(path.join(dir, 'favicon.svg'))).toString('base64');
const json = JSON.stringify({ pages, base: basePath(config.base), pdf }).replace(/</g, '\\u003c');
const runtime = `(() => {
 const data=JSON.parse(document.getElementById('preview-data').textContent);
 let current='/', pdfUrl;
 const pdfBytes=Uint8Array.from(atob(data.pdf),c=>c.charCodeAt(0));
 pdfUrl=URL.createObjectURL(new Blob([pdfBytes],{type:'application/pdf'}));
 function parseHash(){const [route,anchor='']=location.hash.slice(1).split('#');return {route:route||'/',anchor};}
 function render(){
   const {route,anchor}=parseHash();
   current=data.pages[route]?route:'/404.html';
   const page=data.pages[current];
   document.body.innerHTML=page.html;
   document.body.className=page.className;
   document.title=page.title+' · 미리보기';
   document.querySelector('meta[name="color-scheme"]').content=page.className?'light':'dark';
   document.querySelectorAll('a[href]').forEach(a=>{
     if(a.getAttribute('href')===data.base+'/resume.pdf'){
       a.href=pdfUrl;a.download='정유빈_이력서.pdf';
     }
   });
   if(window.unenInitialize)window.unenInitialize();
   requestAnimationFrame(()=>{
     const target=anchor?document.getElementById(decodeURIComponent(anchor)):null;
     target?target.scrollIntoView({behavior:'instant'}):window.scrollTo({top:0,behavior:'instant'});
   });
 }
 document.addEventListener('click',event=>{
   if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const a=event.target.closest('a[href]');if(!a||a.target==='_blank'||a.hasAttribute('download'))return;
   const raw=a.getAttribute('href');let next;
   if(raw.startsWith('#'))next=current+raw;
   else if(raw.startsWith(data.base+'/'))next=raw.slice(data.base.length);
   else return;
   event.preventDefault();const hash='#'+next;
   if(location.hash===hash)render();else location.hash=hash;
 });
 window.addEventListener('hashchange',render);
 window.addEventListener('pagehide',()=>URL.revokeObjectURL(pdfUrl),{once:true});
 render();
})();`;
const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="dark"><meta name="robots" content="noindex,nofollow"><title>${esc(profile.name)} (${esc(profile.handle)}) · 포트폴리오 미리보기</title><link rel="icon" href="data:image/svg+xml;base64,${favicon}"><style>${styles}</style></head><body><noscript>이 단일 파일 미리보기는 JavaScript가 필요합니다. 정식 정적 사이트는 JavaScript 없이도 내용을 읽을 수 있습니다.</noscript><script id="preview-data" type="application/json">${json}</script><script>${app}\n${runtime}</script></body></html>`;
await writeFile(path.join(root, 'preview.html'), html);
console.log(`Portable preview: ${routes.length} pages and embedded PDF -> preview.html`);
