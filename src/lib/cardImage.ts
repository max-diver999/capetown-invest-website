/**
 * Card thumbnail URLs — Cloudinary crop when available; external CDN as-is.
 */
import { cloudinaryDeliveryUrl } from './cloudinary';

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
