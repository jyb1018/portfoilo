import {chromium} from 'playwright';
import {readFile,mkdir,copyFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {startServer} from './serve.mjs';
import {resolveSiteConfig} from '../src/lib/site-config.mjs';
import {href} from '../src/lib/render.mjs';
const c=resolveSiteConfig(JSON.parse(await readFile('site.config.json','utf8')));
const root=path.resolve(process.env.PREVIEW_DIR||'dist');await stat(path.join(root,'resume/index.html'));
const server=await startServer({root,base:c.base,port:0});let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 const page=await browser.newPage({viewport:{width:1200,height:1000}});
 await page.goto(`http://127.0.0.1:${server.address().port}${href(c,'resume/')}`,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({media:'print'});
 const overflow=await page.locator('.resume-page').evaluateAll(pages=>pages.some(p=>{const foot=p.querySelector('.resume-page-footer').getBoundingClientRect();return [...p.children].some(el=>el.tagName!=='FOOTER'&&el.getBoundingClientRect().bottom>foot.top-4);}));
 if(overflow)throw Error('Resume content overlaps its footer; adjust content or print styles.');
 await mkdir('public',{recursive:true});await page.pdf({path:'public/resume.pdf',format:'A4',printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false,tagged:true});await copyFile('public/resume.pdf',path.join(root,'resume.pdf'));
 console.log('Resume PDF exported to public/resume.pdf and the built site.');
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
