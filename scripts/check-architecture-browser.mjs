import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {startServer} from './serve.mjs';
import {loadContent} from '../src/lib/content.mjs';
import {href} from '../src/lib/render.mjs';
import {diagrams} from '../content/architecture/diagrams.mjs';
const {config}=await loadContent();
const root=path.resolve(process.env.PREVIEW_DIR||'dist');
const server=await startServer({root,base:config.base,port:0});
const origin=`http://127.0.0.1:${server.address().port}`;
const output='test-results/architecture';await mkdir(output,{recursive:true});
const results=[],errors=[],external=[];let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 const page=await browser.newPage({deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin+'/'))external.push(r.url());});
 for(const d of diagrams){
  for(const width of [360,768,1440]){
   await page.setViewportSize({width,height:1050});
   assert.equal((await page.goto(origin+href(config,`projects/${d.id}/`),{waitUntil:'networkidle'})).status(),200);
   const image=page.locator('.architecture-image');await image.scrollIntoViewIfNeeded();
   await image.evaluate(async el=>{await el.decode();});
   assert.ok(await image.evaluate(el=>el.complete&&el.naturalWidth===1248));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${d.id}: page overflow at ${width}`);
   const region=page.locator('.architecture-viewport');
   if(width===360){assert.ok(await region.evaluate(el=>el.scrollWidth>el.clientWidth));await region.focus();await page.keyboard.press('ArrowRight');}
   await page.locator('.architecture-text summary').click();assert.ok(await page.locator('.architecture-text').getAttribute('open')!==null);
   await page.locator('.architecture-text summary').click();
   const download=page.waitForEvent('download');await page.locator('.architecture-figure a[download]').click();assert.equal((await download).suggestedFilename(),`${d.id}-architecture.svg`);
   if(d.id==='pokeros'&&width===1440)await page.locator('.architecture-map').screenshot({path:`${output}/case-section.png`,style:'.site-header{visibility:hidden!important}'});
   if(d.id==='pokeros'&&width===360){await region.evaluate(el=>el.scrollLeft=0);await page.locator('.architecture-map-heading').scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/mobile-section.png`});}
   results.push(`${d.id}: ${width}px image, local scroll, text alternative and download PASS`);
  }
  await page.setViewportSize({width:1248,height:1020});
  const url=origin+href(config,`diagrams/${d.id}.svg`);
  assert.equal((await page.goto(url,{waitUntil:'networkidle'})).status(),200);await page.evaluate(async()=>{await document.fonts?.ready;});
  const overflowing=await page.locator('text[data-max-width]').evaluateAll(es=>es.filter(e=>e.getComputedTextLength()>Number(e.getAttribute('data-max-width'))).map(e=>e.textContent));
  assert.deepEqual(overflowing,[],`${d.id}: clipped node label`);
  assert.equal(await page.locator('g[data-node]').count(),d.nodes.length);
  assert.ok(await page.locator('image[data-brand]').count()>5);
  assert.ok(await page.locator('image[data-brand]').evaluateAll(es=>es.every(e=>e.getAttribute('href').startsWith('data:image/svg+xml;base64,'))));
  await page.locator('svg').first().screenshot({path:`${output}/${d.id}.png`});
  const response=await page.request.get(url);assert.deepEqual(await response.body(),await readFile(path.join(root,`diagrams/${d.id}.svg`)));
  results.push(`${d.id}: standalone SVG, ${d.nodes.length} nodes, label bounds and embedded marks PASS`);
 }
 execFileSync(process.execPath,['scripts/export-preview.mjs'],{env:{...process.env,PREVIEW_DIR:root},stdio:'inherit'});
 await page.goto(pathToFileURL(path.resolve('preview.html')).href+'#/projects/pokeros/');
 await page.locator('.architecture-image').evaluate(async el=>{await el.decode();});
 assert.ok(await page.locator('.architecture-image').evaluate(el=>el.naturalWidth===1248&&el.src.startsWith('blob:')));
 assert.ok((await page.locator('.architecture-figure a[download]').getAttribute('href')).startsWith('blob:'));
 results.push('Single-file preview: embedded diagram, stylesheet and download PASS');
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 await writeFile(`${output}/report.json`,JSON.stringify({results,pageErrors:errors,externalRequests:external},null,2));
 console.log(`${results.length} architecture browser checks passed; no external image requests.`);
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
