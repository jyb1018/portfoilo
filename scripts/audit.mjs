import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {loadContent} from '../src/lib/content.mjs';
import {href} from '../src/lib/render.mjs';
const root=path.resolve(process.env.AUDIT_DIR||'dist');
const {profile,projects,config}=await loadContent();
const allowedLinks=new Set([profile.github,...projects.map(x=>x.data.url).filter(Boolean)]);
// Optional local deny-list. Do not commit confidential organization names here.
const privateTerms=(process.env.PRIVATE_TERMS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
const extensions=new Set(['.html','.css','.js','.svg','.txt','.xml']);
const files=[];
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const f=path.join(dir,entry.name);entry.isDirectory()?await walk(f):files.push(f);}}
await walk(root);let links=0;const issues=[];
for(const file of files.filter(f=>extensions.has(path.extname(f)))){
 const text=await readFile(file,'utf8');
 for(const term of privateTerms)if(text.toLowerCase().includes(term))issues.push(`${path.relative(root,file)}: confidential term detected`);
 if(!file.endsWith('.html'))continue;
 for(const [,url] of text.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(url.startsWith('https://github.com/')&&!allowedLinks.has(url))issues.push(`${file}: unapproved repository link`);
  if(!url.startsWith(href(config)))continue;
  const local=url.split('#')[0].split('?')[0].slice(href(config).length);
  const target=path.join(root,local);
  const resolved=local.endsWith('/')||local===''?path.join(target,'index.html'):target;
  try{await stat(resolved);links++;}catch{issues.push(`${file}: missing local target ${local}`);}
 }
}
if(!(await stat(path.join(root,'resume.pdf'))).isFile())issues.push('Missing resume.pdf');
if(!(await stat(path.join(root,'og.png'))).isFile())issues.push('Missing og.png');
if(issues.length){console.error(issues.join('\n'));process.exitCode=1;}else console.log(`Audit passed: ${files.length} files, ${links} local links, public repository allow-list respected.`);
