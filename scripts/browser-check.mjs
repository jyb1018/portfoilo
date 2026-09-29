import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {startServer} from './serve.mjs';
import {loadContent} from '../src/lib/content.mjs';
import {href,education} from '../src/lib/render.mjs';
const {profile,projects,config}=await loadContent();
const root=path.resolve(process.env.PREVIEW_DIR||'dist');
const server=await startServer({root,base:config.base,port:0});let browser;
const origin=`http://127.0.0.1:${server.address().port}`;const errors=[];const results=[];
try{
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,360,390,768,1024,1440]){
  await page.setViewportSize({width,height:1000});
  assert.equal((await page.goto(origin+href(config),{waitUntil:'networkidle'})).status(),200);
  assert.equal(await page.locator('h1').count(),1);
  assert.ok(await page.locator('body').innerText().then(t=>t.includes('2027년 2월 졸업예정')));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Home overflow ${width}`);
  results.push(`Home ${width}px: PASS`);
 }
 for(const p of projects){for(const width of [360,1440]){
  await page.setViewportSize({width,height:1000});
  assert.equal((await page.goto(origin+href(config,`projects/${p.data.id}/`),{waitUntil:'networkidle'})).status(),200);
  assert.equal(await page.locator('h1').count(),1);assert.ok(await page.locator('.case-prose h2').count()>=1);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${p.data.id} overflow ${width}`);
  results.push(`${p.data.id} ${width}px: PASS`);
 }}
 await page.goto(origin+href(config));await page.locator('a.project-link').first().click();
 assert.ok(page.url().includes('/projects/pokeros/'));results.push('Real HTTP navigation: PASS');
 await page.goto(origin+href(config,'resume/'));
 assert.equal(await page.locator('.resume-page').count(),2);
 assert.match(await page.locator('.resume-education').innerText(),/2027년 2월 졸업예정/);
 await page.evaluate(()=>{window.__printCount=0;window.print=()=>window.__printCount++;});
 await page.locator('.print-resume').click();assert.equal(await page.evaluate(()=>window.__printCount),1);
 const pdf=await page.request.get(origin+href(config,'resume.pdf'));
 assert.equal(pdf.status(),200);assert.deepEqual(await pdf.body(),await readFile(path.join(root,'resume.pdf')));
 assert.equal((await pdf.body()).subarray(0,5).toString(),'%PDF-');results.push('Resume, print button and PDF bytes: PASS');
 const missing=await page.goto(origin+href(config,'does-not-exist/'));assert.equal(missing.status(),404);
 assert.equal(await page.locator('h1').count(),1);results.push('404: PASS');assert.deepEqual(errors,[]);
 await mkdir('test-results',{recursive:true});
 await writeFile('test-results/browser.json',JSON.stringify({results,pageErrors:errors,education:education(profile)},null,2));
 console.log(`${results.length} browser checks passed; page errors: 0`);
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
