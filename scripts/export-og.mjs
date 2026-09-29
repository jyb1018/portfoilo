import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
// Generate only the PNG. Do not copy installed fonts into public/ or artifacts.
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
try{
 const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
 const svg=await readFile('public/og.svg','utf8');
 await page.setContent(`<html lang="ko"><head><meta charset="utf-8"></head><body style="margin:0">${svg}</body></html>`);
 await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:'public/og.png'});
 console.log('Generated public/og.png');
}finally{await browser.close();}
