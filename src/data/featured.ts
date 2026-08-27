/** Editorial picks for homepage featured grids (order preserved). */
export const FEATURED_PROJECT_SLUGS = [
  'oneonr-de-waterkant',
  'skywater-century-city',
  'the-charlotte-cape-town',
] as const;

export const HOMEPAGE_HERO_PROJECT_SLUG = 'oneonr-de-waterkant' as const;

export const FEATURED_GUIDE_SLUGS = [
  'cape-town-remote-work-visa-property',
  'retirement-visa-south-africa-property',
  'cape-town-property-market-data-lightstone',
  'does-buying-property-give-residency-south-africa',
] as const;

export const FEATURED_AREA_SLUGS = [
  'de-waterkant-property-investment',
  'v-and-a-waterfront-property-investment',
] as const;

export const FEATURED_DEVELOPER_SLUGS = [
  'blok-urban-developers',
  'prospekt-property-development',
] as const;

/**
 * The "tablecloth" cloud pouring over Table Mountain — the image the whole
 * design direction is built around. CC BY-SA 3.0, so the credit below is a
 * licence condition, not decoration: it must stay visible on every breakpoint.
 */
export const HOMEPAGE_HERO_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Cape_Town%2C_Table_Mountain%2C_Table_Cloth.jpg/1920px-Cape_Town%2C_Table_Mountain%2C_Table_Cloth.jpg';

export const HOMEPAGE_HERO_CREDIT = {
  place: 'Table Mountain · the tablecloth',
  author: 'KodachromeFan',
  authorUrl: 'https://commons.wikimedia.org/wiki/User:KodachromeFan',
  sourceUrl:
    'https://commons.wikimedia.org/wiki/File:Cape_Town,_Table_Mountain,_Table_Cloth.jpg',
  licence: 'CC BY-SA 3.0',
  licenceUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
} as const;
