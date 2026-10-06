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
    ],
  },
];

/** Certificates and additional experience. Empty until approved wording is supplied. */
export const certificates: { title: string; issuer: string; year?: string; url?: string }[] = [];
