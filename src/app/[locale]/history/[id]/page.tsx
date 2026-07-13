import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { HistoryDetail } from '@/components/history/history-detail';
import { SESSION_COOKIE_NAME, verifySessionCookie } from '@/lib/auth/session';
import { getHistoryEntry } from '@/lib/history/storage';

export default async function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const session = await verifySessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    notFound();
  }

  const entry = await getHistoryEntry(session.uid, id);
  if (!entry) {
    notFound();
  }

  return (
    <HistoryDetail
      entry={{
        id: entry.id,
        method: entry.method,
        url: entry.url,
        status: entry.status,
        durationMs: entry.durationMs,
        requestSize: entry.requestSize,
        responseSize: entry.responseSize,
        error: entry.error,
        timestamp: entry.timestamp.toISOString(),
      }}
    />
  );
}
