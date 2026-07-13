import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getSavedSchema, saveSchema } from './storage';

const docGetMock = vi.fn();
const docSetMock = vi.fn();
const docMock = vi.fn(() => ({ get: docGetMock, set: docSetMock }));
const collectionMock = vi.fn(() => ({ doc: docMock }));

vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: () => ({ collection: collectionMock }),
}));

describe('schema storage', () => {
  beforeEach(() => {
    docGetMock.mockReset();
    docSetMock.mockReset();
    docMock.mockClear();
    collectionMock.mockClear();
  });

  describe('getSavedSchema', () => {
    it('returns null when no document exists', async () => {
      docGetMock.mockResolvedValue({ exists: false });

      expect(await getSavedSchema('uid-1')).toBeNull();
      expect(collectionMock).toHaveBeenCalledWith('schemas');
      expect(docMock).toHaveBeenCalledWith('uid-1');
    });

    it('returns null when the stored data is malformed', async () => {
      docGetMock.mockResolvedValue({ exists: true, data: () => ({ format: 'json' }) });
      expect(await getSavedSchema('uid-1')).toBeNull();

      docGetMock.mockResolvedValue({
        exists: true,
        data: () => ({ content: 'ok', format: 'xml' }),
      });
      expect(await getSavedSchema('uid-1')).toBeNull();
    });

    it('returns the saved content and format when valid', async () => {
      docGetMock.mockResolvedValue({
        exists: true,
        data: () => ({ content: '{"a":1}', format: 'json' }),
      });

      expect(await getSavedSchema('uid-1')).toEqual({ content: '{"a":1}', format: 'json' });
    });
  });

  describe('saveSchema', () => {
    it('writes content, format and an updatedAt timestamp', async () => {
      docSetMock.mockResolvedValue(undefined);

      await saveSchema('uid-1', '{"a":1}', 'json');

      expect(docMock).toHaveBeenCalledWith('uid-1');
      expect(docSetMock).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '{"a":1}',
          format: 'json',
          updatedAt: expect.any(Date),
        }),
      );
    });
  });
});
