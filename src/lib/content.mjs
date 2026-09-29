import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { esc } from './render.mjs';
import { resolveSiteConfig } from './site-config.mjs';
/** JSON frontmatter is valid YAML and keeps the offline path dependency-free. */
export function parseProject(source){
 const match=source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
 if(!match)throw Error('Project must start with JSON frontmatter.');
 const data=JSON.parse(match[1]);
 for(const key of ['id','title','summary','role','category','status','eyebrow','period','outcome'])if(typeof data[key]!=='string'||!data[key])throw Error(`Missing project field: ${key}`);
 if(!/^[a-z0-9-]+$/.test(data.id))throw Error('Invalid project id');
 if(!Number.isInteger(data.order))throw Error('Project order must be an integer');
 for(const key of ['tags','focus','architecture'])if(!Array.isArray(data[key])||!data[key].every(v=>typeof v==='string'))throw Error(`Invalid project field: ${key}`);
 if(!['public','private'].includes(data.visibility))throw Error('Invalid visibility');
 if(data.visibility==='private'&&data.url!==null)throw Error('Private project URLs must be null');
 if(data.url&&!/^https:\/\/github\.com\/jyb1018\/[A-Za-z0-9_.-]+$/.test(data.url))throw Error('Unapproved repository URL');
 for(const key of ['context','action','result','boundary'])if(typeof data.resume?.[key]!=='string')throw Error(`Missing resume.${key}`);
 return {data,body:match[2]};
}
export async function loadContent(root=process.cwd()){
 const profile=JSON.parse(await readFile(path.join(root,'content/profile.json'),'utf8'));
 if(profile.graduationYear!==null&&(!Number.isInteger(profile.graduationYear)||profile.graduationYear<2026||profile.graduationYear>2040))throw Error('graduationYear must be null or a verified year');
 if(profile.graduationMonth!=null&&(!Number.isInteger(profile.graduationMonth)||profile.graduationMonth<1||profile.graduationMonth>12||profile.graduationYear==null))throw Error('graduationMonth requires a verified year and a month between 1 and 12');
 const names=(await readdir(path.join(root,'content/projects'))).filter(n=>n.endsWith('.mdx')).sort();
 const projects=await Promise.all(names.map(async n=>parseProject(await readFile(path.join(root,'content/projects',n),'utf8'))));
 const ids=projects.map(p=>p.data.id);if(new Set(ids).size!==ids.length)throw Error('Duplicate project id');
 projects.sort((a,b)=>a.data.order-b.data.order);
 const config=resolveSiteConfig(JSON.parse(await readFile(path.join(root,'site.config.json'),'utf8')));
 return {profile,projects,config};
}
/** Deliberately small Markdown subset for the bundled source: headings, paragraphs,
 * lists, emphasis, inline code. Full JSX/import support belongs to Astro + MDX.
 * Fail closed instead of silently dropping unsupported MDX. */
export function markdown(source){
 if(/^(import |export |\s*<|```|\|)/m.test(source))throw Error('This MDX uses advanced syntax. Use the Astro build path.');
 const inline=text=>esc(text).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>');
 const output=[];let paragraph=[],items=[];let heading=0;
 const flushP=()=>{if(paragraph.length){output.push(`<p>${inline(paragraph.join(' '))}</p>`);paragraph=[];}};
 const flushL=()=>{if(items.length){output.push(`<ul>${items.map(x=>`<li>${inline(x)}</li>`).join('')}</ul>`);items=[];}};
 for(const line of source.split(/\r?\n/)){
  const h=line.match(/^(#{2,3}) (.+)$/);
  if(h){flushP();flushL();output.push(`<h${h[1].length} id="section-${++heading}">${inline(h[2])}</h${h[1].length}>`);}
  else if(/^[-*] /.test(line)){flushP();items.push(line.slice(2));}
  else if(!line.trim()){flushP();flushL();}
  else{flushL();paragraph.push(line.trim());}
 }
 flushP();flushL();return output.join('\n');
}
