import { getAdminFirestore } from '@/lib/firebase/admin';

export type HistoryEntryInput = {
  method: string;
  url: string;
  status: number | null;
  durationMs: number;
  requestSize: number;
  responseSize: number;
  error: string | null;
};

const COLLECTION = 'history';

/** Records a single Try-It-Out execution for an authenticated user (Feature 5 reads these). */
export async function recordHistoryEntry(uid: string, entry: HistoryEntryInput): Promise<void> {
  await getAdminFirestore()
    .collection(COLLECTION)
    .doc(uid)
    .collection('requests')
    .add({ ...entry, timestamp: new Date() });
}
