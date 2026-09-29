import { resolveSiteConfig } from '../src/lib/site-config.mjs';
import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {basePath} from '../src/lib/render.mjs';
export function startServer({root=path.resolve('dist-static'),base='/portfolio',port=4321}={}){
 root=path.resolve(root);const prefix=basePath(base);
 const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.pdf':'application/pdf','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
 const server=http.createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
  try{
   let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   if(prefix&&pathname===prefix){res.writeHead(301,{Location:prefix+'/'});return res.end();}
   if(prefix&&!pathname.startsWith(prefix+'/')){res.writeHead(404);return res.end('Not found');}
   let local=path.resolve(root,'.'+pathname.slice(prefix.length));
   if(local!==root&&!local.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
   try{if((await stat(local)).isDirectory())local=path.join(local,'index.html');}catch{}
   let body;let status=200;try{body=await readFile(local);}catch{local=path.join(root,'404.html');body=await readFile(local);status=404;}
   res.writeHead(status,{'Content-Type':types[path.extname(local)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(400);res.end('Bad request');}
 });
 return new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>resolve(server));});
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const config=resolveSiteConfig(JSON.parse(await readFile('site.config.json','utf8')));
 const server=await startServer({root:process.env.PREVIEW_DIR||'dist-static',base:process.env.BASE_PATH??config.base,port:Number(process.env.PORT||4321)});
 console.log(`Preview: http://127.0.0.1:${server.address().port}${basePath(process.env.BASE_PATH??config.base)}/`);
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
}
