import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  db,
  auth,
  OperationType,
  handleFirestoreError,
  sanitizeId,
  sanitizeString,
  clampNumber,
  isFirestoreQuotaExhausted,
  markFirestoreQuotaExhausted,
  isQuotaExhaustedError,
  isInternalAssertionError,
} from '../firebase';
import {
  User,
  Subject,
  ClassRoom,
  Student,
  Grade,
  TahfidzGrade,
  ReportCardRecord,
  ExamFile,
  ExamQuestionsPackage,
  QuestionItem,
  SiteSettings,
  ThemeSettings,
  StudentAttendanceRecord,
  TeacherAttendanceRecord,
  TeachingAssignment,
} from '../types';
import { normalizeThemeSettings } from '../utils/theme';

// =========================================================
// Document ID Builders (Strictly matching ^[a-zA-Z0-9_\-]+$)
// =========================================================

function uidPrefix(uid: string): string {
  return uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || 'usr';
}

export const GLOBAL_SCHOOL_CONFIG_DOC_ID = 'global_config';

export const AUTHORIZED_SUPERADMIN_EMAILS = [
  'akhirzaman998@gmail.com',
  'nasam998@gmail.com',
  'mediabaiturrahman01@gmail.com',
] as const;

export const RESERVED_SUPERADMIN_USERNAMES = [
  'superadmin',
  'super_admin',
  'super-admin',
  'root',
  'owner',
  'master',
  'administrator',
] as const;

export function isAuthorizedSuperAdminEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  return (AUTHORIZED_SUPERADMIN_EMAILS as readonly string[]).includes(
    email.toLowerCase().trim()
  );
}

export function isReservedSuperAdminUsername(username?: string | null): boolean {
  if (!username || typeof username !== 'string') return false;
  const clean = username.toLowerCase().trim();
  return (
    (RESERVED_SUPERADMIN_USERNAMES as readonly string[]).includes(clean) ||
    clean.includes('superadmin')
  );
}

export function getSchoolConfigDocId(uid: string): string {
  return sanitizeId(`cfg_${uidPrefix(uid)}`);
}

export function normalizeUserId(rawId: string, username?: string): string {
  const cleanUsername = String(username || '')
    .toLowerCase()
    .trim();
  if (cleanUsername === 'superadmin') return 'usr-superadmin';
  if (cleanUsername === 'abuza') return 'usr-1';
  if (cleanUsername === 'ridwan') return 'usr-2';
  if (cleanUsername === 'hilal') return 'usr-3';

  // Strip any accidentally prepended usr_<uidPrefix>_ prefixes
  const stripped = String(rawId || '')
    .trim()
    .replace(/^(usr_[a-zA-Z0-9]+_)+/, '');

  // If stripped is still a truncated usr_<uidPrefix> stub or empty/too long, derive a clean ID from username
  if (!stripped || stripped.startsWith('usr_') || stripped.length > 48 || stripped === 'usr-superadmin') {
    const slug = cleanUsername.replace(/[^a-z0-9]/g, '').slice(0, 24);
    return slug ? `usr-${slug}` : `usr-${Date.now()}`;
  }

  return sanitizeId(stripped, 'usr');
}

export function isAuthorizedSuperAdminUser(user?: User | null): boolean {
  if (!user || typeof user !== 'object') return false;
  const cleanUsername = String(user.username || '')
    .toLowerCase()
    .trim();
  const cleanEmail = String(user.email || '')
    .toLowerCase()
    .trim();

  if (cleanUsername === 'superadmin' || user.role === 'superadmin') {
    return true;
  }

  if (cleanUsername === 'abuza' || isAuthorizedSuperAdminEmail(cleanEmail)) {
    return true;
  }

  return false;
}

const DEFAULT_AVATAR_URL = '/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg';

export function normalizeUserRecord(user: User): User {
  const cleanUsername = String(user.username || '')
    .toLowerCase()
    .trim();
  const cleanEmail = String(user.email || '').trim();
  const cleanId = normalizeUserId(user.id, cleanUsername);

  // Strictly enforce that ONLY the official 'superadmin' account can hold 'superadmin' role
  let safeRole: User['role'] = user.role || 'guru';
  if (cleanUsername === 'superadmin') {
    safeRole = 'superadmin';
  } else if (safeRole === 'superadmin') {
    safeRole = 'guru';
  } else if (safeRole !== 'wali_kelas' && safeRole !== 'guru' && safeRole !== 'admin') {
    safeRole = 'guru';
  }

  const lowerEmail = cleanEmail.toLowerCase();
  const isGoogleInferred =
    user.authProvider === 'google' ||
    Boolean(user.googleUid) ||
    (cleanUsername !== 'superadmin' &&
      (lowerEmail.endsWith('@gmail.com') ||
        lowerEmail.endsWith('@googlemail.com') ||
        String(user.avatarUrl || '').includes('googleusercontent.com')));

  return {
    ...user,
    id: cleanUsername === 'superadmin' ? 'usr-superadmin' : cleanId,
    username: cleanUsername || 'guru',
    fullName: String(user.fullName || user.username || 'Pendidik').trim(),
    email:
      cleanUsername === 'superadmin' && !isAuthorizedSuperAdminEmail(cleanEmail)
        ? 'akhirzaman998@gmail.com'
        : cleanEmail,
    avatarUrl: user.avatarUrl || DEFAULT_AVATAR_URL,
    role: safeRole,
    joinedDate: user.joinedDate || new Date().toLocaleDateString('id-ID'),
    authProvider: isGoogleInferred ? 'google' : user.authProvider || 'local',
    ...(user.googleUid ? { googleUid: String(user.googleUid) } : {}),
    ...(user.password ? { password: String(user.password) } : {}),
  };
}

export function buildGoogleUserRecord(
  fbUser: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
  },
  existingUsers: User[],
  defaultRole: User['role'] = 'guru'
): User {
  const email = (fbUser.email || `${fbUser.uid.slice(0, 8).toLowerCase()}@gmail.com`)
    .toLowerCase()
    .trim();

  // 1. Match existing non-superadmin account by exact email or googleUid
  const existingByEmail = existingUsers.find(
    (u) =>
      u.username !== 'superadmin' &&
      ((u.email && u.email.toLowerCase().trim() === email) ||
        (u.googleUid && u.googleUid === fbUser.uid))
  );

  if (existingByEmail) {
    return normalizeUserRecord({
      ...existingByEmail,
      fullName:
        fbUser.displayName &&
        (!existingByEmail.fullName || existingByEmail.fullName === 'Pendidik Baiturrahman')
          ? fbUser.displayName
          : existingByEmail.fullName || fbUser.displayName || 'Pendidik Google',
      email,
      avatarUrl:
        fbUser.photoURL ||
        (existingByEmail.avatarUrl && existingByEmail.avatarUrl !== DEFAULT_AVATAR_URL
          ? existingByEmail.avatarUrl
          : DEFAULT_AVATAR_URL),
      role:
        existingByEmail.role && existingByEmail.role !== 'superadmin'
          ? existingByEmail.role
          : defaultRole === 'superadmin'
          ? 'admin'
          : defaultRole,
      authProvider: 'google',
      googleUid: fbUser.uid,
    });
  }

  // 2. Derive a clean, unique username from email prefix
  const rawPrefix = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20);
  const uidSuffix = fbUser.uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toLowerCase() || 'g1';

  let candidateUsername =
    !rawPrefix || isReservedSuperAdminUsername(rawPrefix)
      ? `google_${uidSuffix}`
      : rawPrefix;

  const usernameTakenByOther = existingUsers.some(
    (u) =>
      u.username.toLowerCase().trim() === candidateUsername &&
      u.email?.toLowerCase().trim() !== email
  );
  if (usernameTakenByOther) {
    candidateUsername = `${candidateUsername}_${uidSuffix}`;
  }

  return normalizeUserRecord({
    id: `usr-${candidateUsername}`,
    username: candidateUsername,
    fullName: fbUser.displayName || email.split('@')[0] || 'Pendidik Google',
    email,
    avatarUrl: fbUser.photoURL || DEFAULT_AVATAR_URL,
    role: defaultRole === 'superadmin' ? 'admin' : defaultRole,
    joinedDate: new Date().toLocaleDateString('id-ID'),
    authProvider: 'google',
    googleUid: fbUser.uid,
  });
}

export function normalizeUsersList(
  users: User[],
  fallbackUsers: User[],
  deletedUsernames: string[] = []
): User[] {
  const deletedSet = new Set(
    (Array.isArray(deletedUsernames) ? deletedUsernames : [])
      .map((u) => String(u || '').toLowerCase().trim())
      .filter((u) => u && u !== 'superadmin')
  );

  const byUsername = new Map<string, User>();

  // 1. Seed baseline fallback accounts first (unless explicitly deleted by Superadmin)
  if (Array.isArray(fallbackUsers)) {
    fallbackUsers.forEach((fb) => {
      if (!fb || typeof fb.username !== 'string') return;
      const key = fb.username.toLowerCase().trim();
      const emailKey = String(fb.email || '').toLowerCase().trim();
      if (
        !key ||
        (key !== 'superadmin' && (deletedSet.has(key) || (emailKey && deletedSet.has(emailKey))))
      ) {
        return;
      }
      byUsername.set(key, normalizeUserRecord(fb));
    });
  }

  // 2. Overlay all active accounts from the provided users array (preserving passwords, emails, Google metadata, roles, and custom profiles)
  if (Array.isArray(users)) {
    users.forEach((u) => {
      if (!u || typeof u.username !== 'string') return;
      const key = u.username.toLowerCase().trim();
      const emailKey = String(u.email || '').toLowerCase().trim();
      if (
        !key ||
        (key !== 'superadmin' && (deletedSet.has(key) || (emailKey && deletedSet.has(emailKey))))
      ) {
        return;
      }
      const existing = byUsername.get(key);
      const preferredAvatar = u.avatarUrl || existing?.avatarUrl || DEFAULT_AVATAR_URL;
      const preferredAuthProvider =
        u.authProvider === 'google' || existing?.authProvider === 'google'
          ? 'google'
          : u.authProvider || existing?.authProvider || 'local';

      const normalized = normalizeUserRecord({
        ...(existing || {}),
        ...u,
        password: u.password ?? existing?.password,
        email: u.email || existing?.email || '',
        avatarUrl: preferredAvatar,
        authProvider: preferredAuthProvider,
        googleUid: u.googleUid || existing?.googleUid,
      });
      byUsername.set(key, normalized);
    });
  }

  // 3. Ensure superadmin is always first, followed by Google accounts & registered accounts
  const allUsers = Array.from(byUsername.values());
  allUsers.sort((a, b) => {
    if (a.username === 'superadmin') return -1;
    if (b.username === 'superadmin') return 1;
    return 0;
  });

  return allUsers;
}

export function mergeUserLists(
  listsOrFirst: Array<User[] | undefined | null> | User[] | undefined | null,
  secondOrDeleted?: User[] | string[] | undefined | null,
  deletedUsernames: string[] = []
): User[] {
  const isSecondStringArray =
    Array.isArray(secondOrDeleted) &&
    secondOrDeleted.every((item) => typeof item === 'string');

  const effectiveDeleted = isSecondStringArray
    ? (secondOrDeleted as string[])
    : deletedUsernames;

  const fallbackUsers =
    !isSecondStringArray && Array.isArray(secondOrDeleted)
      ? (secondOrDeleted as User[])
      : [];

  if (
    Array.isArray(listsOrFirst) &&
    listsOrFirst.some((item) => Array.isArray(item) || item === undefined || item === null)
  ) {
    const rawLists = (listsOrFirst as Array<User[] | undefined | null>).filter(
      (list): list is User[] => Array.isArray(list)
    );
    // Keep baseline lists (e.g. INITIAL_USERS of length 4 where id='usr-1' has no password) first so they never overwrite customized accounts
    const baselineLists: User[][] = [];
    const activeLists: User[][] = [];
    rawLists.forEach((list) => {
      const isBaselineSeed =
        list.length === 4 &&
        list.some((u) => u.username === 'abuza' && !u.password && u.id === 'usr-1');
      if (isBaselineSeed) {
        baselineLists.push(list);
      } else {
        activeLists.push(list);
      }
    });
    const combined: User[] = [];
    baselineLists.forEach((l) => combined.push(...l));
    activeLists.forEach((l) => combined.push(...l));
    return normalizeUsersList(combined, fallbackUsers, effectiveDeleted);
  }
  const firstList = Array.isArray(listsOrFirst) ? (listsOrFirst as User[]) : [];
  return normalizeUsersList(firstList, fallbackUsers, effectiveDeleted);
}

export function isCorruptedUserDocId(_uid: string, docId: string, user?: User): boolean {
  if (/^usr_[a-zA-Z0-9]+_/.test(docId)) return true;
  if (user) {
    const canonical = getUserProfileDocId('', user.id, user.username);
    if (docId !== canonical) return true;
  }
  return false;
}

export function getUserProfileDocId(_uid: string, userId: string, username?: string): string {
  const cleanUserId = normalizeUserId(userId, username);
  return sanitizeId(cleanUserId, 'usr');
}

export function getClassDocId(uid: string, classId: number): string {
  return sanitizeId(`cls_${uidPrefix(uid)}_${classId}`);
}

export function getSubjectDocId(uid: string, subjectId: number): string {
  return sanitizeId(`sub_${uidPrefix(uid)}_${subjectId}`);
}

export function getStudentDocId(uid: string, studentId: number): string {
  return sanitizeId(`std_${uidPrefix(uid)}_${studentId}`);
}

export function getGradeDocId(uid: string, gradeId: number): string {
  return sanitizeId(`grd_${uidPrefix(uid)}_${gradeId}`);
}

export function getTahfidzDocId(uid: string, tahfidzId: number): string {
  return sanitizeId(`thf_${uidPrefix(uid)}_${tahfidzId}`);
}

export function getReportCardDocId(uid: string, reportId: string): string {
  const cleanReportId = String(reportId || '')
    .trim()
    .replace(/^(rep_[a-zA-Z0-9]+_)+/, '');
  return sanitizeId(`rep_${uidPrefix(uid)}_${cleanReportId}`);
}

export function getExamFileDocId(uid: string, fileId: number): string {
  return sanitizeId(`exf_${uidPrefix(uid)}_${fileId}`);
}

export function getExamPackageDocId(uid: string, packageId: number): string {
  return sanitizeId(`pkg_${uidPrefix(uid)}_${packageId}`);
}

export function getExamQuestionDocId(questionId: number): string {
  return sanitizeId(`q_${questionId}`);
}

// =========================================================
// Generic Upsert & Delete Helpers with Known-Doc Tracking
// =========================================================

const inFlightUpserts = new Map<string, Promise<void>>();
const knownExistingDocs = new Set<string>();

export function markDocKnownInFirestore(collectionPath: string, docId: string): void {
  knownExistingDocs.add(`${collectionPath}/${docId}`);
}

export function unmarkDocKnownInFirestore(collectionPath: string, docId: string): void {
  knownExistingDocs.delete(`${collectionPath}/${docId}`);
}

export function isDocKnownInFirestore(collectionPath: string, docId: string): boolean {
  return knownExistingDocs.has(`${collectionPath}/${docId}`);
}

export function getKnownDocIdsInCollection(collectionPath: string): Set<string> {
  const prefix = `${collectionPath}/`;
  const result = new Set<string>();
  knownExistingDocs.forEach((fullPath) => {
    if (fullPath.startsWith(prefix)) {
      const rest = fullPath.slice(prefix.length);
      if (rest && !rest.includes('/')) {
        result.add(rest);
      }
    }
  });
  return result;
}

async function withWriteTimeout<T>(operation: Promise<T>, timeoutMs = 15000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error('firestore-write-timeout'));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function runInChunks<T>(
  items: T[],
  chunkSize: number,
  worker: (item: T) => Promise<void>
): Promise<void> {
  for (let i = 0; i < items.length; i += chunkSize) {
    if (isFirestoreQuotaExhausted()) return;
    const slice = items.slice(i, i + chunkSize);
    await Promise.all(slice.map((item) => worker(item)));
  }
}

export async function upsertFirestoreDoc(
  collectionPath: string,
  docId: string,
  createData: Record<string, unknown>,
  updateData: Record<string, unknown>
): Promise<void> {
  if (isFirestoreQuotaExhausted()) return;

  const fullPath = `${collectionPath}/${docId}`;
  const previous = inFlightUpserts.get(fullPath) || Promise.resolve();

  const nextTask = previous
    .catch(() => {})
    .then(async () => {
      if (isFirestoreQuotaExhausted()) return;
      const docRef = doc(db, collectionPath, docId);
      try {
        if (knownExistingDocs.has(fullPath)) {
          try {
            await withWriteTimeout(
              updateDoc(docRef, {
                ...updateData,
                updatedAt: serverTimestamp(),
              })
            );
            return;
          } catch (fastUpdateErr) {
            if (isQuotaExhaustedError(fastUpdateErr)) {
              markFirestoreQuotaExhausted();
              return;
            }
            if (isInternalAssertionError(fastUpdateErr)) {
              return;
            }
            knownExistingDocs.delete(fullPath);
          }
        }

        // Direct write without getDoc() to avoid creating conflicting temporary watch targets
        try {
          await withWriteTimeout(
            setDoc(docRef, {
              ...createData,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            })
          );
          knownExistingDocs.add(fullPath);
        } catch (setErr) {
          if (isQuotaExhaustedError(setErr)) {
            markFirestoreQuotaExhausted();
            return;
          }
          if (isInternalAssertionError(setErr)) {
            return;
          }
          // Document already exists in Firestore; perform updateDoc
          try {
            await withWriteTimeout(
              updateDoc(docRef, {
                ...updateData,
                updatedAt: serverTimestamp(),
              })
            );
            knownExistingDocs.add(fullPath);
          } catch (updateErr) {
            if (isQuotaExhaustedError(updateErr)) {
              markFirestoreQuotaExhausted();
              return;
            }
            if (isInternalAssertionError(updateErr)) {
              return;
            }
            // Self-heal if existing document had an older schema missing required fields
            await withWriteTimeout(deleteDoc(docRef));
            await withWriteTimeout(
              setDoc(docRef, {
                ...createData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              })
            );
            knownExistingDocs.add(fullPath);
          }
        }
      } catch (error) {
        if (
          (error as Error)?.message === 'firestore-write-timeout' ||
          isInternalAssertionError(error)
        ) {
          return;
        }
        handleFirestoreError(error, OperationType.WRITE, fullPath);
      }
    });

  inFlightUpserts.set(fullPath, nextTask);
  try {
    await nextTask;
  } finally {
    if (inFlightUpserts.get(fullPath) === nextTask) {
      inFlightUpserts.delete(fullPath);
    }
  }
}

export async function deleteFirestoreDoc(collectionPath: string, docId: string): Promise<void> {
  if (isFirestoreQuotaExhausted()) return;
  const fullPath = `${collectionPath}/${docId}`;
  knownExistingDocs.delete(fullPath);
  const docRef = doc(db, collectionPath, docId);
  try {
    await withWriteTimeout(deleteDoc(docRef));
  } catch (error) {
    if ((error as Error)?.message === 'firestore-write-timeout') return;
    handleFirestoreError(error, OperationType.DELETE, fullPath);
  }
}

// =========================================================
// Entity Serializers & Upsert Functions
// =========================================================

export interface GlobalWorkspaceSnapshot {
  classes?: ClassRoom[];
  subjects?: Subject[];
  students?: Student[];
  grades?: Grade[];
  tahfidzGrades?: TahfidzGrade[];
  reportCards?: ReportCardRecord[];
  examFiles?: ExamFile[];
  examPackages?: ExamQuestionsPackage[];
  studentAttendance?: StudentAttendanceRecord[];
  teacherAttendance?: TeacherAttendanceRecord[];
  teachingAssignments?: TeachingAssignment[];
}

let cachedGlobalUsers: User[] | null = null;
let cachedDeletedUsernames: string[] = [];
let cachedGlobalWorkspace: GlobalWorkspaceSnapshot | null = null;

export function setGlobalDatabaseCache(patch: {
  users?: User[];
  deletedUsernames?: string[];
  workspace?: GlobalWorkspaceSnapshot;
}): void {
  if (Array.isArray(patch.users)) {
    cachedGlobalUsers = patch.users.map((u) => normalizeUserRecord(u));
  }
  if (Array.isArray(patch.deletedUsernames)) {
    cachedDeletedUsernames = Array.from(
      new Set(
        patch.deletedUsernames
          .map((u) => String(u || '').toLowerCase().trim())
          .filter((u) => u && u !== 'superadmin')
      )
    );
  }
  if (patch.workspace && typeof patch.workspace === 'object') {
    cachedGlobalWorkspace = {
      ...(cachedGlobalWorkspace || {}),
      ...patch.workspace,
    };
  }
}

function getEffectiveUsersForGlobalSync(): User[] {
  if (Array.isArray(cachedGlobalUsers) && cachedGlobalUsers.length > 0) {
    return cachedGlobalUsers;
  }
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bw_users_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((u: User) => normalizeUserRecord(u));
        }
      }
    }
  } catch {
    // Ignore storage read error
  }
  return [];
}

function getEffectiveDeletedUsernames(): string[] {
  if (cachedDeletedUsernames.length > 0) return cachedDeletedUsernames;
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bw_deleted_usernames');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .map((u) => String(u || '').toLowerCase().trim())
            .filter((u) => u && u !== 'superadmin');
        }
      }
    }
  } catch {
    // Ignore storage read error
  }
  return [];
}

export async function syncSchoolConfigToFirestore(
  uid: string,
  siteSettings: SiteSettings,
  themeSettings: ThemeSettings,
  academicYear: string,
  updatedAtMs?: number,
  extraPatch?: {
    users?: User[];
    deletedUsernames?: string[];
    workspace?: GlobalWorkspaceSnapshot;
  }
): Promise<void> {
  if (isFirestoreQuotaExhausted()) return;

  if (extraPatch) {
    setGlobalDatabaseCache(extraPatch);
  }

  const safeOwnerId = sanitizeId(uid || auth.currentUser?.uid || 'superadmin_global', 'usr');
  const normTheme = normalizeThemeSettings(themeSettings);

  const safeColorTheme = sanitizeString(normTheme.colorTheme || 'emerald', 30, 'emerald');
  const safeContentWidth = sanitizeString(normTheme.contentWidth || 'contained', 30, 'contained');
  const safeDensity = sanitizeString(normTheme.density || 'comfortable', 30, 'comfortable');
  const safeBorderRadius = sanitizeString(normTheme.borderRadius || 'modern', 30, 'modern');
  const safeHeaderStyle = sanitizeString(normTheme.headerStyle || 'light', 30, 'light');
  const safeSidebarStyle = sanitizeString(normTheme.sidebarStyle || 'light', 30, 'light');

  const rightLogo = normTheme.customRightLogoUrl || siteSettings.customRightLogoUrl || '';

  const themeForExtended: ThemeSettings = {
    ...normTheme,
    colorTheme: (normTheme.colorTheme || 'emerald') as ThemeSettings['colorTheme'],
    customPrimaryHex: normTheme.customPrimaryHex || '#047857',
    customSecondaryHex: normTheme.customSecondaryHex || '#0f172a',
    customPageBgHex: normTheme.customPageBgHex || '',
    pageBgStyle: normTheme.pageBgStyle || 'clean',
    surfaceMode: normTheme.surfaceMode || 'light',
    surfaceThemeMode: normTheme.surfaceThemeMode || 'light',
    fontScale: normTheme.fontScale || 'normal',
    headingWeight: normTheme.headingWeight || 'bold',
    cardHoverEffect: normTheme.cardHoverEffect || 'lift',
    shadowIntensity: normTheme.shadowIntensity || 'subtle',
    borderContrast: normTheme.borderContrast || 'normal',
    borderWidth: normTheme.borderWidth || 'normal',
    cardAccentBar: normTheme.cardAccentBar || 'none',
    buttonStyle: normTheme.buttonStyle || 'solid',
    badgeStyle: normTheme.badgeStyle || 'soft',
    heroBannerStyle: normTheme.heroBannerStyle || 'gradient_brand',
    heroBannerHeight: normTheme.heroBannerHeight || 'standard',
    statsCardStyle: normTheme.statsCardStyle || 'modern_elevated',
    modalBackdropStyle: normTheme.modalBackdropStyle || 'blur_dark',
    scrollbarStyle: normTheme.scrollbarStyle || 'default',
    sectionSpacing: normTheme.sectionSpacing || 'normal',
    headingFontFamily: normTheme.headingFontFamily || 'inherit',
    announcementSpeed: normTheme.announcementSpeed || 'normal',
    showHeroBanner: normTheme.showHeroBanner !== false,
    showHeroStats: normTheme.showHeroStats !== false,
    showStatTrends: normTheme.showStatTrends !== false,
    showFooter: normTheme.showFooter !== false,
    stickyHeader: normTheme.stickyHeader !== false,
    showBreadcrumbIndicator: normTheme.showBreadcrumbIndicator !== false,
    tableRowHoverHighlight: normTheme.tableRowHoverHighlight !== false,
    enableGlassmorphism: normTheme.enableGlassmorphism !== false,
    enableAnimatedGradients: Boolean(normTheme.enableAnimatedGradients),
    highContrastText: Boolean(normTheme.highContrastText),
    compactMobileNav: Boolean(normTheme.compactMobileNav),
    customCssSnippet: normTheme.customCssSnippet || '',
    // Avoid duplicating customLogoUrl inside extendedConfigJson since it is stored at top-level customLogoUrl
    customLogoUrl: '',
    customRightLogoUrl: rightLogo,
    reportShowLeftLogo: normTheme.reportShowLeftLogo !== false,
    reportShowRightLogo: normTheme.reportShowRightLogo !== false,
    reportLogoSize: normTheme.reportLogoSize || 'md',
    reportLogoShape: normTheme.reportLogoShape || 'rounded',
    reportKopDividerStyle: normTheme.reportKopDividerStyle || 'double',
    reportCustomTitle: normTheme.reportCustomTitle || siteSettings.reportCustomTitle || '',
    reportThemeColor: (normTheme.reportThemeColor || safeColorTheme) as ThemeSettings['reportThemeColor'],
    reportCustomHex: normTheme.reportCustomHex || '#047857',
    reportBorderStyle: normTheme.reportBorderStyle || 'double',
    reportHeaderStyle: normTheme.reportHeaderStyle || 'dual_logo',
    reportFontStyle: normTheme.reportFontStyle || 'sans',
    reportFontSize: normTheme.reportFontSize || 'md',
    reportTableStyle: normTheme.reportTableStyle || 'tinted',
    reportRowDensity: normTheme.reportRowDensity || 'compact',
    reportPaperSize: normTheme.reportPaperSize || 'A4',
    reportOrientation: normTheme.reportOrientation || 'portrait',
    reportMarginSize: normTheme.reportMarginSize || 'narrow',
    reportPdfQuality: normTheme.reportPdfQuality || 'high',
    reportSinglePageFit: normTheme.reportSinglePageFit !== false,
    reportWatermarkOpacity: normTheme.reportWatermarkOpacity || 'subtle',
    reportShowWatermark: normTheme.reportShowWatermark !== false,
    reportShowBismillah: normTheme.reportShowBismillah !== false,
    reportShowRank: normTheme.reportShowRank !== false,
    reportShowTahfidz: normTheme.reportShowTahfidz !== false,
    reportShowAttitude: normTheme.reportShowAttitude !== false,
    reportShowEkskul: normTheme.reportShowEkskul !== false,
    reportShowAttendance: normTheme.reportShowAttendance !== false,
    reportShowKkm: normTheme.reportShowKkm !== false,
    reportShowPredicate: normTheme.reportShowPredicate !== false,
    reportShowTerbilang: normTheme.reportShowTerbilang !== false,
    reportShowTeacherNotes: normTheme.reportShowTeacherNotes !== false,
    reportShowParentSignature: normTheme.reportShowParentSignature !== false,
    reportShowClassTeacherSignature: normTheme.reportShowClassTeacherSignature !== false,
    reportShowHeadmasterSignature: normTheme.reportShowHeadmasterSignature !== false,
    reportShowSeal: normTheme.reportShowSeal !== false,
    reportSignatureHeight: normTheme.reportSignatureHeight || 'normal',
    reportShowFooterMeta: normTheme.reportShowFooterMeta !== false,
  };

  const fullUsers = getEffectiveUsersForGlobalSync();
  const compactUsers = fullUsers.map((u) => ({
    ...normalizeUserRecord(u),
    avatarUrl:
      u.avatarUrl && u.avatarUrl.length <= 20000
        ? u.avatarUrl
        : '/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg',
  }));
  const deletedUsernames = getEffectiveDeletedUsernames();

  const extendedPayload = {
    updatedAtMs: updatedAtMs || Date.now(),
    site: {
      foundationName: siteSettings.foundationName || '',
      schoolAddress: siteSettings.schoolAddress || '',
      schoolPhone: siteSettings.schoolPhone || '',
      schoolEmail: siteSettings.schoolEmail || '',
      schoolNsmNpsn: siteSettings.schoolNsmNpsn || '',
      schoolWebsite: siteSettings.schoolWebsite || '',
      headmasterName: siteSettings.headmasterName || '',
      headmasterNip: siteSettings.headmasterNip || '',
      defaultIssuePlace: siteSettings.defaultIssuePlace || 'Bandung',
      watermarkText: siteSettings.watermarkText || 'DOKUMEN RESMI',
      kkmDefault: siteSettings.kkmDefault ?? 70,
      defaultSemester: siteSettings.defaultSemester === 2 ? 2 : 1,
      gradeThresholds: siteSettings.gradeThresholds || {
        minA: 86,
        minB: 81,
        minC: 71,
        minD: 60,
        labelA: 'Mumtaz (Istimewa)',
        labelB: 'Jayyid Jiddan (Sangat Baik)',
        labelC: 'Jayyid (Baik)',
        labelD: 'Maqbul (Cukup)',
        labelE: 'Rasib (Kurang)',
      },
      footerText: siteSettings.footerText || '',
      reportCustomTitle: siteSettings.reportCustomTitle || normTheme.reportCustomTitle || '',
      announcements: Array.isArray(siteSettings.announcements) ? siteSettings.announcements : [],
    },
    theme: themeForExtended,
    users: fullUsers,
    deletedUsernames,
    ...(cachedGlobalWorkspace ? { workspace: cachedGlobalWorkspace } : {}),
  };

  const serializeExtendedSafely = (): string => {
    const MAX_EXTENDED_LEN = 750000;
    const rawJson = JSON.stringify(extendedPayload);
    if (rawJson.length <= MAX_EXTENDED_LEN) return rawJson;

    // Step 1: Compact oversized base64 user avatars & savedCustomFrames
    const step1 = {
      ...extendedPayload,
      users: compactUsers,
      theme: {
        ...extendedPayload.theme,
        savedCustomFrames: [],
      },
    };
    const json1 = JSON.stringify(step1);
    if (json1.length <= MAX_EXTENDED_LEN) return json1;

    // Step 2: Trim customFrameConfig.customImageUrl if still oversized
    const step2 = {
      ...step1,
      theme: {
        ...step1.theme,
        customFrameConfig: step1.theme.customFrameConfig
          ? { ...step1.theme.customFrameConfig, customImageUrl: '' }
          : undefined,
      },
    };
    const json2 = JSON.stringify(step2);
    if (json2.length <= MAX_EXTENDED_LEN) return json2;

    // Step 3: Trim customRightLogoUrl & heavy examPackages while ALWAYS preserving grades, tahfidzGrades, reportCards, students, classes, subjects, and users
    const essentialWorkspace: GlobalWorkspaceSnapshot | undefined = cachedGlobalWorkspace
      ? {
          classes: cachedGlobalWorkspace.classes,
          subjects: cachedGlobalWorkspace.subjects,
          students: cachedGlobalWorkspace.students,
          grades: cachedGlobalWorkspace.grades,
          tahfidzGrades: cachedGlobalWorkspace.tahfidzGrades,
          reportCards: cachedGlobalWorkspace.reportCards,
          studentAttendance: cachedGlobalWorkspace.studentAttendance,
          teacherAttendance: cachedGlobalWorkspace.teacherAttendance,
          teachingAssignments: cachedGlobalWorkspace.teachingAssignments,
        }
      : undefined;

    const step3 = {
      updatedAtMs: step2.updatedAtMs,
      site: step2.site,
      theme: {
        ...step2.theme,
        customRightLogoUrl: '',
      },
      users: compactUsers,
      deletedUsernames,
      ...(essentialWorkspace ? { workspace: essentialWorkspace } : {}),
    };
    const json3 = JSON.stringify(step3);
    return json3.length <= MAX_EXTENDED_LEN ? json3 : '{}';
  };

  const mutableFields = {
    academicYear: sanitizeString(academicYear, 20, '2025/2026'),
    appName: sanitizeString(siteSettings.appName, 120, 'Sistem Rapor Digital'),
    schoolName: sanitizeString(siteSettings.schoolName, 150, 'Pesantren & Madrasah Baiturrahman'),
    subHeader: sanitizeString(siteSettings.subHeader, 200, ''),
    announcement: sanitizeString(siteSettings.announcement, 500, ''),
    enableTahfidz: Boolean(siteSettings.enableTahfidz),
    enableBankSoal: Boolean(siteSettings.enableBankSoal),
    colorTheme: safeColorTheme,
    layout: normTheme.layout === 'topbar' ? 'topbar' : 'sidebar',
    contentWidth: safeContentWidth,
    density: safeDensity,
    borderRadius: safeBorderRadius,
    showAnnouncement: Boolean(normTheme.showAnnouncement),
    accentSaturation: normTheme.accentSaturation === 'minimal' ? 'minimal' : 'vibrant',
    headerStyle: safeHeaderStyle,
    sidebarStyle: safeSidebarStyle,
    logoIconType: sanitizeString(normTheme.logoIconType || 'image', 30, 'image'),
    customLogoUrl: sanitizeString(
      normTheme.customLogoUrl || siteSettings.customLogoUrl || '',
      250000,
      ''
    ),
    extendedConfigJson: serializeExtendedSafely(),
  };

  const globalDocRef = doc(db, 'school_configs', GLOBAL_SCHOOL_CONFIG_DOC_ID);
  const writeGlobalTask = withWriteTimeout(
    setDoc(globalDocRef, {
      docId: GLOBAL_SCHOOL_CONFIG_DOC_ID,
      ownerId: safeOwnerId,
      ...mutableFields,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  )
    .then(() => {
      markDocKnownInFirestore('school_configs', GLOBAL_SCHOOL_CONFIG_DOC_ID);
    })
    .catch((err) => {
      if (isQuotaExhaustedError(err)) {
        markFirestoreQuotaExhausted();
      }
    });

  const tasks: Promise<void>[] = [writeGlobalTask];

  if (auth.currentUser?.uid) {
    const docId = getSchoolConfigDocId(auth.currentUser.uid);
    tasks.push(
      upsertFirestoreDoc(
        'school_configs',
        docId,
        {
          docId,
          ownerId: auth.currentUser.uid,
          ...mutableFields,
        },
        mutableFields
      ).catch(() => {})
    );
  }

  await Promise.all(tasks);
}

export function parseExtendedSchoolConfig(
  data?: string | Record<string, any> | null
): {
  siteExtra: Partial<SiteSettings>;
  themeExtra: Partial<ThemeSettings>;
  updatedAtMs: number;
  users?: User[];
  deletedUsernames?: string[];
  workspace?: GlobalWorkspaceSnapshot;
  remoteUsers?: User[];
  remoteDeletedUsernames?: string[];
  remoteWorkspace?: GlobalWorkspaceSnapshot;
} {
  const rawJsonStr =
    typeof data === 'string'
      ? data
      : data && typeof data === 'object' && typeof data.extendedConfigJson === 'string'
      ? data.extendedConfigJson
      : '';
  if (!rawJsonStr) {
    return { siteExtra: {}, themeExtra: {}, updatedAtMs: 0 };
  }
  try {
    const parsed = JSON.parse(rawJsonStr);
    const rawTheme: Partial<ThemeSettings> =
      parsed?.theme && typeof parsed.theme === 'object' ? { ...parsed.theme } : {};
    const rawSite: Partial<SiteSettings> =
      parsed?.site && typeof parsed.site === 'object' ? { ...parsed.site } : {};
    if (rawTheme.customRightLogoUrl && !rawSite.customRightLogoUrl) {
      rawSite.customRightLogoUrl = rawTheme.customRightLogoUrl;
    }
    const updatedAtMs = typeof parsed?.updatedAtMs === 'number' ? parsed.updatedAtMs : 0;
    const remoteUsers: User[] | undefined = Array.isArray(parsed?.users)
      ? parsed.users.map((u: User) => normalizeUserRecord(u))
      : undefined;
    const remoteDeletedUsernames: string[] | undefined = Array.isArray(parsed?.deletedUsernames)
      ? parsed.deletedUsernames
          .map((u: unknown) => String(u || '').toLowerCase().trim())
          .filter((u: string) => u && u !== 'superadmin')
      : undefined;
    const remoteWorkspace: GlobalWorkspaceSnapshot | undefined =
      parsed?.workspace && typeof parsed.workspace === 'object' ? parsed.workspace : undefined;

    setGlobalDatabaseCache({
      users: remoteUsers,
      deletedUsernames: remoteDeletedUsernames,
      workspace: remoteWorkspace,
    });

    return {
      siteExtra: rawSite,
      themeExtra: rawTheme,
      updatedAtMs,
      users: remoteUsers,
      deletedUsernames: remoteDeletedUsernames,
      workspace: remoteWorkspace,
      remoteUsers,
      remoteDeletedUsernames,
      remoteWorkspace,
    };
  } catch {
    return { siteExtra: {}, themeExtra: {}, updatedAtMs: 0 };
  }
}

export async function syncUserProfileToFirestore(uid: string, user: User): Promise<void> {
  const normalized = normalizeUserRecord(user);
  const safeUid = sanitizeId(uid || auth.currentUser?.uid || 'global_registry', 'usr');
  const docId = getUserProfileDocId(safeUid, normalized.id, normalized.username);
  const safeRole: User['role'] =
    normalized.username === 'superadmin'
      ? 'superadmin'
      : normalized.role === 'wali_kelas' || normalized.role === 'admin'
      ? normalized.role
      : 'guru';

  const createPayload = {
    docId,
    ownerId: safeUid,
    username: sanitizeString(normalized.username, 60, 'guru'),
    fullName: sanitizeString(normalized.fullName, 120, 'Pendidik'),
    email: sanitizeString(normalized.email || '', 120, ''),
    avatarUrl: sanitizeString(
      normalized.avatarUrl,
      250000,
      '/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg'
    ),
    StaffRole: safeRole,
    joinedDate: sanitizeString(normalized.joinedDate, 40, new Date().toLocaleDateString('id-ID')),
  };

  const updatePayload: Record<string, unknown> = {
    fullName: createPayload.fullName,
    avatarUrl: createPayload.avatarUrl,
    email: createPayload.email,
    StaffRole: safeRole,
  };

  await upsertFirestoreDoc('users', docId, createPayload, updatePayload);
}

export async function syncClassToFirestore(uid: string, cls: ClassRoom): Promise<void> {
  const docId = getClassDocId(uid, cls.id);
  const mutableFields = {
    name: sanitizeString(cls.name, 100, 'Kelas'),
    teacher: sanitizeString(cls.teacher, 120, ''),
  };
  await upsertFirestoreDoc(
    'classes',
    docId,
    {
      id: clampNumber(cls.id, 1, 1000000000, 1),
      docId,
      ownerId: uid,
      ...mutableFields,
    },
    mutableFields
  );
}

export async function syncSubjectToFirestore(uid: string, sub: Subject): Promise<void> {
  const docId = getSubjectDocId(uid, sub.id);
  const validCategories: Subject['category'][] = ['Diniyah', 'Umum', 'Bahasa', 'Keterampilan'];
  const category = validCategories.includes(sub.category) ? sub.category : 'Diniyah';
  const mutableFields = {
    name: sanitizeString(sub.name, 100, 'Mata Pelajaran'),
    category,
  };
  await upsertFirestoreDoc(
    'subjects',
    docId,
    {
      id: clampNumber(sub.id, 1, 1000000000, 1),
      docId,
      ownerId: uid,
      ...mutableFields,
    },
    mutableFields
  );
}

export async function syncStudentToFirestore(uid: string, st: Student): Promise<void> {
  const docId = getStudentDocId(uid, st.id);
  const classId = clampNumber(st.classId, 1, 1000000000, 1);
  const classDocId = getClassDocId(uid, classId);
  const mutableFields = {
    nis: sanitizeString(st.nis, 40, '00000'),
    name: sanitizeString(st.name, 120, 'Santri'),
    classId,
    classDocId,
    birthPlace: sanitizeString(st.birthPlace, 80, 'Bandung'),
    birthDate: sanitizeString(st.birthDate, 30, '2012-01-01'),
    guardian: sanitizeString(st.guardian, 120, '-'),
  };
  await upsertFirestoreDoc(
    'students',
    docId,
    {
      id: clampNumber(st.id, 1, 1000000000, 1),
      docId,
      ownerId: uid,
      ...mutableFields,
    },
    mutableFields
  );
}

export async function syncGradeToFirestore(uid: string, grade: Grade): Promise<void> {
  const docId = getGradeDocId(uid, grade.id);
  const studentId = clampNumber(grade.studentId, 1, 1000000000, 1);
  const subjectId = clampNumber(grade.subjectId, 1, 1000000000, 1);
  const classId = clampNumber(grade.classId, 1, 1000000000, 1);

  const createPayload = {
    id: clampNumber(grade.id, 1, 1000000000, 1),
    docId,
    ownerId: uid,
    studentId,
    studentDocId: getStudentDocId(uid, studentId),
    subjectId,
    subjectDocId: getSubjectDocId(uid, subjectId),
    classId,
    classDocId: getClassDocId(uid, classId),
    semester: grade.semester === 2 ? 2 : 1,
    score: clampNumber(grade.score, 0, 90, 0),
    testDate: sanitizeString(grade.testDate, 30, new Date().toISOString().split('T')[0]),
    type: grade.type === 'exam' ? 'exam' : 'regular',
  };

  const updatePayload = {
    score: createPayload.score,
    testDate: createPayload.testDate,
  };

  await upsertFirestoreDoc('grades', docId, createPayload, updatePayload);
}

export async function syncTahfidzToFirestore(uid: string, tfz: TahfidzGrade): Promise<void> {
  const docId = getTahfidzDocId(uid, tfz.id);
  const studentId = clampNumber(tfz.studentId, 1, 1000000000, 1);
  const classId = clampNumber(tfz.classId, 1, 1000000000, 1);
  const validLetters: TahfidzGrade['gradeLetter'][] = ['A', 'B', 'C', 'D', 'E'];
  const gradeLetter = validLetters.includes(tfz.gradeLetter) ? tfz.gradeLetter : 'B';

  const mutableFields = {
    tahfidzScore: clampNumber(tfz.tahfidzScore, 0, 90, 0),
    tajweedScore: clampNumber(tfz.tajweedScore, 0, 90, 0),
    totalScore: clampNumber(tfz.totalScore, 0, 90, 0),
    gradeLetter,
    notes: sanitizeString(tfz.notes, 500, ''),
    testDate: sanitizeString(tfz.testDate, 30, new Date().toISOString().split('T')[0]),
  };

  const createPayload = {
    id: clampNumber(tfz.id, 1, 1000000000, 1),
    docId,
    ownerId: uid,
    studentId,
    studentDocId: getStudentDocId(uid, studentId),
    classId,
    classDocId: getClassDocId(uid, classId),
    semester: tfz.semester === 2 ? 2 : 1,
    ...mutableFields,
  };

  await upsertFirestoreDoc('tahfidz_grades', docId, createPayload, mutableFields);
}

export async function syncReportCardToFirestore(uid: string, rep: ReportCardRecord): Promise<void> {
  const docId = getReportCardDocId(uid, rep.id);
  const studentId = clampNumber(rep.studentId, 1, 1000000000, 1);
  const classId = clampNumber(rep.classId, 1, 1000000000, 1);

  const eks1 = rep.extracurriculars?.[0] || { name: '', predicate: 'A' as const, description: '' };
  const eks2 = rep.extracurriculars?.[1] || { name: '', predicate: 'B' as const, description: '' };

  const validPreds: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C'];
  const validStatus: Array<'draft' | 'ready' | 'published'> = ['draft', 'ready', 'published'];

  const mutableFields = {
    status: validStatus.includes(rep.status) ? rep.status : 'ready',
    sick: clampNumber(rep.attendance?.sick ?? 0, 0, 365, 0),
    permission: clampNumber(rep.attendance?.permission ?? 0, 0, 365, 0),
    unexcused: clampNumber(rep.attendance?.unexcused ?? 0, 0, 365, 0),
    teacherNotes: sanitizeString(rep.teacherNotes, 1000, ''),
    tahfidzNotes: sanitizeString(rep.tahfidzNotes || '', 500, ''),
    spiritualAttitude: validPreds.includes(rep.spiritualAttitude) ? rep.spiritualAttitude : 'A',
    spiritualDescription: sanitizeString(rep.spiritualDescription, 500, ''),
    socialAttitude: validPreds.includes(rep.socialAttitude) ? rep.socialAttitude : 'A',
    socialDescription: sanitizeString(rep.socialDescription, 500, ''),
    ekskul1Name: sanitizeString(eks1.name, 120, ''),
    ekskul1Pred: validPreds.includes(eks1.predicate) ? eks1.predicate : 'A',
    ekskul1Desc: sanitizeString(eks1.description, 300, ''),
    ekskul2Name: sanitizeString(eks2.name, 120, ''),
    ekskul2Pred: validPreds.includes(eks2.predicate) ? eks2.predicate : 'B',
    ekskul2Desc: sanitizeString(eks2.description, 300, ''),
    issuePlace: sanitizeString(rep.issuePlace, 80, 'Bandung'),
    issueDate: sanitizeString(rep.issueDate, 30, new Date().toISOString().split('T')[0]),
    headmasterName: sanitizeString(rep.headmasterName, 120, 'Muhammad Siroj, S.Pd.I'),
    headmasterNip: sanitizeString(rep.headmasterNip || '', 60, ''),
    classTeacherName: sanitizeString(rep.classTeacherName, 120, 'Wali Kelas'),
  };

  const createPayload = {
    id: sanitizeString(rep.id, 128, `${studentId}_${rep.semester}_${rep.academicYear}`),
    docId,
    ownerId: uid,
    studentId,
    studentDocId: getStudentDocId(uid, studentId),
    classId,
    classDocId: getClassDocId(uid, classId),
    semester: rep.semester === 2 ? 2 : 1,
    academicYear: sanitizeString(rep.academicYear, 20, '2025/2026'),
    ...mutableFields,
  };

  await upsertFirestoreDoc('report_cards', docId, createPayload, mutableFields);
}

export function fromFirestoreReportCard(data: Record<string, any>): ReportCardRecord {
  const extracurriculars = [];
  if (data.ekskul1Name) {
    extracurriculars.push({
      name: String(data.ekskul1Name),
      predicate: (data.ekskul1Pred as 'A' | 'B' | 'C') || 'A',
      description: String(data.ekskul1Desc || ''),
    });
  }
  if (data.ekskul2Name) {
    extracurriculars.push({
      name: String(data.ekskul2Name),
      predicate: (data.ekskul2Pred as 'A' | 'B' | 'C') || 'B',
      description: String(data.ekskul2Desc || ''),
    });
  }
  return {
    id: String(data.id),
    studentId: Number(data.studentId),
    classId: Number(data.classId),
    semester: Number(data.semester) === 2 ? 2 : 1,
    academicYear: String(data.academicYear || '2025/2026'),
    status: (data.status as 'draft' | 'ready' | 'published') || 'ready',
    attendance: {
      sick: Number(data.sick || 0),
      permission: Number(data.permission || 0),
      unexcused: Number(data.unexcused || 0),
    },
    teacherNotes: String(data.teacherNotes || ''),
    tahfidzNotes: String(data.tahfidzNotes || ''),
    spiritualAttitude: (data.spiritualAttitude as 'A' | 'B' | 'C') || 'A',
    spiritualDescription: String(data.spiritualDescription || ''),
    socialAttitude: (data.socialAttitude as 'A' | 'B' | 'C') || 'A',
    socialDescription: String(data.socialDescription || ''),
    extracurriculars,
    issuePlace: String(data.issuePlace || 'Bandung'),
    issueDate: String(data.issueDate || '2025-12-20'),
    headmasterName: String(data.headmasterName || 'Muhammad Siroj, S.Pd.I'),
    headmasterNip: String(data.headmasterNip || ''),
    classTeacherName: String(data.classTeacherName || 'Wali Kelas'),
    updatedAt:
      data.updatedAt && typeof data.updatedAt.toDate === 'function'
        ? data.updatedAt.toDate().toISOString()
        : new Date().toISOString(),
  };
}

export async function syncExamFileToFirestore(uid: string, file: ExamFile): Promise<void> {
  const docId = getExamFileDocId(uid, file.id);
  const subjectId = clampNumber(file.subjectId, 1, 1000000000, 1);
  const classId = clampNumber(file.classId, 1, 1000000000, 1);

  const mutableFields = {
    subjectId,
    subjectDocId: getSubjectDocId(uid, subjectId),
    classId,
    classDocId: getClassDocId(uid, classId),
    title: sanitizeString(file.title, 150, 'Dokumen Soal'),
    fileName: sanitizeString(file.fileName, 150, 'soal.pdf'),
    fileSize: sanitizeString(file.fileSize, 40, '100 KB'),
    uploadDate: sanitizeString(file.uploadDate, 30, new Date().toISOString().split('T')[0]),
  };

  const createPayload = {
    id: clampNumber(file.id, 1, 1000000000, 1),
    docId,
    ownerId: uid,
    ...mutableFields,
  };

  await upsertFirestoreDoc('exam_files', docId, createPayload, mutableFields);
}

export async function syncExamQuestionToFirestore(
  uid: string,
  packageDocId: string,
  q: QuestionItem
): Promise<void> {
  const qDocId = getExamQuestionDocId(q.id);
  const validAnswers = ['A', 'B', 'C', 'D', ''];
  const correctAnswer =
    q.correctAnswer && validAnswers.includes(q.correctAnswer) ? q.correctAnswer : '';

  const mutableFields = {
    text: sanitizeString(q.text, 2000, 'Pertanyaan ujian'),
    optionA: sanitizeString(q.optionA || '', 500, ''),
    optionB: sanitizeString(q.optionB || '', 500, ''),
    optionC: sanitizeString(q.optionC || '', 500, ''),
    optionD: sanitizeString(q.optionD || '', 500, ''),
    correctAnswer,
  };

  const createPayload = {
    id: clampNumber(q.id, 1, 1000000000, 1),
    docId: qDocId,
    packageDocId,
    ownerId: uid,
    ...mutableFields,
  };

  await upsertFirestoreDoc(
    `exam_packages/${packageDocId}/questions`,
    qDocId,
    createPayload,
    mutableFields
  );
}

export async function syncExamPackageToFirestore(
  uid: string,
  pkg: ExamQuestionsPackage
): Promise<void> {
  const docId = getExamPackageDocId(uid, pkg.id);
  const subjectId = clampNumber(pkg.subjectId, 1, 1000000000, 1);
  const classId = clampNumber(pkg.classId, 1, 1000000000, 1);
  const type = pkg.type === 'multiple_choice' ? 'multiple_choice' : 'essay';
  const packageDate = sanitizeString(pkg.createdAt, 30, new Date().toISOString().split('T')[0]);

  const mutableFields = {
    subjectId,
    subjectDocId: getSubjectDocId(uid, subjectId),
    classId,
    classDocId: getClassDocId(uid, classId),
    type,
    packageDate,
  };

  const createPayload = {
    id: clampNumber(pkg.id, 1, 1000000000, 1),
    docId,
    ownerId: uid,
    ...mutableFields,
  };

  // 1. Ensure parent exam_package document exists first (for Pillar 1 Master Gate!)
  await upsertFirestoreDoc('exam_packages', docId, createPayload, mutableFields);

  // 2. Sync all questions in subcollection /exam_packages/{docId}/questions and remove deleted ones
  const questionsPath = `exam_packages/${docId}/questions`;
  const activeDocIds = new Set((pkg.questions || []).map((q) => getExamQuestionDocId(q.id)));
  const knownQuestionIds = getKnownDocIdsInCollection(questionsPath);

  const deletions = Array.from(knownQuestionIds)
    .filter((id) => !activeDocIds.has(id))
    .map((id) => deleteFirestoreDoc(questionsPath, id));
  if (deletions.length > 0) {
    await Promise.all(deletions);
  }

  if (pkg.questions && pkg.questions.length > 0) {
    await Promise.all(pkg.questions.map((q) => syncExamQuestionToFirestore(uid, docId, q)));
  }
}

export async function deleteExamPackageWithQuestions(uid: string, packageId: number): Promise<void> {
  const pkgDocId = getExamPackageDocId(uid, packageId);
  const questionsPath = `exam_packages/${pkgDocId}/questions`;
  const knownQuestionIds = getKnownDocIdsInCollection(questionsPath);
  if (knownQuestionIds.size > 0) {
    await Promise.all(
      Array.from(knownQuestionIds).map((id) => deleteFirestoreDoc(questionsPath, id))
    );
  }
  await deleteFirestoreDoc('exam_packages', pkgDocId);
}

// =========================================================
// 3-Stage Relational Seeding / Restoration Cascade
// =========================================================

export interface WorkspaceSeedPayload {
  siteSettings: SiteSettings;
  themeSettings: ThemeSettings;
  academicYear: string;
  users: User[];
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  grades: Grade[];
  tahfidzGrades: TahfidzGrade[];
  reportCards: ReportCardRecord[];
  examFiles: ExamFile[];
  examPackages: ExamQuestionsPackage[];
  includeSchoolConfig?: boolean;
  onlyIfMissing?: boolean;
}

export async function seedFullWorkspaceToFirestore(
  uid: string,
  payload: WorkspaceSeedPayload
): Promise<void> {
  if (isFirestoreQuotaExhausted()) return;

  const onlyIfMissing = Boolean(payload.onlyIfMissing);

  // Deduplicate and normalize users by target docId so no two records collide
  const uniqueUsersMap = new Map<string, User>();
  payload.users.forEach((u) => {
    const cleanUser = normalizeUserRecord(u);
    const docId = getUserProfileDocId(uid, cleanUser.id, cleanUser.username);
    uniqueUsersMap.set(docId, cleanUser);
  });
  const deduplicatedUsers = Array.from(uniqueUsersMap.values());

  setGlobalDatabaseCache({
    users: deduplicatedUsers,
    workspace: {
      classes: payload.classes,
      subjects: payload.subjects,
      students: payload.students,
      grades: payload.grades,
      tahfidzGrades: payload.tahfidzGrades,
      reportCards: payload.reportCards,
      examFiles: payload.examFiles,
      examPackages: payload.examPackages,
    },
  });

  // Clean up any known corrupted user documents tracked by onSnapshot
  const knownUsersSet = getKnownDocIdsInCollection('users');
  const corruptedDeletes = Array.from(knownUsersSet)
    .filter((docId) => /^usr_[a-zA-Z0-9]+_usr_/.test(docId))
    .map((docId) => deleteFirestoreDoc('users', docId));
  if (corruptedDeletes.length > 0) {
    await Promise.all(corruptedDeletes);
  }

  if (isFirestoreQuotaExhausted()) return;

  const shouldSyncConfig =
    Boolean(payload.includeSchoolConfig) &&
    (!onlyIfMissing || !isDocKnownInFirestore('school_configs', GLOBAL_SCHOOL_CONFIG_DOC_ID));

  const usersToSync = onlyIfMissing
    ? deduplicatedUsers.filter(
        (u) => !isDocKnownInFirestore('users', getUserProfileDocId(uid, u.id, u.username))
      )
    : deduplicatedUsers;
  const classesToSync = onlyIfMissing
    ? payload.classes.filter((c) => !isDocKnownInFirestore('classes', getClassDocId(uid, c.id)))
    : payload.classes;
  const subjectsToSync = onlyIfMissing
    ? payload.subjects.filter((s) => !isDocKnownInFirestore('subjects', getSubjectDocId(uid, s.id)))
    : payload.subjects;

  // Stage 1: Root / Parent Collections (school_configs, users, classes, subjects)
  if (shouldSyncConfig) {
    await syncSchoolConfigToFirestore(
      uid,
      payload.siteSettings,
      payload.themeSettings,
      payload.academicYear,
      Date.now(),
      {
        users: deduplicatedUsers,
      }
    );
  }
  await Promise.all([
    runInChunks(usersToSync, 15, (u) => syncUserProfileToFirestore(uid, u)),
    runInChunks(classesToSync, 15, (c) => syncClassToFirestore(uid, c)),
    runInChunks(subjectsToSync, 15, (s) => syncSubjectToFirestore(uid, s)),
  ]);

  if (isFirestoreQuotaExhausted()) return;

  // Stage 2: First-Level Dependents (students, exam_files, exam_packages)
  const validClassIds = new Set(payload.classes.map((c) => c.id));
  const validSubjectIds = new Set(payload.subjects.map((s) => s.id));

  const validStudents = payload.students.filter((st) => validClassIds.has(st.classId));
  const validExamFiles = payload.examFiles.filter(
    (ef) => validClassIds.has(ef.classId) && validSubjectIds.has(ef.subjectId)
  );
  const validExamPackages = payload.examPackages.filter(
    (ep) => validClassIds.has(ep.classId) && validSubjectIds.has(ep.subjectId)
  );

  const studentsToSync = onlyIfMissing
    ? validStudents.filter((st) => !isDocKnownInFirestore('students', getStudentDocId(uid, st.id)))
    : validStudents;
  const examFilesToSync = onlyIfMissing
    ? validExamFiles.filter(
        (ef) => !isDocKnownInFirestore('exam_files', getExamFileDocId(uid, ef.id))
      )
    : validExamFiles;
  const examPackagesToSync = onlyIfMissing
    ? validExamPackages.filter(
        (ep) => !isDocKnownInFirestore('exam_packages', getExamPackageDocId(uid, ep.id))
      )
    : validExamPackages;

  await runInChunks(studentsToSync, 20, (st) => syncStudentToFirestore(uid, st));
  await Promise.all([
    runInChunks(examFilesToSync, 15, (ef) => syncExamFileToFirestore(uid, ef)),
    runInChunks(examPackagesToSync, 10, (ep) => syncExamPackageToFirestore(uid, ep)),
  ]);

  if (isFirestoreQuotaExhausted()) return;

  // Stage 3: Second-Level Dependents (grades, tahfidz_grades, report_cards)
  const validStudentIds = new Set(validStudents.map((st) => st.id));

  const validGrades = payload.grades.filter(
    (g) =>
      validStudentIds.has(g.studentId) &&
      validSubjectIds.has(g.subjectId) &&
      validClassIds.has(g.classId)
  );
  const validTahfidz = payload.tahfidzGrades.filter(
    (t) => validStudentIds.has(t.studentId) && validClassIds.has(t.classId)
  );
  const validReports = payload.reportCards.filter(
    (r) => validStudentIds.has(r.studentId) && validClassIds.has(r.classId)
  );

  const gradesToSync = onlyIfMissing
    ? validGrades.filter((g) => !isDocKnownInFirestore('grades', getGradeDocId(uid, g.id)))
    : validGrades;
  const tahfidzToSync = onlyIfMissing
    ? validTahfidz.filter(
        (t) => !isDocKnownInFirestore('tahfidz_grades', getTahfidzDocId(uid, t.id))
      )
    : validTahfidz;
  const reportsToSync = onlyIfMissing
    ? validReports.filter(
        (r) => !isDocKnownInFirestore('report_cards', getReportCardDocId(uid, r.id))
      )
    : validReports;

  await runInChunks(gradesToSync, 25, (g) => syncGradeToFirestore(uid, g));
  await runInChunks(tahfidzToSync, 20, (t) => syncTahfidzToFirestore(uid, t));
  await runInChunks(reportsToSync, 20, (r) => syncReportCardToFirestore(uid, r));
}
