/** Route pathnames (without a locale prefix) that require an authenticated session. */
export const PROTECTED_PATHS = ['/history'];

/** Route pathnames (without a locale prefix) only for non-authenticated users. */
export const GUEST_ONLY_PATHS = ['/sign-in', '/sign-up'];

function matchesPath(pathnameWithoutLocale: string, paths: string[]): boolean {
  return paths.some(
    (path) => pathnameWithoutLocale === path || pathnameWithoutLocale.startsWith(`${path}/`),
  );
}

export function isProtectedPath(pathnameWithoutLocale: string): boolean {
  return matchesPath(pathnameWithoutLocale, PROTECTED_PATHS);
}

export function isGuestOnlyPath(pathnameWithoutLocale: string): boolean {
  return matchesPath(pathnameWithoutLocale, GUEST_ONLY_PATHS);
}
