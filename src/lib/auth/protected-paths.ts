/** Route pathnames (without a locale prefix) that require an authenticated session. */
export const PROTECTED_PATHS = ['/history'];

export function isProtectedPath(pathnameWithoutLocale: string): boolean {
  return PROTECTED_PATHS.some(
    (path) => pathnameWithoutLocale === path || pathnameWithoutLocale.startsWith(`${path}/`),
  );
}
