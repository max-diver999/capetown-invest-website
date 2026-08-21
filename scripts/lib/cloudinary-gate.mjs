/**
 * Cloudinary delivery checks.
 *
 * Heroes on this site are still served from their source CDN, so there is no
 * Cloudinary-specific rule to enforce yet. Keeping the module here (rather than
 * importing it from a sibling workspace) is what lets validate:content and
 * qa:full run on a clean clone and in CI.
 */
export function runCloudinaryDeliveryChecks() {}

export function deliveryUrl(url) {
  return url;
}
