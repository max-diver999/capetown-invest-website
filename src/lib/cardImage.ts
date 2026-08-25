/**
 * Card thumbnail URLs — Cloudinary crop when available; external CDN as-is.
 */
import { cloudinaryDeliveryUrl } from './cloudinary';

export function getCardImageUrl(src: string | undefined, size: 'card' | 'hero' = 'card'): string {
  if (!src?.trim()) return '';

  const trimmed = src.trim();

  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/upload/')) {
    const dims = size === 'hero' ? 'w_1400,h_560,c_fill,q_auto:eco,f_auto' : 'w_640,h_360,c_fill,q_auto:eco,f_auto';
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
