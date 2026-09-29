/** Deterministic, self-contained SVGs. No hosted fonts, scripts or runtime CDN are required. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {diagrams} from '../content/architecture/diagrams.mjs';
import {brands} from '../content/architecture/brands.mjs';
import {validateSvg} from './vendor-architecture-icons.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const font="-apple-system,BlinkMacSystemFont,'Noto Sans CJK KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif";
export function validateDiagram(d){
 if(!/^[a-z0-9-]+$/.test(d.id))throw Error('Invalid diagram id');
 const ids=new Set(d.nodes.map(n=>n.id));if(ids.size!==d.nodes.length)throw Error('Duplicate node id');
 const known=new Set(brands.map(b=>b.id));
 for(const n of d.nodes){if(n.x<0||n.y<0||n.x+n.w>1248||n.y+n.h>804)throw Error(`Node bounds: ${n.id}`);if(n.lines.length>2)throw Error('Too many label lines');for(const i of n.logos)if(!known.has(i))throw Error(`Unknown mark ${i}`);}
 for(const e of d.edges){if(!ids.has(e.from)||!ids.has(e.to))throw Error('Unknown edge endpoint');if(!/^[MLHVQCAZ0-9.,\s-]+$/i.test(e.path))throw Error('Invalid SVG path');}
 for(const r of d.rail)for(const i of r.logos)if(!known.has(i))throw Error('Unknown rail mark');
}
const t=(x,y,text,size=14,fill='#b6c3d1',weight=400,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" ${extra}>${esc(text)}</text>`;
export function renderDiagram(d,icons){
 validateDiagram(d);
 const mark=(id,x,y,s=34)=>{if(!icons[id])throw Error(`Missing original icon ${id}`);return `<rect x="${x-5}" y="${y-5}" width="${s+10}" height="${s+10}" rx="9" fill="#f8fafc"/><image data-brand="${id}" x="${x}" y="${y}" width="${s}" height="${s}" href="data:image/svg+xml;base64,${icons[id]}"/>`;};
 const box=n=>`<g data-node="${n.id}"><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="14" fill="${n.pending?'#1b1b19':'#141e2a'}" stroke="${n.pending?'#b49458':'#334454'}" ${n.pending?'stroke-dasharray="6 5"':''}/>${n.logos.length?n.logos.map((id,i)=>mark(id,n.x+20+i*52,n.y+19,32)).join(''):`<rect x="${n.x+16}" y="${n.y+14}" width="42" height="42" rx="9" fill="${n.pending?'#332a1c':'#21352f'}"/>${t(n.x+37,n.y+42,n.pending?'API':'◆',n.pending?12:18,n.pending?'#e6c286':'#b1e7cd',600,'text-anchor="middle"')}`}${t(n.x+n.w-15,n.y+33,n.tag,9.5,n.pending?'#e6c286':'#8ca1b5',600,'text-anchor="end"')}${t(n.x+16,n.y+79,n.title,18,'#f1f5f9',650,`data-max-width="${n.w-32}"`)}${n.lines.map((s,i)=>t(n.x+16,n.y+102+i*19,s,13.5,'#b6c3d1',400,`data-max-width="${n.w-32}"`)).join('')}</g>`;
 const lines=d.edges.map(e=>`<path data-edge="${e.from}:${e.to}" d="${e.path}" fill="none" stroke="${e.pending?'#d5b275':'#96ccb9'}" stroke-width="2" stroke-linejoin="round" ${e.pending?'stroke-dasharray="6 5"':''} marker-end="url(#${e.pending?'pending':'arrow'})"/>`).join('');
 const labels=d.edges.map(e=>{const w=[...e.label].reduce((a,c)=>a+(/[\u3000-\uffff]/.test(c)?13:7.4),18);return `<g><rect x="${e.x-w/2}" y="${e.y-14}" width="${w}" height="21" rx="5" fill="#0e151e"/>${t(e.x,e.y,e.label,12.5,e.pending?'#e6c286':'#bdd6ce',500,'text-anchor="middle"')}</g>`;}).join('');
 const rails=d.rail.map((r,i)=>{const x=44+i*402;return `<g data-rail="${i}"><rect x="${x}" y="886" width="356" height="75" rx="12" fill="#15202a" stroke="#2e414f"/>${r.logos.map((id,j)=>mark(id,x+17+j*40,904,26)).join('')}${t(x+20+r.logos.length*41,915,r.title,15.5,'#eef4f8',600)}${t(x+20+r.logos.length*41,939,r.detail,12.5)}${i<2?`<path d="M${x+364} 923h27" stroke="#718c83" stroke-width="2" marker-end="url(#arrow)"/>`:''}</g>`;}).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1248" height="1020" viewBox="0 0 1248 1020" role="img" aria-labelledby="title description"><title id="title">${esc(d.title)} 전체 아키텍처</title><desc id="description">${esc(d.subtitle)} ${esc(d.boundary)} ${d.edges.map(e=>esc(`${e.from} → ${e.to}: ${e.label}${e.pending?' (검증 대기 또는 선택 경로)':''}`)).join('; ')}</desc><defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" fill="none" stroke="#96ccb9" stroke-width="1.3"/></marker><marker id="pending" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" fill="none" stroke="#d5b275" stroke-width="1.3"/></marker></defs><rect width="1248" height="1020" rx="20" fill="#0b1119"/><g font-family="${font}">${t(44,36,'ARCHITECTURE / '+String(diagrams.indexOf(d)+1).padStart(2,'0'),11,'#abe4cd',650,'letter-spacing="2"')}${t(44,79,d.title,32,'#f1f5f9',700)}${t(44,109,d.subtitle,15)}${t(1204,49,d.scope,12,'#9fafc0',400,'text-anchor="end"')}<path d="M44 136H1204" stroke="#26333f"/>${t(1204,130,'실선: 구현 경로   ·   점선: 검증 대기 / 선택 기능',11,'#92a6b7',400,'text-anchor="end"')}${d.groups.map(g=>`<rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="17" fill="#0e1721" stroke="#243342"/>${t(g.x+20,g.y+29,g.label,12,'#a9bdce',650)}`).join('')}${lines}${d.nodes.map(box).join('')}${labels}<rect x="24" y="832" width="1200" height="149" rx="17" fill="#101a23" stroke="#2a3c48"/>${t(44,862,d.railTitle,12,'#a3caba',650)}${rails}${t(44,1005,'공개용 논리 구성도 · 각 박스가 별도 서버나 실제 기기 수를 의미하지는 않습니다.',11,'#8195a8')}${t(1204,1005,'MARKS: DEVICON / SIMPLE ICONS',10,'#8195a8',400,'text-anchor="end"')}</g></svg>\n`;
}
export async function build(){
 const base=new URL('../public/brands/',import.meta.url),out=new URL('../public/diagrams/',import.meta.url);
 const manifest=JSON.parse(await readFile(new URL('manifest.json',base),'utf8'));
 const icons={};
 for(const b of brands){const bytes=await readFile(new URL(`${b.id}.svg`,base));const entry=manifest.assets.find(a=>a.id===b.id);if(!entry||entry.source!==b.source||entry.sha256!==createHash('sha256').update(bytes).digest('hex'))throw Error(`Icon integrity failed: ${b.id}`);validateSvg(bytes.toString('utf8'));icons[b.id]=bytes.toString('base64');}
 await mkdir(out,{recursive:true});
 for(const d of diagrams)await writeFile(new URL(`${d.id}.svg`,out),renderDiagram(d,icons));
 console.log(`Generated ${diagrams.length} self-contained architecture diagrams with ${brands.length} original technology marks.`);
}
if(process.argv[1]&&new URL(`file://${process.argv[1]}`).href===import.meta.url)await build();
