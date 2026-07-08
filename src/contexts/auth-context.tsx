'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseClientConfigured } from '@/lib/firebase/client';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseClientConfigured);

  useEffect(() => {
    if (!isFirebaseClientConfigured) {
      return;
    }

    return onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const signOut = useCallback(async () => {
    if (isFirebaseClientConfigured) {
      await firebaseSignOut(getFirebaseAuth());
    }
    await fetch('/api/auth/logout', { method: 'POST' });
  }, []);

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
