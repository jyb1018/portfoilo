import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './content/projects' }),
  schema: z.object({
    id: z.string(), title: z.string(), order: z.number(), category: z.string(),
    eyebrow: z.string(), summary: z.string(), role: z.string(), period: z.string(),
    status: z.string(), visibility: z.enum(['public', 'private']), url: z.string().nullable(),
    tags: z.array(z.string()), outcome: z.string(), focus: z.array(z.string()),
    architecture: z.array(z.string()),
    resume: z.object({context: z.string(), action: z.string(), result: z.string(), boundary: z.string()})
  }),
});
export const collections = { projects };
