import { cookies } from 'next/headers';
import { HomeWorkspace } from '@/components/workspace/home-workspace';
import { SESSION_COOKIE_NAME, verifySessionCookie } from '@/lib/auth/session';
import { getSavedSchema } from '@/lib/schema/storage';

export default async function Home() {
  const cookieStore = await cookies();
  const session = await verifySessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  const saved = session ? await getSavedSchema(session.uid) : null;

  return <HomeWorkspace initialText={saved?.content ?? ''} />;
}
