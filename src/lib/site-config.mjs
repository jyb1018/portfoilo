import {basePath} from './render.mjs';
/** Explicit domain/env settings win; Pages paths otherwise follow repository renames. */
export function resolveSiteConfig(settings,env=process.env){
 const c={...settings};
 if(!c.customDomain&&env.GITHUB_REPOSITORY){
  const match=/^([A-Za-z0-9-]+)\/([A-Za-z0-9_.-]+)$/.exec(env.GITHUB_REPOSITORY);
  if(!match)throw Error('Invalid GITHUB_REPOSITORY');
  const [,owner,repo]=match;c.site=`https://${owner.toLowerCase()}.github.io`;
  c.base=repo.toLowerCase()===`${owner.toLowerCase()}.github.io`?'/':`/${repo}`;
 }
 c.site=env.SITE_URL||c.site;c.base=env.BASE_PATH??c.base;
 const u=new URL(c.site);
 if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/')throw Error('site must be an HTTPS origin without a path or credentials');
 c.site=u.origin;c.base=basePath(c.base)||'/';
 if(c.customDomain&&(u.hostname!==c.customDomain||c.base!=='/'||c.customDomain.endsWith('.github.io')))throw Error('Custom domain requires matching HTTPS origin and root base');
 return c;
}
