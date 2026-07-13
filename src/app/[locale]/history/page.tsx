import { cookies } from 'next/headers';
import { HistoryView } from '@/components/history/history-view';
import { SESSION_COOKIE_NAME, verifySessionCookie } from '@/lib/auth/session';
import { listHistoryEntries } from '@/lib/history/storage';

export default async function HistoryPage() {
  const cookieStore = await cookies();
  const session = await verifySessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  const entries = session ? await listHistoryEntries(session.uid) : [];

  return (
    <HistoryView
      entries={entries.map((entry) => ({
        id: entry.id,
        method: entry.method,
        url: entry.url,
        status: entry.status,
        timestamp: entry.timestamp.toISOString(),
      }))}
    />
  );
}
