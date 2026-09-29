import { mkdir, rm, cp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadContent, markdown } from '../src/lib/content.mjs';
import { home,resume,projectStart,projectEnd,notFound } from '../src/lib/render.mjs';
import { finalize } from './finalize.mjs';
const root=process.cwd();const outArg=process.argv.indexOf('--out');const name=outArg<0?'dist-static':process.argv[outArg+1];
if(!['dist','dist-static','dist-root'].includes(name))throw Error('Output must be dist, dist-static or dist-root');
const out=path.join(root,name);const {profile,projects,config}=await loadContent(root);const data=projects.map(x=>x.data);
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});await cp(path.join(root,'public'),out,{recursive:true});
await writeFile(path.join(out,'index.html'),home(profile,data,config));
for(const p of projects){const dir=path.join(out,'projects',p.data.id);await mkdir(dir,{recursive:true});await writeFile(path.join(dir,'index.html'),projectStart(profile,p.data,config)+markdown(p.body)+projectEnd(profile,p.data,data,config));}
await mkdir(path.join(out,'resume'),{recursive:true});await writeFile(path.join(out,'resume/index.html'),resume(profile,data,config));
await writeFile(path.join(out,'404.html'),notFound(profile,config));await finalize(out,config,data);
console.log(`Static export: ${projects.length+3} HTML pages -> ${name}; base=${config.base}`);
