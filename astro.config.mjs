import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { readFileSync } from 'node:fs';
import { resolveSiteConfig } from './src/lib/site-config.mjs';
const config = resolveSiteConfig(JSON.parse(readFileSync(new URL('./site.config.json', import.meta.url), 'utf8')));
export default defineConfig({
  site: config.site,
  base: config.base,
  output: 'static', trailingSlash: 'always',
  integrations: [mdx()],
});
