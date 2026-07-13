'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { OpenAPI } from 'openapi-types';
import { convertFormat } from '@/lib/schema/convert';
import { detectFormat, type SchemaFormat } from '@/lib/schema/format';
import { validateSchema } from '@/lib/schema/validate';

type SchemaContextValue = {
  rawText: string;
  format: SchemaFormat | null;
  document: OpenAPI.Document | null;
  error: string | null;
  isValidating: boolean;
  setRawText: (text: string) => void;
  toggleFormat: () => void;
};

const SchemaContext = createContext<SchemaContextValue | null>(null);

const VALIDATION_DEBOUNCE_MS = 400;

export function SchemaProvider({
  initialText = '',
  children,
}: {
  initialText?: string;
  children: ReactNode;
}) {
  const [rawText, setRawTextState] = useState(initialText);
  const [document, setDocument] = useState<OpenAPI.Document | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validatedText, setValidatedText] = useState<string | null>(null);

  const format = useMemo(() => detectFormat(rawText), [rawText]);

  const requestIdRef = useRef(0);

  useEffect(() => {
    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;

    if (!format) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      const result = await validateSchema(rawText, format);
      if (requestIdRef.current !== currentRequestId) return;

      if (result.valid) {
        setDocument(result.document);
        setValidationError(null);
      } else {
        setDocument(null);
        setValidationError(result.error);
      }
      setValidatedText(rawText);
    }, VALIDATION_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [rawText, format]);

  const setRawText = useCallback((text: string) => {
    setRawTextState(text);
  }, []);

  const toggleFormat = useCallback(() => {
    if (!format) return;
    const nextFormat: SchemaFormat = format === 'json' ? 'yaml' : 'json';
    const converted = convertFormat(rawText, format, nextFormat);
    setRawTextState(converted);
  }, [format, rawText]);

  const error = format
    ? validationError
    : rawText.trim()
      ? 'Unable to detect a valid JSON or YAML format'
      : null;
  const isValidating = format !== null && rawText !== validatedText;

  const value = useMemo<SchemaContextValue>(
    () => ({
      rawText,
      format,
      document: format ? document : null,
      error,
      isValidating,
      setRawText,
      toggleFormat,
    }),
    [rawText, format, document, error, isValidating, setRawText, toggleFormat],
  );

  return <SchemaContext.Provider value={value}>{children}</SchemaContext.Provider>;
}

export function useSchema() {
  const context = useContext(SchemaContext);
  if (!context) {
    throw new Error('useSchema must be used within a SchemaProvider');
  }
  return context;
}
