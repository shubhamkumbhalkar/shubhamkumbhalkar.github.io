import { profile, publications, writing } from '../data';

const personId = `${profile.siteUrl}#person`;

export function absoluteUrl(path: string): string {
  return new URL(path, profile.siteUrl).toString();
}

export function personSchema(): Record<string, unknown> {
  return {
    '@type': 'Person',
    '@id': personId,
    name: profile.name,
    url: profile.siteUrl,
    image: absoluteUrl(profile.socialImage),
    jobTitle: profile.jobTitle,
    worksFor: { '@type': 'Organization', name: profile.worksFor },
    alumniOf: profile.alumniOf.map((name) => ({ '@type': 'CollegeOrUniversity', name })),
    knowsAbout: profile.knowsAbout,
    award: profile.awards,
    sameAs: profile.sameAs,
  };
}

export function writingSchemas(): Record<string, unknown>[] {
  const author = { '@id': personId };
  const papers = publications.map((paper) => ({
    '@type': 'ScholarlyArticle',
    headline: paper.title,
    author,
    publisher: { '@type': 'Organization', name: paper.venue },
    ...(paper.link ? { url: paper.link.url } : {}),
    datePublished: paper.year,
    inLanguage: 'en',
  }));
  const articles = writing.articles.map((article) => ({
    '@type': 'Article',
    headline: article.title,
    author,
    publisher: { '@type': 'Organization', name: article.venue },
    url: article.url,
    ...(article.published ? { datePublished: article.published } : {}),
    inLanguage: 'en',
  }));
  return [...papers, ...articles];
}

/** Serialises JSON-LD so it cannot close the surrounding script element. */
export function serializeJsonLd(graph: Record<string, unknown>[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}
