export const SITE_URL = "https://listacaen.ro";
export const SITE_NAME = "listacaen.ro";

export function caenPath(slug: string) {
  return `/caen/${slug}/`;
}

export function absoluteUrl(path: string) {
  if (path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
