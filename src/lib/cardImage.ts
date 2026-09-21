/**
 * Card thumbnail URLs — Cloudinary crop when available; external CDN as-is.
 */
import { cloudinaryDeliveryUrl } from './cloudinary';
import { r2Responsive, isR2Url, type ResponsiveImage } from './r2Image';

/**
 * Карточка списка с выбором размера. Раньше карточки на R2 получали полноразмерный файл героя:
 * в плитку 640 на 360 приезжала картинка на 1200 пикселей, потому что обрезку делал Cloudinary, а
 * на чужом адресе функция молча отдавала ссылку как есть.
 */
export function getCardImage(
  src: string | undefined,
  size: 'card' | 'hero' | 'band' = 'card',
): ResponsiveImage | null {
  if (!src?.trim()) return null;
  if (isR2Url(src)) return r2Responsive(src, size === 'card' ? 'card' : size === 'band' ? 'band' : 'hero');
  return { src: getCardImageUrl(src, size) };
}

export function getCardImageUrl(src: string | undefined, size: 'card' | 'hero' | 'band' = 'card'): string {
  if (!src?.trim()) return '';

  const trimmed = src.trim();

  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/upload/')) {
    const dims =
      size === 'band'
        ? 'w_1600,h_580,c_fill,g_auto,q_auto:good,f_auto'
        : size === 'hero'
          ? 'w_1280,h_512,c_fill,g_auto,q_auto:eco,f_auto'
          : 'w_640,h_360,c_fill,g_auto,q_auto:eco,f_auto';
    return cloudinaryDeliveryUrl(trimmed, dims);
  }

  return trimmed;
}

export function formatAreaLabel(area?: string): string {
  if (!area) return '';
  return area
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatZar(price?: number): string {
  if (!price || price <= 0) return '';
  if (price >= 1_000_000) return `R${(price / 1_000_000).toFixed(1)}m`;
  return `R${Math.round(price / 1000)}k`;
}
