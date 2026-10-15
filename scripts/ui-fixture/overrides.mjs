/**
 * Config values injected into the temporary fixture copy only.
 * Every string is visibly labelled as fixture data; none of it is a real claim.
 */
const fixtureEntry = {
  title: 'Fixture Role',
  organization: 'Fixture Organization',
  location: 'Fixture City',
  period: 'Fixture period',
  description: 'Fixture description used only to test layout.',
  contributions: [
    'Fixture contribution one, long enough to wrap across two lines on a narrow phone screen for layout testing.',
    'Fixture contribution two.',
  ],
  technologies: ['Fixture SQL', 'Fixture Python'],
  evidenceLinks: [
    { label: 'Fixture internal evidence', url: '/projects/library-management-system' },
    { label: 'Fixture external evidence', url: 'https://example.com/fixture' },
  ],
  order: 1,
};

/** Scenarios for `prepareFixture()` (see lib.mjs). */
export const scenarios = {
  full: {
    content: true,
    assets: true,
    site: {
      resume: { path: '/resume/fixture-resume.pdf', label: 'Download Resume', updatedAt: 'Fixture date' },
      portrait: { src: '/about/fixture-portrait.png', alt: 'Fixture portrait image (not a real photo of the owner).', width: 320, height: 900 },
      availability: {
        seeking: true,
        roles: ['Fixture Role A', 'Fixture Role B'],
        startDate: 'Fixture date',
        note: 'Fixture availability note — not a real claim.',
      },
      workExperience: [fixtureEntry, { ...fixtureEntry, title: 'Second Fixture Role', evidenceLinks: [], order: 2 }],
      leadership: [{ ...fixtureEntry, title: 'Fixture Leadership Role', technologies: [], order: 1 }],
    },
    certificates: [
      {
        title: 'Fixture certificate with every field',
        issuer: 'Fixture Issuer',
        issuedAt: 'Fixture date',
        credentialId: 'FIXTURE-1234-ABCD-5678',
        verificationUrl: 'https://example.com/verify/fixture',
        asset: { type: 'image', src: '/certificates/fixture-cert.webp', alt: 'Fixture certificate image.' },
        order: 1,
      },
      {
        title: 'Fixture certificate with a PDF and no verification URL',
        issuer: 'Fixture Issuer',
        asset: { type: 'pdf', src: '/certificates/fixture-cert.pdf' },
        order: 2,
      },
      { title: 'Fixture certificate with title only', order: 3 },
    ],
  },
  sparse: {
    site: {
      contactEmail: null,
      resume: null,
      portrait: null,
      availability: null,
      workExperience: [],
      leadership: [],
    },
    certificates: [],
  },
};
