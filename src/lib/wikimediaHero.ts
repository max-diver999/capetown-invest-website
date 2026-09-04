/** Responsive Wikimedia Commons thumb URLs for homepage LCP. */
const WIKIMEDIA_THUMB_WIDTHS = [640, 960, 1280, 1920] as const;

function thumbAtWidth(url: string, width: number): string {
  return url.replace(/\/(\d+)px-/, `/${width}px-`);
}

export function wikimediaResponsiveHero(url: string) {
  const widths = [...WIKIMEDIA_THUMB_WIDTHS];
  const mobileSrc = thumbAtWidth(url, widths[0]);
  const srcset = widths.map((w) => `${thumbAtWidth(url, w)} ${w}w`).join(', ');

  return {
    src: mobileSrc,
    srcset,
    sizes: '100vw',
    preloadSrc: mobileSrc,
    width: 1920,
    height: 1283,
  };
}
