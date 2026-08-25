import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const config = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'performance-images.config.json'), 'utf8'),
);
const outputPath = path.join(ROOT, config.dimensionsCache);
const CLOUDINARY_PATTERN =
  /https:\/\/res\.cloudinary\.com\/([a-z0-9]+)\/image\/upload\/([^"'\s)]+)/g;
const TRANSFORM_PREFIX =
  /^(?:a|ac|ar|b|bl|bo|br|c|co|cs|d|dn|dpr|du|e|eo|f|fl|fn|fps|g|h|if|ki|l|o|pg|q|r|so|t|u|vc|vs|w|x|y|z)_/;

function isTransformSegment(segment) {
  return segment.split(',').every((part) => TRANSFORM_PREFIX.test(part));
}

function parseDeliveryPath(value) {
  const [pathWithoutQuery] = value.split(/[?#]/, 1);
  const parts = pathWithoutQuery.split('/').filter(Boolean);
  const versionIndex = parts.findIndex((part) => /^v\d+$/.test(part));
  if (versionIndex >= 0) {
    return {
      publicId: parts.slice(versionIndex + 1).join('/'),
      deliveryPath: parts.slice(versionIndex).join('/'),
    };
  }

  let firstPublicId = 0;
  while (
    firstPublicId < parts.length - 1 &&
    isTransformSegment(parts[firstPublicId])
  ) {
    firstPublicId += 1;
  }
  const publicParts = parts.slice(firstPublicId);
  return {
    publicId: publicParts.join('/'),
    deliveryPath: publicParts.join('/'),
  };
}

const images = new Map();
for (const collection of config.collections) {
  const directory = path.join(ROOT, 'src/content', collection);
  if (!fs.existsSync(directory)) continue;
  for (const filename of fs.readdirSync(directory)) {
    if (!filename.endsWith('.mdx') && !filename.endsWith('.md')) continue;
    const source = fs.readFileSync(path.join(directory, filename), 'utf8');
    for (const match of source.matchAll(CLOUDINARY_PATTERN)) {
      const parsed = parseDeliveryPath(match[2]);
      if (parsed.publicId) {
        images.set(parsed.publicId, {
          cloud: match[1],
          deliveryPath: parsed.deliveryPath,
        });
      }
    }
  }
}

const cache = fs.existsSync(outputPath)
  ? JSON.parse(fs.readFileSync(outputPath, 'utf8'))
  : {};
const queue = [...images].filter(([id]) => !cache[id]);
let completed = 0;
let failed = 0;

async function worker() {
  while (queue.length) {
    const [id, image] = queue.shift();
    try {
      const response = await fetch(
        `https://res.cloudinary.com/${image.cloud}/image/upload/fl_getinfo/${image.deliveryPath}`,
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const info = await response.json();
      const { width, height } = info.input || {};
      if (!width || !height) throw new Error('missing dimensions');
      cache[id] = { w: width, h: height };
      completed += 1;
    } catch {
      failed += 1;
    }
  }
}

await Promise.all(Array.from({ length: 10 }, worker));
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(cache, null, 1)}\n`);
console.log(
  `[speed-kit] ${images.size} images, ${completed} cached, ${failed} failed, ${Object.keys(cache).length} total`,
);
if (failed) process.exitCode = 1;
