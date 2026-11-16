import type {
  Audience,
  AudienceSlug,
  CaseStudy,
  Contact,
  Education,
  Home,
  Judging,
  Link,
  Profile,
  Project,
  Publication,
  Recognition,
  Role,
  Site,
  SkillCategory,
  Testimonial,
  Writing,
} from './types';
import audiencesJson from './audiences.json';
import caseStudiesJson from './case-studies.json';
import contactJson from './contact.json';
import educationJson from './education.json';
import experienceJson from './experience.json';
import homeJson from './home.json';
import judgingJson from './judging.json';
import opensourceJson from './opensource.json';
import profileJson from './profile.json';
import projectsJson from './projects.json';
import publicationsJson from './publications.json';
import recognitionJson from './recognition.json';
import siteJson from './site.json';
import skillsJson from './skills.json';
import testimonialsJson from './testimonials.json';
import writingJson from './writing.json';

// Typed re-exports: `astro check` fails if a data file drifts from its interface.
export const profile: Profile = profileJson;
export const site: Site = siteJson;
export const skills: SkillCategory[] = skillsJson;
export const experience: Role[] = experienceJson;
export const projects: Project[] = projectsJson;
export const openSource: { intro: string; items: Project[] } = opensourceJson;
export const recognition: Recognition = recognitionJson;
export const publications: Publication[] = publicationsJson;
export const writing: Writing = writingJson;
export const judging: Judging = judgingJson;
export const education: Education[] = educationJson;
export const testimonials: Testimonial[] = testimonialsJson;
export const contact: Contact = contactJson;
export const caseStudies: CaseStudy[] = caseStudiesJson;
export const home: Home = homeJson;
export const audiences: Audience[] = audiencesJson;

export function audience(slug: AudienceSlug): Audience {
  const found = audiences.find((item) => item.slug === slug);
  if (!found) throw new Error(`Unknown audience: ${slug}`);
  return found;
}

export function audiencePath(slug: AudienceSlug): string {
  return `/for/${slug}/`;
}

/** Resolves case-study slugs in order; fails the build on a typo. */
export function caseStudiesBySlug(slugs: string[]): CaseStudy[] {
  return slugs.map((slug) => {
    const study = caseStudies.find((item) => item.slug === slug);
    if (!study) throw new Error(`Unknown case study: ${slug}`);
    return study;
  });
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

const profileLinkLabels: Record<string, string> = {
  'www.linkedin.com': 'LinkedIn',
  'github.com': 'GitHub',
  'medium.com': 'Medium',
  'thenucleargeeks.com': 'The Nuclear Geeks',
  'orcid.org': 'ORCID',
  'scholar.google.com': 'Google Scholar',
};

/** Public profiles from `profile.sameAs`, labelled for display. */
export function profileLinks(): Link[] {
  return profile.sameAs.map((url) => ({
    label: profileLinkLabels[new URL(url).hostname] ?? new URL(url).hostname,
    url,
  }));
}

/** The first highlight with a number in it, so each role shows one measured line. */
export function impactLine(role: Role): string {
  return role.highlights.find((line) => /\d/.test(line)) ?? role.highlights[0] ?? '';
}
