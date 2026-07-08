import { NextResponse } from 'next/server';
import { isFirebaseAdminConfigured, getAdminAuth } from '@/lib/firebase/admin';
import { SESSION_COOKIE_MAX_AGE_SECONDS, SESSION_COOKIE_NAME } from '@/lib/auth/session';

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured) {
    return NextResponse.json({ error: 'Firebase Admin is not configured' }, { status: 500 });
  }

  const { idToken } = (await request.json()) as { idToken?: string };

  if (!idToken) {
    return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
  }

  try {
    const adminAuth = getAdminAuth();
    await adminAuth.verifyIdToken(idToken);

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_COOKIE_MAX_AGE_SECONDS * 1000,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
