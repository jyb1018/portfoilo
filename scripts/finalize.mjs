import {writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {href,esc} from '../src/lib/render.mjs';
import {loadContent} from '../src/lib/content.mjs';
export async function finalize(out,c,projects){
 const pages=['','resume/',...projects.map(p=>`projects/${p.id}/`)];
 const locations=pages.map(p=>new URL(href(c,p),c.site).href);
 await writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${locations.map(u=>`<url><loc>${esc(u)}</loc></url>`).join('')}</urlset>`);
 await writeFile(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${new URL(href(c,'sitemap.xml'),c.site).href}\n`);
 await writeFile(path.join(out,'.nojekyll'),'');
 if(c.customDomain){
  if(!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(c.customDomain)||c.customDomain.endsWith('.github.io'))throw Error('customDomain must be a domain you own, not a github.io address');
  if(new URL(c.site).hostname!==c.customDomain||!['','/'].includes(c.base))throw Error('Custom domain requires matching site and root base');
  await writeFile(path.join(out,'CNAME'),c.customDomain+'\n');
 }else await rm(path.join(out,'CNAME'),{force:true});
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const {projects,config}=await loadContent();await finalize(path.resolve('dist'),config,projects.map(x=>x.data));}
