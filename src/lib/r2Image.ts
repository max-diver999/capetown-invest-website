/**
 * Картинки с Cloudflare R2: выбор размера под экран.
 *
 * Зачем это нужно. Раньше размер под устройство считал Cloudinary на лету, и за каждую такую
 * трансформацию мы платили. Переезд на R2 убрал плату, но вместе с ней и выбор: на R2 лежал один
 * файл на картинку, и телефон качал ровно то же, что и компьютер. На главной это был файл 211 КБ
 * там, где хватает 12 КБ.
 *
 * Теперь рядом с каждой картинкой лежат её узкие версии (скрипт scripts/r2-add-widths.mjs), а
 * какие именно, записано в src/data/r2-image-widths.json. Здесь этот список превращается в srcset,
 * то есть в предложение браузеру: вот размеры, возьми подходящий. Считать на лету никому не надо,
 * платить не за что, а телефон получает маленький файл.
 *
 * Правило имён: hero.webp, рядом hero-w360.webp, hero-w640.webp, hero-w960.webp.
 */
import widthManifest from '../data/r2-image-widths.json';

export const R2_HOST = 'pub-2855c73eea384110b510f25966292c37.r2.dev';
export const R2_BASE = `https://${R2_HOST}`;

type Entry = { w: number; h: number; variants: number[] };
const MANIFEST = widthManifest as Record<string, Entry>;

/** Слоты, в которых картинка реально показывается. От них зависит, какой файл возьмёт браузер. */
export const SIZES = {
  /** Главная картинка страницы: на телефоне во всю ширину, на большом экране ограничена колонкой. */
  hero: '(max-width: 899px) 100vw, min(68rem, 100vw)',
  /**
   * Карточка в списке. Числа не круглые намеренно: замерено на живом сайте 21.09.2026, при экране
   * 375 карточка занимает 335 точек, то есть поля съедают 40. Если написать здесь 100vw, браузер
   * поверит на слово, посчитает 390 на 2 и возьмёт файл 960 вместо 768. Круглое число тут стоит
   * полутора мегабайт на странице с сорока семью карточками.
   */
  card: '(max-width: 599px) calc(100vw - 40px), (max-width: 1023px) calc(50vw - 30px), calc(33vw - 30px)',
  /** Картинка внутри текста: шириной с колонку. */
  inline: '(max-width: 899px) 100vw, 44rem',
  /** Широкая полоса во всю ширину экрана. */
  band: '100vw',
} as const;

export type ResponsiveImage = {
  src: string;
  srcset?: string;
  sizes?: string;
  width?: number;
  height?: number;
};

export function isR2Url(src: string | undefined | null): boolean {
  return typeof src === 'string' && src.includes(R2_HOST);
}

/** Из полного адреса достаём ключ, по которому картинка лежит в манифесте. */
export function r2Key(src: string): string | null {
  const i = src.indexOf(R2_HOST);
  if (i < 0) return null;
  const key = src.slice(i + R2_HOST.length).replace(/^\//, '').split('?')[0];
  return key || null;
}

function variantUrl(key: string, width: number): string {
  return `${R2_BASE}/${key.replace(/\.webp$/i, `-w${width}.webp`)}`;
}

/**
 * Главное здесь: в srcset попадают только те ширины, которые реально залиты. Гадать нельзя, иначе
 * браузер запросит несуществующий файл и получит 404 вместо картинки.
 */
export function r2Responsive(
  src: string | undefined | null,
  slot: keyof typeof SIZES = 'hero',
): ResponsiveImage | null {
  if (!src?.trim()) return null;
  const trimmed = src.trim();
  const key = r2Key(trimmed);
  if (!key) return null;

  const entry = MANIFEST[key];
  if (!entry) {
    // Картинки нет в манифесте: отдаём как есть, но честно, без придуманных размеров.
    return { src: trimmed };
  }

  const candidates = [...(entry.variants || [])].filter((w) => w < entry.w).sort((a, b) => a - b);
  if (!candidates.length) {
    return { src: trimmed, width: entry.w, height: entry.h };
  }

  const srcset = [
    ...candidates.map((w) => `${variantUrl(key, w)} ${w}w`),
    `${R2_BASE}/${key} ${entry.w}w`,
  ].join(', ');

  return {
    src: trimmed,
    srcset,
    sizes: SIZES[slot],
    width: entry.w,
    height: entry.h,
  };
}

/** Самый узкий из залитых вариантов: им грузят главную картинку экрана на телефоне. */
export function r2NarrowSrc(src: string | undefined | null): string | null {
  if (!src?.trim()) return null;
  const key = r2Key(src.trim());
  if (!key) return null;
  const entry = MANIFEST[key];
  const narrowest = entry?.variants?.length ? Math.min(...entry.variants) : null;
  return narrowest ? variantUrl(key, narrowest) : src.trim();
}
