export interface Link {
  label: string;
  url: string;
}

export interface Highlight {
  value: string;
  label: string;
}

export interface Profile {
  name: string;
  jobTitle: string;
  greeting: string;
  heroSummary: string;
  focusAreas: string[];
  highlights: Highlight[];
  about: string[];
  siteUrl: string;
  metaDescription: string;
  socialImage: string;
  socialImageAlt: string;
  headshot: { webp: string; png: string; alt: string; width: number; height: number };
  resume: string;
  worksFor: string;
  alumniOf: string[];
  knowsAbout: string[];
  awards: string[];
  sameAs: string[];
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

export interface Role {
  title: string;
  company: string;
  location: string;
  period: string;
  stack: string[];
  highlights: string[];
}

export interface Project {
  name: string;
  description: string;
  tags: string[];
  link?: Link;
}

export interface RecognitionItem {
  title: string;
  meta: string;
  description: string;
  /** `talk` items are also listed on the writing page. */
  kind: string;
  links: Link[];
}

export interface Achievement {
  title: string;
  description: string;
}

export interface Recognition {
  intro: string;
  featured: RecognitionItem[];
  achievements: Achievement[];
}

export interface Publication {
  label: string;
  title: string;
  venue: string;
  year: string;
  status: string;
  summary: string;
  link?: Link;
}

export interface Article {
  title: string;
  venue: string;
  status: string;
  published?: string;
  summary?: string;
  url: string;
}

export interface Writing {
  intro: string;
  profiles: Link[];
  articles: Article[];
}

export interface JudgingEvent {
  title: string;
  meta: string;
  description: string;
  link?: Link;
}

export interface Judging {
  intro: string;
  stats: Highlight[];
  events: JudgingEvent[];
}

export interface Education {
  year: string;
  degree: string;
  school: string;
  focus?: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface Contact {
  intro: string;
  formEndpoint: string;
  directLabel: string;
  email: string;
  links: Link[];
}

export interface CaseStudySection {
  heading: string;
  items: string[];
}

export interface CaseStudy {
  slug: string;
  title: string;
  summary: string;
  organization: string;
  role: string;
  period: string;
  stack: string[];
  results: Highlight[];
  sections: CaseStudySection[];
  links: Link[];
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Site {
  nav: NavItem[];
  footer: string;
}

export type AudienceSlug = 'editors' | 'hiring' | 'engineers';

export interface Audience {
  /** One of AudienceSlug; checked when the page is built. */
  slug: string;
  label: string;
  pitch: string;
  proof: string[];
  cta: string;
  title: string;
  lede: string;
  metaDescription: string;
  /** Case-study slugs to feature, in order. Each must exist in case-studies.json. */
  caseStudies: string[];
}

export interface EvidenceItem {
  label: string;
  text: string;
  link: Link;
}

export interface Home {
  eyebrow: string;
  statement: string;
  chooser: { heading: string; intro: string };
  evidence: { heading: string; items: EvidenceItem[] };
  /** Case-study slugs previewed on the home page. */
  selectedWork: string[];
}
