import dimensions from '../../scripts/data/capetown-cloudinary-image-dims.json';

const CLOUDINARY_PATTERN =
  /^https:\/\/res\.cloudinary\.com\/([a-z0-9]+)\/image\/upload\/(.+)$/;
const CLOUDINARY_BASE = 'https://res.cloudinary.com';
const ARTICLE_WIDTHS = [640, 960, 1200];
const ARTICLE_SIZES = '(max-width: 768px) calc(100vw - 2rem), 72ch';
const TRANSFORM_PREFIX =
  /^(?:a|ac|ar|b|bl|bo|br|c|co|cs|d|dn|dpr|du|e|eo|f|fl|fn|fps|g|h|if|ki|l|o|pg|q|r|so|t|u|vc|vs|w|x|y|z)_/;

type ImageDimensions = { w: number; h: number };

export type ParsedCloudinaryUrl = {
  cloud: string;
  publicId: string;
  deliveryPath: string;
  original: string;
};

function isTransformSegment(segment: string): boolean {
  return segment.split(',').every((part) => TRANSFORM_PREFIX.test(part));
}

export function parseCloudinaryUrl(src: string): ParsedCloudinaryUrl | null {
  const match = CLOUDINARY_PATTERN.exec(src.trim());
  if (!match) return null;

  const [pathWithoutQuery] = match[2].split(/[?#]/, 1);
  const parts = pathWithoutQuery.split('/').filter(Boolean);
  const versionIndex = parts.findIndex((part) => /^v\d+$/.test(part));

  let deliveryParts: string[];
  let publicIdParts: string[];
  if (versionIndex >= 0) {
    deliveryParts = parts.slice(versionIndex);
    publicIdParts = parts.slice(versionIndex + 1);
  } else {
    let firstPublicId = 0;
    while (
      firstPublicId < parts.length - 1 &&
      isTransformSegment(parts[firstPublicId])
    ) {
      firstPublicId += 1;
    }
    deliveryParts = parts.slice(firstPublicId);
    publicIdParts = deliveryParts;
  }

  if (!publicIdParts.length) return null;
  return {
    cloud: match[1],
    publicId: publicIdParts.join('/'),
    deliveryPath: deliveryParts.join('/'),
    original: src,
  };
}

export function cloudinaryDeliveryUrl(
  src: string,
  transform: string,
): string {
  const parsed = parseCloudinaryUrl(src);
  if (!parsed) return src;
  return `${CLOUDINARY_BASE}/${parsed.cloud}/image/upload/${transform}/${parsed.deliveryPath}`;
}

export function responsiveCloudinary(src: string) {
  const parsed = parseCloudinaryUrl(src);
  if (!parsed) return { src };

  const intrinsic = (dimensions as Record<string, ImageDimensions>)[parsed.publicId];
  const preserveOptimizedOriginal = /\.(?:webp|avif)$/i.test(parsed.publicId);
  if (preserveOptimizedOriginal) {
    return {
      src: parsed.original,
      width: intrinsic?.w,
      height: intrinsic?.h,
    };
  }

  const imageUrl = (width: number) =>
    cloudinaryDeliveryUrl(src, `w_${width},q_auto:eco,f_auto`);

  return {
    src: imageUrl(ARTICLE_WIDTHS[ARTICLE_WIDTHS.length - 1]),
    srcset: ARTICLE_WIDTHS.map((width) => `${imageUrl(width)} ${width}w`).join(', '),
    sizes: ARTICLE_SIZES,
    width: intrinsic?.w,
    height: intrinsic?.h,
  };
}

type HeroBand = { narrow: string; wide: string };

function heroBandFor(ratio: number | undefined): HeroBand {
  if (ratio === undefined) return { narrow: '16:10', wide: '21:9' };
  if (ratio >= 1.6) return { narrow: '16:10', wide: '21:9' };
  if (ratio >= 1.2) return { narrow: '16:10', wide: '2:1' };
  if (ratio >= 0.95) return { narrow: '4:3', wide: '16:9' };
  return { narrow: '4:3', wide: '3:2' };
}

const HERO_WIDTHS = [640, 960, 1280, 1600];

export function heroCloudinary(src: string) {
  const parsed = parseCloudinaryUrl(src);
  if (!parsed) return null;

  const intrinsic = (dimensions as Record<string, ImageDimensions>)[parsed.publicId];
  const ratio = intrinsic?.w && intrinsic?.h ? intrinsic.w / intrinsic.h : undefined;
  const band = heroBandFor(ratio);

  const widths = intrinsic?.w
    ? (HERO_WIDTHS.filter((w) => w <= intrinsic.w).length
        ? HERO_WIDTHS.filter((w) => w <= intrinsic.w)
        : [intrinsic.w])
    : HERO_WIDTHS;

  const variants = (ar: string) => {
    const url = (width: number) =>
      cloudinaryDeliveryUrl(src, `c_fill,g_auto,ar_${ar},w_${width},q_auto,f_auto`);
    return {
      src: url(widths[widths.length - 1]),
      srcset: widths.map((w) => `${url(w)} ${w}w`).join(', '),
      ar,
    };
  };

  const narrow = variants(band.narrow);
  const wide = variants(band.wide);
  const [nw, nh] = band.narrow.split(':').map(Number);

  return {
    narrow,
    wide,
    sizes: '(max-width: 899px) 100vw, min(68rem, 100vw)',
    narrowRatio: band.narrow.replace(':', ' / '),
    wideRatio: band.wide.replace(':', ' / '),
    width: 1600,
    height: Math.round((1600 * nh) / nw),
  };
}
