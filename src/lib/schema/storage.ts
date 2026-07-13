import { getAdminFirestore } from '@/lib/firebase/admin';
import type { SchemaFormat } from './format';

const COLLECTION = 'schemas';

export type SavedSchema = {
  content: string;
  format: SchemaFormat;
};

function isSchemaFormat(value: unknown): value is SchemaFormat {
  return value === 'json' || value === 'yaml';
}

export async function getSavedSchema(uid: string): Promise<SavedSchema | null> {
  const snapshot = await getAdminFirestore().collection(COLLECTION).doc(uid).get();
  if (!snapshot.exists) return null;

  const data = snapshot.data();
  if (!data || typeof data.content !== 'string' || !isSchemaFormat(data.format)) {
    return null;
  }

  return { content: data.content, format: data.format };
}

export async function saveSchema(
  uid: string,
  content: string,
  format: SchemaFormat,
): Promise<void> {
  await getAdminFirestore().collection(COLLECTION).doc(uid).set({
    content,
    format,
    updatedAt: new Date(),
  });
}
