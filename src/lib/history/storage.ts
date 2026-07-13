import { Timestamp } from 'firebase-admin/firestore';
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

export type HistoryEntry = HistoryEntryInput & {
  id: string;
  timestamp: Date;
};

const COLLECTION = 'history';
const LIST_LIMIT = 50;

export async function recordHistoryEntry(uid: string, entry: HistoryEntryInput): Promise<void> {
  await getAdminFirestore()
    .collection(COLLECTION)
    .doc(uid)
    .collection('requests')
    .add({ ...entry, timestamp: new Date() });
}

function toHistoryEntry(id: string, data: FirebaseFirestore.DocumentData): HistoryEntry {
  const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date();

  return {
    id,
    method: data.method,
    url: data.url,
    status: data.status ?? null,
    durationMs: data.durationMs,
    requestSize: data.requestSize,
    responseSize: data.responseSize,
    error: data.error ?? null,
    timestamp,
  };
}

/** Lists a user's request history, most recent first. */
export async function listHistoryEntries(uid: string): Promise<HistoryEntry[]> {
  const snapshot = await getAdminFirestore()
    .collection(COLLECTION)
    .doc(uid)
    .collection('requests')
    .orderBy('timestamp', 'desc')
    .limit(LIST_LIMIT)
    .get();

  return snapshot.docs.map((doc) => toHistoryEntry(doc.id, doc.data()));
}

/** Fetches a single history entry, scoped to its owning user. */
export async function getHistoryEntry(uid: string, id: string): Promise<HistoryEntry | null> {
  const doc = await getAdminFirestore()
    .collection(COLLECTION)
    .doc(uid)
    .collection('requests')
    .doc(id)
    .get();

  if (!doc.exists) return null;

  const data = doc.data();
  if (!data) return null;

  return toHistoryEntry(doc.id, data);
}
