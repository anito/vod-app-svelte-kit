export const getFragment = () => window.location.hash.slice(1);

/**
 * @param {import('@sveltejs/kit').Page} $page
 * @returns {string}
 */
export function getSegment($page) {
  const matches = $page.url.pathname.match(/\/([a-z_-]*)/) || [];
  if (matches.length >= 2) {
    return matches[1];
  }
  return '';
}
