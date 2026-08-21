/**
 * Single source of truth for site navigation.
 * Consumed by Header (desktop + mobile), Footer and hub cross-links.
 */

export interface NavItem {
  label: string;
  href: string;
  note?: string;
}

/** Primary sections shown in the desktop bar and the mobile panel. */
export const PRIMARY_NAV: NavItem[] = [
  { label: 'Guides', href: '/guides/', note: 'Buying process, tax, yields' },
  { label: 'Areas', href: '/areas/', note: 'Suburb-by-suburb data' },
  { label: 'Projects', href: '/projects/', note: 'Independent development reviews' },
  { label: 'Compare', href: '/compare/', note: 'Cape Town vs other markets' },
  { label: 'Segments', href: '/segments/', note: 'Guides by buyer nationality' },
  { label: 'Developers', href: '/developers/', note: 'Track record checks' },
  { label: 'News', href: '/news/', note: 'Market updates' },
];

/** Secondary pages — About/Contact and the two lead surfaces. */
export const UTILITY_NAV: NavItem[] = [
  { label: 'About', href: '/about/' },
  { label: 'Methodology', href: '/methodology/' },
  { label: 'Contact', href: '/contact/' },
  { label: 'Consultation', href: '/consultation/' },
];

/** Highest-intent guides surfaced in the footer "Start here" block. */
export const PILLAR_GUIDES: NavItem[] = [
  { label: 'Buying as a foreigner', href: '/guides/buy-cape-town-property-foreigner/' },
  { label: 'Cape Town property rates', href: '/guides/cape-town-rates-taxes-property/' },
  { label: 'Short-term rental rules', href: '/guides/short-term-rental-rules-cape-town/' },
  { label: 'Transfer duty explained', href: '/guides/south-africa-transfer-duty-explained/' },
  { label: 'Rental yield guide', href: '/guides/cape-town-rental-yield-guide/' },
];

export const LEGAL_NAV: NavItem[] = [
  { label: 'Privacy', href: '/privacy-policy/' },
  { label: 'Terms', href: '/terms/' },
];
