import type {
  CaseStudy,
  Contact,
  Education,
  Judging,
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
import caseStudiesJson from './case-studies.json';
import contactJson from './contact.json';
import educationJson from './education.json';
import experienceJson from './experience.json';
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

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
