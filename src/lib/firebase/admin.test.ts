import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockApp = { name: 'admin-app' };
const mockAuth = { name: 'admin-auth' };
const mockFirestore = { name: 'admin-firestore' };

const getAppsMock = vi.fn();
const initializeAppMock = vi.fn<(config: unknown) => typeof mockApp>().mockReturnValue(mockApp);
const certMock = vi.fn((options: unknown) => options);
const getAuthMock = vi.fn<(app: unknown) => typeof mockAuth>().mockReturnValue(mockAuth);
const getFirestoreMock = vi
  .fn<(app: unknown) => typeof mockFirestore>()
  .mockReturnValue(mockFirestore);

vi.mock('firebase-admin/app', () => ({
  getApps: () => getAppsMock(),
  initializeApp: (config: unknown) => initializeAppMock(config),
  cert: (options: unknown) => certMock(options),
}));
vi.mock('firebase-admin/auth', () => ({
  getAuth: (app: unknown) => getAuthMock(app),
}));
vi.mock('firebase-admin/firestore', () => ({
  getFirestore: (app: unknown) => getFirestoreMock(app),
}));

describe('firebase admin', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    getAppsMock.mockReset().mockReturnValue([]);
    initializeAppMock.mockClear();
    certMock.mockClear();
    getAuthMock.mockClear();
    getFirestoreMock.mockClear();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('is not configured when admin env vars are missing', async () => {
    delete process.env.FIREBASE_ADMIN_PROJECT_ID;
    delete process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    delete process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    const { isFirebaseAdminConfigured, getAdminAuth } = await import('./admin');

    expect(isFirebaseAdminConfigured).toBe(false);
    expect(() => getAdminAuth()).toThrow(/Firebase Admin is not configured/);
  });

  it('initializes a new admin app from env vars when configured and none exists yet', async () => {
    process.env.FIREBASE_ADMIN_PROJECT_ID = 'proj';
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL = 'sa@example.com';
    process.env.FIREBASE_ADMIN_PRIVATE_KEY = 'line1\\nline2';

    const { isFirebaseAdminConfigured, getAdminAuth, getAdminFirestore } = await import('./admin');

    expect(isFirebaseAdminConfigured).toBe(true);

    const auth = getAdminAuth();
    const firestore = getAdminFirestore();

    expect(auth).toBe(mockAuth);
    expect(firestore).toBe(mockFirestore);
    expect(initializeAppMock).toHaveBeenCalledTimes(1);
    expect(certMock).toHaveBeenCalledWith({
      projectId: 'proj',
      clientEmail: 'sa@example.com',
      privateKey: 'line1\nline2',
    });
  });

  it('reuses an existing admin app instead of initializing a new one', async () => {
    process.env.FIREBASE_ADMIN_PROJECT_ID = 'proj';
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL = 'sa@example.com';
    process.env.FIREBASE_ADMIN_PRIVATE_KEY = 'key';
    getAppsMock.mockReturnValue([mockApp]);

    const { getAdminAuth } = await import('./admin');
    getAdminAuth();

    expect(initializeAppMock).not.toHaveBeenCalled();
    expect(getAuthMock).toHaveBeenCalledWith(mockApp);
  });
});
