import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionCookie } from '@/lib/auth/session';
import { getSavedSchema, saveSchema } from '@/lib/schema/storage';

async function requireSession() {
  const cookieStore = await cookies();
  return verifySessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const schema = await getSavedSchema(session.uid);
  return NextResponse.json({ schema });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { content, format } = (await request.json()) as {
    content?: string;
    format?: string;
  };

  if (!content || (format !== 'json' && format !== 'yaml')) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  await saveSchema(session.uid, content, format);
  return NextResponse.json({ success: true });
}
