/**
 * Social links shown in the Connect section on /contact and referenced in the footer.
 *
 * Add or remove platforms by editing this array. Keep URLs exactly as the owner
 * supplied them (spelling, case, underscores and the `-beep` GitHub suffix).
 * Only entries with a real `url` are rendered.
 */

export type SocialIcon = 'github' | 'linkedin' | 'youtube' | 'instagram' | 'facebook' | 'mail' | 'link';

export interface SocialLink {
  /** Stable key, e.g. "github". */
  platform: string;
  /** Visible platform name. */
  label: string;
  /** Exact destination URL. */
  url: string;
  /** Optional visible handle. */
  handle?: string;
  /** Icon key rendered by `SocialIcon.astro`. */
  icon: SocialIcon;
  /** Visually prominent tile (used for GitHub and LinkedIn). */
  featured?: boolean;
}

export const socialLinks: SocialLink[] = [
  {
    platform: 'github',
    label: 'GitHub',
    url: 'https://github.com/huynhviethung070224-beep',
    handle: 'huynhviethung070224-beep',
    icon: 'github',
    featured: true,
  },
  {
    platform: 'linkedin',
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/viethunghuynh07/',
    handle: 'viethunghuynh07',
    icon: 'linkedin',
    featured: true,
  },
  {
    platform: 'youtube',
    label: 'YouTube',
    url: 'https://www.youtube.com/@huynhviethung4151',
    handle: '@huynhviethung4151',
    icon: 'youtube',
  },
  {
    platform: 'instagram',
    label: 'Instagram',
    url: 'https://www.instagram.com/lokian__07/',
    handle: '@lokian__07',
    icon: 'instagram',
  },
  {
    platform: 'facebook',
    label: 'Facebook',
    url: 'https://www.facebook.com/BEGATLOKI',
    handle: 'BEGATLOKI',
    icon: 'facebook',
  },
];

/** Only links with a real destination are published. */
export const publishedSocialLinks = socialLinks.filter((link) => Boolean(link.url?.trim()));
