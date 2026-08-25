import fs from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'performance-images.config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const dimsPath = path.join(ROOT, config.dimensionsCache);
const dimensions = fs.existsSync(dimsPath)
  ? JSON.parse(fs.readFileSync(dimsPath, 'utf8'))
  : {};

const CLOUDINARY_PATTERN =
  /^https:\/\/res\.cloudinary\.com\/([a-z0-9]+)\/image\/upload\/(.+)$/;
const TRANSFORM_PREFIX =
  /^(?:a|ac|ar|b|bl|bo|br|c|co|cs|d|dn|dpr|du|e|eo|f|fl|fn|fps|g|h|if|ki|l|o|pg|q|r|so|t|u|vc|vs|w|x|y|z)_/;

function isTransformSegment(segment) {
  return segment.split(',').every((part) => TRANSFORM_PREFIX.test(part));
}

export function parseCloudinaryUrl(src) {
  const match = CLOUDINARY_PATTERN.exec(src.trim());
  if (!match) return null;

  const [pathWithoutQuery] = match[2].split(/[?#]/, 1);
  const parts = pathWithoutQuery.split('/').filter(Boolean);
  const versionIndex = parts.findIndex((part) => /^v\d+$/.test(part));

  let deliveryParts;
  let publicIdParts;
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

function responsiveAttributes(src) {
  const parsed = parseCloudinaryUrl(src);
  if (!parsed) return null;

  const preserveOptimizedOriginal = /\.(?:webp|avif)$/i.test(parsed.publicId);
  const imageUrl = (width) =>
    `https://res.cloudinary.com/${parsed.cloud}/image/upload/w_${width},q_${config.quality},f_auto/${parsed.deliveryPath}`;
  const intrinsic = dimensions[parsed.publicId];
  const largestWidth = Math.max(...config.widths);

  return {
    src: preserveOptimizedOriginal ? parsed.original : imageUrl(largestWidth),
    srcset: preserveOptimizedOriginal
      ? null
      : config.widths
          .map((width) => `${imageUrl(width)} ${width}w`)
          .join(', '),
    sizes: config.sizes,
    width: intrinsic ? String(intrinsic.w) : null,
    height: intrinsic ? String(intrinsic.h) : null,
  };
}

export function rehypeResponsiveCloudinary() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') return;
      const attrs = responsiveAttributes(String(node.properties?.src || ''));
      if (!attrs) return;
      node.properties.src = attrs.src;
      if (attrs.srcset && !node.properties.srcset) {
        node.properties.srcset = attrs.srcset;
        node.properties.sizes = node.properties.sizes || attrs.sizes;
      }
      if (attrs.width && !node.properties.width) {
        node.properties.width = attrs.width;
        node.properties.height = attrs.height;
      }
    });

    visit(tree, ['mdxJsxFlowElement', 'mdxJsxTextElement'], (node) => {
      if (node.name !== 'img') return;
      const findAttribute = (name) =>
        node.attributes.find(
          (attribute) =>
            attribute.type === 'mdxJsxAttribute' && attribute.name === name,
        );
      const src = findAttribute('src');
      if (!src || typeof src.value !== 'string') return;
      const attrs = responsiveAttributes(src.value);
      if (!attrs) return;
      src.value = attrs.src;
      const add = (name, value) => {
        if (!findAttribute(name)) {
          node.attributes.push({ type: 'mdxJsxAttribute', name, value });
        }
      };
      if (attrs.srcset) {
        add('srcset', attrs.srcset);
        add('sizes', attrs.sizes);
      }
      if (attrs.width) {
        add('width', attrs.width);
        add('height', attrs.height);
      }
    });
  };
}
