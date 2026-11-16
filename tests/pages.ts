import { readFileSync } from 'node:fs';

interface CaseStudyEntry {
  slug: string;
}

const caseStudies = JSON.parse(
  readFileSync(new URL('../src/data/case-studies.json', import.meta.url), 'utf8'),
) as CaseStudyEntry[];

/** Every generated HTML page. Keep in sync with src/pages. */
export const pages: string[] = [
  '/',
  '/writing/',
  '/cv/',
  '/work/',
  ...caseStudies.map((study) => `/work/${study.slug}/`),
  '/404.html',
];

export const caseStudyPaths = caseStudies.map((study) => `/work/${study.slug}/`);

export const placeholderPattern = /\b(TODO|FIXME|TBD|XXX)\b|lorem\s+ipsum|\blorem\b/i;
