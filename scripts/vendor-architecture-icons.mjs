/** One-time acquisition from pinned upstream revisions; subsequent runs verify local copies. */
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {brands,licenses} from '../content/architecture/brands.mjs';
const dir=new URL('../public/brands/',import.meta.url);
const digest=b=>createHash('sha256').update(b).digest('hex');
export function validateSvg(text){
 if(!/<svg[\s>]/i.test(text)||!/<\/svg>\s*$/i.test(text))throw Error('Not an SVG document');
 if(/<\s*(script|foreignObject|iframe|object|embed)\b|<!DOCTYPE|<!ENTITY|\bon[a-z]+\s*=|@import/i.test(text))throw Error('Active SVG content is forbidden');
 for(const [,url] of text.matchAll(/(?:href|xlink:href)\s*=\s*["']([^"']+)["']/gi))if(!url.startsWith('#'))throw Error('External SVG references are forbidden');
 for(const [,url] of text.matchAll(/url\(\s*["']?([^\)"']+)/gi))if(!url.startsWith('#'))throw Error('External SVG styles are forbidden');
}
async function exists(url){try{return await readFile(url);}catch(e){if(e.code==='ENOENT')return null;throw e;}}
async function fetchBytes(source){
 if(!/^https:\/\/raw\.githubusercontent\.com\/(devicons\/devicon|simple-icons\/simple-icons)\/[a-f0-9]{40}\//.test(source))throw Error('Unpinned or unapproved asset URL');
 for(let attempt=0;attempt<3;attempt++){
  try{const r=await fetch(source,{signal:AbortSignal.timeout(20000),redirect:'error'});if(!r.ok)throw Error(`HTTP ${r.status}: ${source}`);const b=Buffer.from(await r.arrayBuffer());if(b.length>160000)throw Error('Asset too large');return b;}
  catch(e){if(attempt===2)throw e;await new Promise(r=>setTimeout(r,500*(attempt+1)));}
 }
}
export async function vendor(){
 await mkdir(dir,{recursive:true});
 const previous=await exists(new URL('manifest.json',dir));
 const locked=previous?JSON.parse(previous):null;
 const entries=[...brands.map(b=>({...b,file:`${b.id}.svg`})),...licenses.map(l=>({...l,id:l.file,project:'License notice'}))];
 const assets=[];
 for(const entry of entries){
  if(!/^[A-Za-z0-9._-]+$/.test(entry.file))throw Error('Invalid asset filename');
  const file=new URL(entry.file,dir),old=locked?.assets.find(a=>a.file===entry.file);
  if(locked&&(!old||old.source!==entry.source))throw Error(`Asset source changed: ${entry.file}; review the manifest explicitly.`);
  let bytes=await exists(file);
  if(bytes&&old&&digest(bytes)!==old.sha256)throw Error(`Local asset differs from lock: ${entry.file}`);
  if(!bytes){bytes=await fetchBytes(entry.source);if(old&&digest(bytes)!==old.sha256)throw Error(`Upstream asset differs from lock: ${entry.file}`);if(entry.file.endsWith('.svg'))validateSvg(bytes.toString('utf8'));await writeFile(new URL(`${entry.file}.tmp`,dir),bytes);await rename(new URL(`${entry.file}.tmp`,dir),file);}
  if(entry.file.endsWith('.svg'))validateSvg(bytes.toString('utf8'));
  assets.push({...entry,sha256:digest(bytes),bytes:bytes.length});
 }
 const manifest={schemaVersion:1,acquiredOn:locked?.acquiredOn||new Date().toISOString().slice(0,10),notice:'Marks identify technologies only; no affiliation or endorsement is implied. Source-image licenses and trademark rights are distinct.',assets};
 await writeFile(new URL('manifest.json',dir),JSON.stringify(manifest,null,2)+'\n');
 const credits='# Architecture technology marks\n\nSVG originals were downloaded from pinned upstream revisions, retained without recoloring, and self-hosted. Each mark belongs to its respective owner and is used only to identify the technology. No endorsement or affiliation is implied.\n\nDevicon: MIT, copyright (c) 2015 konpa. See DEVICON-LICENSE.txt.\nSimple Icons: CC0-1.0. See SIMPLE-ICONS-LICENSE.txt. Brand policies remain applicable.\n\n'+brands.map(b=>`- ${b.name}: ${b.project} / ${b.license}\n  Source: ${b.source}`).join('\n')+'\n\nmanifest.json records acquisition date, exact sources and SHA-256 checksums.\n';
 await writeFile(new URL('ATTRIBUTION.md',dir),credits);
 console.log(`Verified ${brands.length} original technology marks and ${licenses.length} license files.`);
}
if(process.argv[1]&&new URL(`file://${process.argv[1]}`).href===import.meta.url)await vendor();
