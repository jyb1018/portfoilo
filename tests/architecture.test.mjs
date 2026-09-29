import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {diagrams,getDiagram} from '../content/architecture/diagrams.mjs';
import {brands,licenses} from '../content/architecture/brands.mjs';
import {validateDiagram,renderDiagram} from '../scripts/build-architectures.mjs';
import {validateSvg} from '../scripts/vendor-architecture-icons.mjs';
import {architectureMap} from '../src/lib/architecture.mjs';
const fixture=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><path d="M0 0h1v1H0z"/></svg>').toString('base64');
const icons=Object.fromEntries(brands.map(b=>[b.id,fixture]));
test('All five projects have a distinct logical architecture',()=>{
 assert.deepEqual(diagrams.map(d=>d.id),['pokeros','pokerplus','monitorcontrol','poker-ocr-overlay','ai-development-harness']);
 assert.equal(new Set(diagrams.map(d=>d.subtitle)).size,5);
 diagrams.forEach(validateDiagram);
});
test('Only pinned HTTPS originals are acquired; licenses are included',()=>{
 assert.equal(new Set(brands.map(b=>b.id)).size,brands.length);
 for(const b of [...brands,...licenses])assert.match(b.source,/^https:\/\/raw\.githubusercontent\.com\/(?:devicons\/devicon|simple-icons\/simple-icons)\/[a-f0-9]{40}\//);
 assert.equal(licenses.length,2);
});
test('Component boxes neither overlap nor escape the drawing',()=>{
 for(const d of diagrams)for(const [i,a] of d.nodes.entries())for(const b of d.nodes.slice(i+1))assert.ok(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,`${d.id}: ${a.id} and ${b.id}`);
});
test('Rendered SVGs embed local image bytes and a text alternative',()=>{
 for(const d of diagrams){const svg=renderDiagram(d,icons);assert.match(svg,/<title id="title">/);assert.match(svg,/<desc id="description">/);assert.match(svg,/data-brand="/);assert.match(svg,/data:image\/svg\+xml;base64,/);assert.doesNotMatch(svg,/<(?:script|foreignObject)\b/i);assert.doesNotMatch(svg,/(?:href|src)="https?:/);}
});
test('Missing icons fail instead of publishing placeholders',()=>{
 assert.throws(()=>renderDiagram(diagrams[0],{}),/Missing original icon/);
});
test('Unsafe upstream SVGs are rejected',()=>{
 for(const bad of ['<svg><script>alert(1)</script></svg>','<svg onload="x()"></svg>','<svg><foreignObject/></svg>','<svg><image href="https://example.org/x"/></svg>','<svg><style>@import "x";</style></svg>','<!DOCTYPE svg><svg></svg>'])assert.throws(()=>validateSvg(bad));
 validateSvg('<svg xmlns="http://www.w3.org/2000/svg"><path fill="url(#a)"/></svg>');
});
test('PokerPlus source contracts do not become live integration claims',()=>{
 const d=getDiagram('pokerplus');for(const id of ['member','operating'])assert.equal(d.nodes.find(n=>n.id===id).pending,true);
 assert.ok(d.edges.filter(e=>e.pending).length>=2);assert.match(d.boundary,/공개 운영/);
});
test('MonitorControl uses ws, and 38 devices remains a single-site metric',()=>{
 const d=getDiagram('monitorcontrol');assert.match(JSON.stringify(d.nodes),/Express · ws/);assert.doesNotMatch(JSON.stringify(d.nodes),/Socket\.IO/);assert.match(d.scope,/한 매장 38대/);
});
test('OCR has two servers, a bridge, SQLite and explicit scoped evaluation',()=>{
 const d=getDiagram('poker-ocr-overlay');assert.ok(d.nodes.some(n=>n.id==='ocrApi'));assert.ok(d.nodes.some(n=>n.id==='broadcast'));assert.ok(d.nodes.some(n=>n.id==='bridge'));assert.match(JSON.stringify(d.nodes),/SQLite/);assert.match(d.scope,/source-scoped/);
});
test('Harness is local tooling and optional tools remain conditional',()=>{
 const d=getDiagram('ai-development-harness');assert.match(d.scope,/상시 서버가 아닙니다/);assert.equal(d.nodes.find(n=>n.id==='tools').pending,true);
});
test('Root and repository base paths work for images, downloads and credits',()=>{
 for(const base of ['/','/portfolio/','/portfoilo/']){const html=architectureMap({id:'pokeros'},{base});assert.ok(html.includes(`${base}diagrams/pokeros.svg`));assert.ok(html.includes(`${base}brands/ATTRIBUTION.md`));assert.match(html,/download="pokeros-architecture\.svg"/);assert.match(html,/tabindex="0"/);assert.match(html,/<details/);}
 assert.equal(architectureMap({id:'new-project'},{base:'/'}),'');
});
test('Shared rendering includes the detailed map but leaves resumes alone',async()=>{
 const s=await readFile(new URL('../src/lib/render.mjs',import.meta.url),'utf8');assert.ok(s.includes('${architectureMap(d,c)}'));assert.ok(s.includes("path.startsWith('projects/')"));
});
