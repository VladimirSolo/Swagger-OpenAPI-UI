import { getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseClientConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

let firebaseApp: FirebaseApp | undefined;
let firebaseAuth: Auth | undefined;
let firestoreInstance: Firestore | undefined;

/**
 * Lazily initialized so the Firebase Auth SDK is never touched during SSR
 * (it throws synchronously on an unconfigured/invalid apiKey). Only call
 * this from browser-only code paths (effects, event handlers).
 */
function getFirebaseApp(): FirebaseApp {
  firebaseApp ??= getApps()[0] ?? initializeApp(firebaseConfig);
  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  firebaseAuth ??= getAuth(getFirebaseApp());
  return firebaseAuth;
}

export function getFirebaseFirestore(): Firestore {
  firestoreInstance ??= getFirestore(getFirebaseApp());
  return firestoreInstance;
}
