import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  memoryLocalCache,
  doc,
  getDocFromServer,
  setLogLevel,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Silence internal @firebase/firestore verbose console logs
try {
  setLogLevel('silent');
} catch {
  // Ignore if unsupported
}

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(
  app,
  {
    localCache: memoryLocalCache(),
    experimentalAutoDetectLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const QUOTA_STORAGE_KEY = 'bw_firestore_quota_exhausted_date';
const QUOTA_COOLDOWN_MS = 60 * 1000;

let quotaCooldownUntil = 0;
let hasLoggedQuotaNotice = false;

// Clear any legacy persistent quota lock from localStorage
try {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(QUOTA_STORAGE_KEY);
  }
} catch {
  // Ignore storage errors
}

export function isFirestoreQuotaExhausted(): boolean {
  if (quotaCooldownUntil > Date.now()) {
    return true;
  }
  if (quotaCooldownUntil !== 0) {
    quotaCooldownUntil = 0;
  }
  return false;
}

export function markFirestoreQuotaExhausted(): void {
  quotaCooldownUntil = Date.now() + QUOTA_COOLDOWN_MS;
}

export async function resetFirestoreQuotaState(): Promise<void> {
  quotaCooldownUntil = 0;
  hasLoggedQuotaNotice = false;
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(QUOTA_STORAGE_KEY);
    }
  } catch {
    // Ignore errors
  }
}

export function isQuotaExhaustedError(error: unknown): boolean {
  if (!error) return false;
  const code = (error as { code?: string })?.code || '';
  const msg = error instanceof Error ? error.message : String(error);
  return (
    code === 'resource-exhausted' ||
    msg.includes('[code=resource-exhausted]') ||
    msg.includes('Quota limit exceeded') ||
    msg.includes('Quota exceeded for quota metric')
  );
}

export function isInternalAssertionError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes('INTERNAL ASSERTION FAILED') || msg.includes('Unexpected state');
}

// Intercept residual console.error and unhandled internal assertion errors from Firebase SDK
if (typeof window !== 'undefined') {
  const origConsoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    const combined = args
      .map((a) => (a instanceof Error ? a.message : String(a)))
      .join(' ');
    if (
      combined.includes('resource-exhausted') ||
      combined.includes('Quota limit exceeded') ||
      combined.includes('Quota exceeded') ||
      combined.includes('Using maximum backoff delay')
    ) {
      markFirestoreQuotaExhausted();
      return;
    }
    if (
      combined.includes('INTERNAL ASSERTION FAILED') ||
      combined.includes('Unexpected state')
    ) {
      return;
    }
    origConsoleError(...args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (isInternalAssertionError(event.reason) || isQuotaExhaustedError(event.reason)) {
      event.preventDefault();
    }
  });
}

// Validate connection to Firestore on boot using dedicated test document path
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (isQuotaExhaustedError(error) || isInternalAssertionError(error)) {
      if (isQuotaExhaustedError(error)) markFirestoreQuotaExhausted();
      return;
    }
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: boolean | string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  if (isInternalAssertionError(error)) {
    return;
  }
  if (isQuotaExhaustedError(error)) {
    markFirestoreQuotaExhausted();
    if (!hasLoggedQuotaNotice) {
      hasLoggedQuotaNotice = true;
      console.warn(
        'Batas kecepatan tulis Firestore tercapai sementara. Sinkronisasi akan dilanjutkan otomatis.'
      );
    }
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// =========================================================
// Defensive Payload Sanitization & Blueprint Synchronicity
// =========================================================

const ID_REGEX = /^[a-zA-Z0-9_\-]+$/;

export function sanitizeId(raw: string | number, prefix = 'id'): string {
  const cleaned = String(raw)
    .trim()
    .replace(/[^a-zA-Z0-9_\-]/g, '-')
    .slice(0, 128);
  if (!cleaned || !ID_REGEX.test(cleaned)) {
    return `${prefix}_${Date.now()}`;
  }
  return cleaned;
}

export function sanitizeString(val: unknown, maxLength: number, fallback = ''): string {
  if (typeof val !== 'string') return fallback.slice(0, maxLength);
  const trimmed = val.trim();
  if (!trimmed && fallback) return fallback.slice(0, maxLength);
  return trimmed.slice(0, maxLength);
}

export function clampNumber(val: unknown, min: number, max: number, fallback = min): number {
  const num = typeof val === 'number' ? val : Number(val);
  if (Number.isNaN(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}
