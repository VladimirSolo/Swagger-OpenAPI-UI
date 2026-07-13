import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApp = { name: 'app' };
const mockAuth = { name: 'auth' };
const mockFirestore = { name: 'firestore' };

const getAppsMock = vi.fn();
const initializeAppMock = vi.fn<(config: unknown) => typeof mockApp>().mockReturnValue(mockApp);
const getAuthMock = vi.fn<(app: unknown) => typeof mockAuth>().mockReturnValue(mockAuth);
const getFirestoreMock = vi
  .fn<(app: unknown) => typeof mockFirestore>()
  .mockReturnValue(mockFirestore);

vi.mock('firebase/app', () => ({
  getApps: () => getAppsMock(),
  initializeApp: (config: unknown) => initializeAppMock(config),
}));
vi.mock('firebase/auth', () => ({
  getAuth: (app: unknown) => getAuthMock(app),
}));
vi.mock('firebase/firestore', () => ({
  getFirestore: (app: unknown) => getFirestoreMock(app),
}));

describe('firebase client', () => {
  beforeEach(() => {
    vi.resetModules();
    getAppsMock.mockReset().mockReturnValue([]);
    initializeAppMock.mockClear();
    getAuthMock.mockClear();
    getFirestoreMock.mockClear();
  });

  it('is not configured when no NEXT_PUBLIC_FIREBASE_* env vars are set', async () => {
    const { isFirebaseClientConfigured } = await import('./client');
    expect(isFirebaseClientConfigured).toBe(false);
  });

  it('lazily initializes the Firebase app only once, reusing an existing app if present', async () => {
    getAppsMock.mockReturnValue([mockApp]);
    const { getFirebaseAuth, getFirebaseFirestore } = await import('./client');

    const auth = getFirebaseAuth();
    const firestore = getFirebaseFirestore();

    expect(auth).toBe(mockAuth);
    expect(firestore).toBe(mockFirestore);
    expect(initializeAppMock).not.toHaveBeenCalled();
    expect(getAuthMock).toHaveBeenCalledWith(mockApp);
    expect(getFirestoreMock).toHaveBeenCalledWith(mockApp);
  });

  it('initializes a new app when none exists yet, and caches auth/firestore instances', async () => {
    getAppsMock.mockReturnValue([]);
    const { getFirebaseAuth } = await import('./client');

    const first = getFirebaseAuth();
    const second = getFirebaseAuth();

    expect(initializeAppMock).toHaveBeenCalledTimes(1);
    expect(getAuthMock).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
  });
});
