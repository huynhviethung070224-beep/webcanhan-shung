/**
 * Central site/profile configuration.
 *
 * Edit this file to update the owner's identity, introduction, interests,
 * production origin, contact email, resume, portrait and availability. Presentation components read
 * from here and never hard-code these values.
 */

import { validateContentLink, validateOptionalPublicAsset } from '../utils/validation';

export interface EvidenceLink {
  label: string;
  url: string;
}

export interface TimelineEntry {
  title: string;
  organization: string;
  location?: string;
  period?: string;
  description?: string;
  contributions?: string[];
  technologies?: string[];
  evidenceLinks?: EvidenceLink[];
  order: number;
}

export interface ResumeConfig {
  path: string;
  label?: string;
  updatedAt?: string;
}

export interface PortraitConfig {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface AvailabilityConfig {
  seeking?: boolean;
  roles?: string[];
  startDate?: string;
  note?: string;
}

export const site = {
  /** Full public identity. Keep the full name visible across the site. */
  fullName: 'Huynh Viet Hung',
  nickname: 'Ian',
  /** Rendered as "Huynh Viet Hung (Ian)". */
  get displayName() {
    return `${this.fullName} (${this.nickname})`;
  },
  tagline: 'Honors Data Science student at Drexel University',
  /** One factual line under the home name. No extra slogan. */
  statusLine: 'Software & Data Engineering Co-op, TPCOMS · Drexel University',
  /** Approved introduction. Preserve this wording verbatim. */
  intro:
    'Hi, I’m Huynh Viet Hung (Ian), a Data Science student at Drexel University interested in data, software development, and AI. I turn ideas into working applications and explore how technology can solve practical problems. Through my projects and internship experience, I’m building technical skills alongside an understanding of how businesses work.',
  /** Short meta description used as the default for pages without their own. */
  description:
    'Portfolio of Huynh Viet Hung (Ian), a Data Science student at Drexel University interested in data, software development, and AI.',

  /**
   * Planned production origin. Registration and connection of this domain are
   * not confirmed yet; see README for how previews override it.
   */
  productionOrigin: 'https://ianhuynh.me',

  /** Preferred public contact email. `null` hides every email action. */
  contactEmail: 'huynhviethung070224@gmail.com',

  /** Approved PDF only. `null` means no resume link is published. */
  resume: null as ResumeConfig | null,

  /** Owner-supplied portrait (inside `public/`). `null` uses the typographic composition. */
  portrait: null as PortraitConfig | null,

  /** `null` makes no public availability claim. Populate only from owner-approved information. */
  availability: null as AvailabilityConfig | null,

  /** Safe background facts used on About and Portfolio. */
  facts: {
    school: 'Drexel University',
    program: 'Data Science',
    origin: 'Vietnam',
    interests: ['data', 'software development', 'AI'],
    hobbies: ['badminton', 'golf', 'basketball'],
    internship: 'Software & Data Engineering Co-op at TPCOMS',
    linkedInSkills: ['Vibe Coding', 'Relational Databases', 'Jupyter'],
  },

  /** Education timeline. Dates and schools are from the exported LinkedIn PDF. */
  education: [
    {
      title: 'Bachelor’s degree, Data Science',
      organization: 'Drexel University College of Computing & Informatics',
      location: undefined,
      description: undefined,
      period: 'Sep 2025 – Jun 2030',
      order: 1,
    },
    {
      title: 'High School Diploma',
      organization: 'International School of Ho Chi Minh City – American Academy',
      location: undefined,
      description: undefined,
      period: 'Sep 2022 – Jun 2025',
      order: 2,
    },
  ],

  /** Work experience. Description and contributions stay absent until supplied. */
  workExperience: [
    {
      title: 'Software & Data Engineering Co-op',
      organization: 'TPCOMS',
      location: 'Ho Chi Minh City, Vietnam',
      description: undefined,
      period: 'Sep 2026 – Present',
      order: 1,
    },
  ] satisfies TimelineEntry[],

  /** Leadership and activities, kept separate from paid/professional work. */
  leadership: [
    {
      title: 'Core Team Member',
      organization: 'Drexel Vietnamese Student Association',
      location: 'Philadelphia, PA',
      period: 'Oct 2025 – Present',
      description: 'Organizing activities that promote and expand Vietnamese culture within the Drexel student community.',
      order: 1,
    },
  ] satisfies TimelineEntry[],
} as const;

validateOptionalPublicAsset(site.resume?.path, 'src/config/site.ts site.resume.path');
validateOptionalPublicAsset(site.portrait?.src, 'src/config/site.ts site.portrait.src');
if (site.resume && !site.resume.path.toLowerCase().endsWith('.pdf')) {
  throw new Error('src/config/site.ts site.resume.path: the resume asset must be a PDF.');
}
if (site.portrait) {
  if (!site.portrait.alt.trim()) throw new Error('src/config/site.ts site.portrait.alt: alt text cannot be empty.');
  if (site.portrait.width <= 0 || site.portrait.height <= 0) {
    throw new Error('src/config/site.ts site.portrait: width and height must be positive numbers.');
  }
}
for (const [groupName, entries] of [
  ['education', site.education],
  ['workExperience', site.workExperience],
  ['leadership', site.leadership],
] as const) {
  for (const [entryIndex, entry] of entries.entries()) {
    const evidenceLinks = (entry as TimelineEntry).evidenceLinks;
    if (evidenceLinks) {
      evidenceLinks.forEach((link, linkIndex) =>
        validateContentLink(link.url, `src/config/site.ts ${groupName}[${entryIndex}].evidenceLinks[${linkIndex}].url`),
      );
    }
  }
}

/** Fixed primary route list. Navigation and footers are built from this. */
export const navRoutes = [
  { label: 'About Me', href: '/about' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
] as const;

export type NavRoute = (typeof navRoutes)[number];

/**
 * Resolve the origin used for canonical URLs, Open Graph and the sitemap.
 *
 * Priority:
 * 1. `PUBLIC_SITE_ORIGIN` (explicit override, e.g. a temporary *.vercel.app URL)
 * 2. Vercel preview deployments (`VERCEL_ENV !== 'production'` + `VERCEL_URL`)
 * 3. The planned production origin.
 */
export function resolveSiteOrigin(env: Record<string, string | undefined> = process.env): string {
  const explicit = env.PUBLIC_SITE_ORIGIN?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const vercelEnv = env.VERCEL_ENV;
  const vercelUrl = env.VERCEL_URL;
  if (vercelEnv && vercelEnv !== 'production' && vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return site.productionOrigin;
}
