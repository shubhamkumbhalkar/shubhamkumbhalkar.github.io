import type { APIRoute } from 'astro';
import { audiencePath, audiences, caseStudies } from '../data';
import type { AudienceSlug } from '../data/types';

const paths = [
  '/',
  ...audiences.map((item) => audiencePath(item.slug as AudienceSlug)),
  '/work/',
  ...caseStudies.map((study) => `/work/${study.slug}/`),
  '/writing/',
  '/cv/',
];

export const GET: APIRoute = ({ site }) => {
  const urls = paths
    .map((path) => {
      const loc = new URL(path, site).toString();
      const priority = path === '/' ? '1.0' : '0.8';
      return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
