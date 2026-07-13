import { Timestamp } from 'firebase-admin/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getHistoryEntry, listHistoryEntries, recordHistoryEntry } from './storage';

const addMock = vi.fn();
const listGetMock = vi.fn();
const limitMock = vi.fn(() => ({ get: listGetMock }));
const orderByMock = vi.fn(() => ({ limit: limitMock }));
const itemGetMock = vi.fn();
const requestsDocMock = vi.fn(() => ({ get: itemGetMock }));
const requestsCollectionMock = {
  add: addMock,
  orderBy: orderByMock,
  doc: requestsDocMock,
};
const userDocMock = vi.fn(() => ({ collection: vi.fn(() => requestsCollectionMock) }));
const collectionMock = vi.fn(() => ({ doc: userDocMock }));

vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: () => ({ collection: collectionMock }),
}));

const baseEntry = {
  method: 'GET',
  url: 'https://api.example.com/todos/1',
  status: 200,
  durationMs: 42,
  requestSize: 0,
  responseSize: 128,
  error: null,
};

describe('history storage', () => {
  beforeEach(() => {
    addMock.mockReset();
    listGetMock.mockReset();
    itemGetMock.mockReset();
    collectionMock.mockClear();
    userDocMock.mockClear();
    orderByMock.mockClear();
    limitMock.mockClear();
    requestsDocMock.mockClear();
  });

  it('recordHistoryEntry adds the entry with a timestamp under the user scoped collection', async () => {
    addMock.mockResolvedValue(undefined);

    await recordHistoryEntry('uid-1', baseEntry);

    expect(collectionMock).toHaveBeenCalledWith('history');
    expect(userDocMock).toHaveBeenCalledWith('uid-1');
    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({ ...baseEntry, timestamp: expect.any(Date) }),
    );
  });

  it('listHistoryEntries orders by timestamp desc, limits to 50, and converts Timestamps to Dates', async () => {
    const timestamp = Timestamp.fromDate(new Date('2026-01-01T00:00:00.000Z'));
    listGetMock.mockResolvedValue({
      docs: [{ id: 'entry-1', data: () => ({ ...baseEntry, timestamp }) }],
    });

    const entries = await listHistoryEntries('uid-1');

    expect(orderByMock).toHaveBeenCalledWith('timestamp', 'desc');
    expect(limitMock).toHaveBeenCalledWith(50);
    expect(entries).toEqual([{ id: 'entry-1', ...baseEntry, timestamp: timestamp.toDate() }]);
  });

  it('listHistoryEntries defaults status/error to null and timestamp to now when missing', async () => {
    listGetMock.mockResolvedValue({
      docs: [
        {
          id: 'entry-2',
          data: () => ({
            method: 'GET',
            url: 'https://api.example.com',
            durationMs: 1,
            requestSize: 0,
            responseSize: 0,
          }),
        },
      ],
    });

    const [entry] = await listHistoryEntries('uid-1');

    expect(entry.status).toBeNull();
    expect(entry.error).toBeNull();
    expect(entry.timestamp).toBeInstanceOf(Date);
  });

  it('getHistoryEntry returns null when the document does not exist', async () => {
    itemGetMock.mockResolvedValue({ exists: false });

    expect(await getHistoryEntry('uid-1', 'missing-id')).toBeNull();
    expect(requestsDocMock).toHaveBeenCalledWith('missing-id');
  });

  it('getHistoryEntry returns null when the document has no data', async () => {
    itemGetMock.mockResolvedValue({ exists: true, data: () => undefined });

    expect(await getHistoryEntry('uid-1', 'entry-1')).toBeNull();
  });

  it('getHistoryEntry returns the entry scoped to the owning user when found', async () => {
    itemGetMock.mockResolvedValue({ exists: true, id: 'entry-1', data: () => baseEntry });

    const entry = await getHistoryEntry('uid-1', 'entry-1');

    expect(entry).toMatchObject({ id: 'entry-1', ...baseEntry });
    expect(entry?.timestamp).toBeInstanceOf(Date);
  });
});
