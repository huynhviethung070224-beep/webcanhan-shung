/**
 * Central site/profile configuration.
 *
 * Edit this file to update the owner's identity, introduction, interests,
 * production origin, contact email and CV path. Presentation components read
 * from here and never hard-code these values.
 */

export const site = {
  /** Full public identity. Keep the full name visible across the site. */
  fullName: 'Huynh Viet Hung',
  nickname: 'Ian',
  /** Rendered as "Huynh Viet Hung (Ian)". */
  get displayName() {
    return `${this.fullName} (${this.nickname})`;
  },
  tagline: 'Data Science student at Drexel University',
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
  contactEmail: null as string | null,

  /**
   * Path (inside `public/`) to the approved CV PDF, e.g. '/cv/huynh-viet-hung-cv.pdf'.
   * `null` hides the Download CV action everywhere.
   */
  cvPath: null as string | null,

  /** Owner-supplied portrait (inside `public/`). `null` uses the typographic composition. */
  portrait: null as { src: string; alt: string; width: number; height: number } | null,

  /** Safe background facts used on About and Portfolio. */
  facts: {
    school: 'Drexel University',
    program: 'Data Science',
    origin: 'Vietnam',
    interests: ['data', 'software development', 'AI'],
    hobbies: ['badminton', 'golf', 'basketball'],
    internship: 'Internship experience in Vietnam',
  },

  /** Education timeline. Only confirmed entries. Add `period` once supplied. */
  education: [
    {
      institution: 'Drexel University',
      detail: 'Data Science student',
      period: null as string | null,
    },
  ],

  /** Experience timeline. Only confirmed entries. Employer names are not yet supplied. */
  experience: [
    {
      title: 'Internship experience',
      detail: 'Internship experience in Vietnam, building technical skills alongside an understanding of how businesses work.',
      period: null as string | null,
    },
  ],
} as const;

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
