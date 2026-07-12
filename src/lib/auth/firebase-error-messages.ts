const FIREBASE_ERROR_KEYS: Record<string, string> = {
  'auth/invalid-credential': 'invalidCredentials',
  'auth/wrong-password': 'invalidCredentials',
  'auth/user-not-found': 'invalidCredentials',
  'auth/email-already-in-use': 'emailInUse',
  'auth/invalid-email': 'email',
  'auth/weak-password': 'passwordLength',
  'auth/too-many-requests': 'tooManyRequests',
  'auth/network-request-failed': 'network',
};

/** Maps a Firebase Auth error code to a translation key in the `Errors` i18n namespace. */
export function getFirebaseAuthErrorKey(code: string): string {
  return FIREBASE_ERROR_KEYS[code] ?? 'generic';
}
