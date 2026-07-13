import { isFirebaseAdminConfigured, getAdminAuth } from '@/lib/firebase/admin';

export const SESSION_COOKIE_NAME = 'session';

/** 5 days, matches the Firebase session cookie recommendation. */
export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;

export async function verifySessionCookie(cookieValue: string | undefined) {
  if (!cookieValue || !isFirebaseAdminConfigured) {
    return null;
  }

  try {
    return await getAdminAuth().verifySessionCookie(cookieValue, true);
  } catch {
    return null;
  }
}
