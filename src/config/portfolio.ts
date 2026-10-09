/**
 * Portfolio page content: skills grouped by the project that demonstrates them.
 * Every skill links back to the case study that is its evidence.
 * Add certificates/experience entries here once their approved wording exists.
 */

export interface SkillGroup {
  title: string;
  /** Project slug that provides the evidence. */
  projectSlug: string;
  projectTitle: string;
  role: string;
  skills: string[];
  /** Plain-language contributions, taken from the approved descriptions. */
  contributions: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    title: 'Backend & cloud data',
    projectSlug: 'dragon-go',
    projectTitle: 'DragonGo',
    role: 'Backend & Database Developer',
    skills: ['JavaScript', 'Firebase Authentication', 'Cloud Firestore', 'Per-user data synchronization'],
    contributions: [
      'Integrated Firebase Authentication for user sign-in.',
      'Synchronized users’ personal schedules and account data in Cloud Firestore.',
      'Worked on the backend of a campus navigation app with schedule-aware route planning and AI-assisted scheduling.',
    ],
  },
  {
    title: 'Relational databases & SQL',
    projectSlug: 'library-management-system',
    projectTitle: 'Library Management System',
    role: 'SQL Database Developer',
    skills: ['PostgreSQL', 'SQL', 'Normalized schema design', 'Reporting queries'],
    contributions: [
      'Designed a normalized database with six relational tables for books, members, branches, and borrowing records.',
      'Developed SQL reports covering overdue books, rental income, borrowing activity, and branch performance.',
      'Schema in the repository: branch, employees, members, books, issued_status, and return_status.',
    ],
  },
  {
    title: 'Product engineering',
    projectSlug: 'badminton-fairplay-queue',
    projectTitle: 'Badminton FairPlay Queue',
    role: 'Developer',
    skills: ['TypeScript', 'React', 'Supabase', 'PostgreSQL'],
    contributions: [
      'Built a mobile-first queue and three-court app for a small badminton club.',
      'Members sign in anonymously; administrators keep a separate member and payment directory.',
      'Fairness logic stays independent of payment status and court skill labels.',
    ],
  },
  {
    title: 'SQL for business questions',
    projectSlug: 'retail-sales-analysis',
    projectTitle: 'Retail Sales Analysis',
    role: 'SQL Developer',
    skills: ['PostgreSQL', 'SQL', 'Data cleaning', 'Aggregation'],
    contributions: [
      'Created and cleaned a retail sales table, removing rows with missing values.',
      'Wrote queries for category sales, a clothing subset, and average customer age in one category.',
    ],
  },
];

/** Certificates named on the exported LinkedIn PDF. Issuers were not on the export. */
export const certificates: { title: string; issuer?: string; year?: string; url?: string }[] = [
  { title: 'Databases and SQL for Data Science' },
  { title: 'Vibe Coding Fundamentals' },
];
