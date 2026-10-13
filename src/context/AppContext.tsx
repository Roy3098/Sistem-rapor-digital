import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import {
  db,
  auth,
  googleProvider,
  OperationType,
  handleFirestoreError,
  isFirestoreQuotaExhausted,
  resetFirestoreQuotaState,
} from '../firebase';
import {
  GLOBAL_SCHOOL_CONFIG_DOC_ID,
  isAuthorizedSuperAdminEmail,
  isAuthorizedSuperAdminUser,
  isReservedSuperAdminUsername,
  getUserProfileDocId,
  normalizeUserId,
  normalizeUserRecord,
  buildGoogleUserRecord,
  normalizeUsersList,
  mergeUserLists,
  setGlobalDatabaseCache,
  isCorruptedUserDocId,
  getClassDocId,
  getSubjectDocId,
  getStudentDocId,
  getGradeDocId,
  getTahfidzDocId,
  getReportCardDocId,
  getExamFileDocId,
  getExamPackageDocId,
  getExamQuestionDocId,
  markDocKnownInFirestore,
  isDocKnownInFirestore,
  getKnownDocIdsInCollection,
  runInChunks,
  deleteFirestoreDoc,
  syncSchoolConfigToFirestore,
  syncUserProfileToFirestore,
  syncClassToFirestore,
  syncSubjectToFirestore,
  syncStudentToFirestore,
  syncGradeToFirestore,
  syncTahfidzToFirestore,
  syncReportCardToFirestore,
  fromFirestoreReportCard,
  syncExamFileToFirestore,
  syncExamPackageToFirestore,
  deleteExamPackageWithQuestions,
  seedFullWorkspaceToFirestore,
  parseExtendedSchoolConfig,
} from '../services/firestoreSync';
import {
  User,
  Subject,
  ClassRoom,
  Student,
  Grade,
  TahfidzGrade,
  ExamFile,
  ExamQuestionsPackage,
  QuestionItem,
  SiteSettings,
  ThemeSettings,
  ReportCardRecord,
  AnnouncementItem,
  StudentAttendanceRecord,
  TeacherAttendanceRecord,
  TeachingAssignment,
  FormUasTab,
} from '../types';
import {
  SUPERADMIN_USER,
  INITIAL_USER,
  INITIAL_USERS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_SITE_SETTINGS,
  INITIAL_THEME_SETTINGS,
  INITIAL_REPORT_CARDS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_STUDENTS,
  INITIAL_GRADES,
  INITIAL_TAHFIDZ,
  INITIAL_EXAM_FILES,
  INITIAL_EXAM_PACKAGES,
  INITIAL_STUDENT_ATTENDANCE,
  INITIAL_TEACHER_ATTENDANCE,
  INITIAL_TEACHING_ASSIGNMENTS,
} from '../data/initialData';
import {
  getThemeClasses,
  ThemeClasses,
  applyThemeCssVariables,
  normalizeThemeSettings,
  isDarkSurfaceMode,
  evaluateGradePredicate,
} from '../utils/theme';

export type AppView =
  | 'dashboard'
  | 'form-uas'
  | 'attendance'
  | 'teaching'
  | 'grades'
  | 'reports'
  | 'exams'
  | 'tahfidz'
  | 'manage'
  | 'profile';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  // Auth & Users
  currentUser: User | null;
  isSuperAdmin: boolean;
  firebaseUser: FirebaseUser | null;
  isAuthReady: boolean;
  isCloudSynced: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  connectGoogleCloudSync: () => Promise<boolean>;
  forceSyncAllToCloud: () => Promise<void>;
  users: User[];
  login: (username: string, password: string) => { success: boolean; message?: string };
  loginWithGoogle: (email?: string, name?: string) => Promise<void>;
  register: (username: string, fullName: string, password: string) => boolean;
  forgotPassword: (username: string, newPassword: string) => boolean;
  logout: () => void;
  updateProfile: (fullName: string, avatarUrl?: string) => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;

  // Super Admin Management
  addUser: (
    username: string,
    fullName: string,
    email: string,
    role: User['role'],
    password?: string
  ) => void;
  updateUserRecord: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;
  resetUserPassword: (id: string, newPass: string) => void;

  // Site Settings & Appearance (Super Admin)
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>, options?: { silent?: boolean }) => void;
  themeSettings: ThemeSettings;
  themeClasses: ThemeClasses;
  isDeviceDarkMode: boolean;
  setDeviceDarkMode: (enabled: boolean) => void;
  toggleDeviceDarkMode: () => void;
  updateThemeSettings: (settings: Partial<ThemeSettings>, options?: { silent?: boolean }) => void;
  updateSchoolConfig: (
    patch: {
      themeSettings?: Partial<ThemeSettings>;
      siteSettings?: Partial<SiteSettings>;
      academicYear?: string;
    },
    options?: { silent?: boolean }
  ) => void;
  saveSchoolConfig: (
    themePatch: Partial<ThemeSettings>,
    sitePatch: Partial<SiteSettings>,
    newAcademicYear?: string
  ) => void;
  resetThemeSettings: () => void;
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (open: boolean) => void;

  // Database Management (Super Admin)
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => { success: boolean; message: string };
  updateDatabaseTable: (tableKey: string, records: any) => { success: boolean; message: string };
  clearAllGrades: () => void;

  // Announcements Management (Super Admin)
  announcements: AnnouncementItem[];
  addAnnouncement: (data: Omit<AnnouncementItem, 'id' | 'date'>) => void;
  updateAnnouncement: (id: string, data: Partial<AnnouncementItem>) => void;
  deleteAnnouncement: (id: string) => void;
  setPinnedAnnouncement: (id: string) => void;
  superAdminFocusSection: string | null;
  setSuperAdminFocusSection: (section: string | null) => void;
  openSuperAdminAnnouncements: () => void;

  // Navigation & UI
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  formUasTab: FormUasTab;
  setFormUasTab: (tab: FormUasTab) => void;
  manageTab: 'subjects' | 'classes' | 'students' | 'superadmin';
  setManageTab: (tab: 'subjects' | 'classes' | 'students' | 'superadmin') => void;
  academicYear: string;
  setAcademicYear: (year: string) => void;
  viewMode: 'responsive' | 'mobile_preview';
  setViewMode: (mode: 'responsive' | 'mobile_preview') => void;

  // Data
  subjects: Subject[];
  classes: ClassRoom[];
  students: Student[];
  grades: Grade[];
  tahfidzGrades: TahfidzGrade[];
  reportCards: ReportCardRecord[];
  examFiles: ExamFile[];
  examPackages: ExamQuestionsPackage[];
  studentAttendance: StudentAttendanceRecord[];
  teacherAttendance: TeacherAttendanceRecord[];
  teachingAssignments: TeachingAssignment[];

  // CRUD Absensi (Santri & Guru)
  saveStudentAttendance: (records: StudentAttendanceRecord[]) => void;
  saveTeacherAttendance: (record: TeacherAttendanceRecord) => void;
  syncAttendanceToReportCards: (classId: number, semester: 1 | 2) => number;

  // CRUD Pelajaran yang Diajarkan & Jadwal
  saveTeachingAssignment: (assignment: TeachingAssignment) => void;
  deleteTeachingAssignment: (id: string) => void;

  // CRUD Subjects
  addSubject: (name: string, category?: Subject['category']) => void;
  updateSubject: (id: number, name: string, category?: Subject['category']) => void;
  deleteSubject: (id: number) => void;

  // CRUD Classes
  addClass: (name: string, teacher: string) => void;
  updateClass: (id: number, name: string, teacher: string) => void;
  deleteClass: (id: number) => void;

  // CRUD Students
  addStudent: (data: Omit<Student, 'id'>) => void;
  updateStudent: (id: number, data: Omit<Student, 'id'>) => void;
  deleteStudent: (id: number) => void;

  // CRUD Grades
  saveBulkGrades: (
    subjectId: number,
    classId: number,
    semester: 1 | 2,
    gradesData: Record<number, number>,
    options?: { silent?: boolean }
  ) => void;
  saveStudentGradesBatch: (
    studentId: number,
    classId: number,
    semester: 1 | 2,
    subjectScores: Record<number, number | null>,
    options?: { silent?: boolean }
  ) => void;
  updateGrade: (id: number, score: number, options?: { silent?: boolean }) => void;
  deleteGrade: (id: number, options?: { silent?: boolean }) => void;

  // CRUD Tahfidz
  saveBulkTahfidz: (
    classId: number,
    semester: 1 | 2,
    records: Array<{ studentId: number; notes: string; tahfidzScore: number; tajweedScore: number }>,
    options?: { silent?: boolean }
  ) => void;
  updateTahfidzGrade: (
    id: number,
    data: { tahfidzScore: number; tajweedScore: number; notes: string; testDate: string },
    options?: { silent?: boolean }
  ) => void;
  deleteTahfidzGrade: (id: number, options?: { silent?: boolean }) => void;

  // CRUD Digital Report Cards
  saveReportCard: (record: ReportCardRecord, options?: { silent?: boolean }) => void;
  deleteReportCard: (id: string) => void;
  generateClassReportCards: (classId: number, semester: 1 | 2) => number;

  // CRUD Exams
  addExamFile: (subjectId: number, classId: number, title: string, fileName: string, fileSize: string) => void;
  updateExamFile: (id: number, data: Partial<ExamFile>) => void;
  deleteExamFile: (id: number) => void;
  addExamPackage: (data: Omit<ExamQuestionsPackage, 'id' | 'createdAt'>) => void;
  updateExamPackage: (id: number, data: Partial<ExamQuestionsPackage>) => void;
  deleteExamPackage: (id: number) => void;
  deleteQuestionFromPackage: (packageId: number, questionId: number) => void;

  // Utilities
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  resetToSampleData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SUPERADMIN_VERIFIED_TOKEN_KEY = 'bw_sa_verified_v1';
const SUPERADMIN_VERIFIED_TOKEN_VALUE = 'verified_superadmin_session';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deletedUsernames, setDeletedUsernames] = useState<string[]>(() => {
    const saved = localStorage.getItem('bw_deleted_usernames');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed
            .map((u) => String(u || '').toLowerCase().trim())
            .filter((u) => u && u !== 'superadmin')
        : [];
    } catch {
      return [];
    }
  });

  const [userPasswords, setUserPasswords] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('bw_user_passwords');
    const defaults: Record<string, string> = {
      superadmin: 'superadmin123',
      abuza: '123456',
      ridwan: '123456',
      hilal: '123456',
    };
    if (!saved) return defaults;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...defaults,
        ...(parsed && typeof parsed === 'object' ? parsed : {}),
      };
    } catch {
      return defaults;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bw_user');
    if (!saved) return INITIAL_USER;
    try {
      const parsed = normalizeUserRecord(JSON.parse(saved));
      if (parsed.username === 'superadmin' || parsed.role === 'superadmin') {
        const isVerifiedToken =
          localStorage.getItem(SUPERADMIN_VERIFIED_TOKEN_KEY) === SUPERADMIN_VERIFIED_TOKEN_VALUE;
        if (!isVerifiedToken || !isAuthorizedSuperAdminUser(parsed)) {
          localStorage.removeItem(SUPERADMIN_VERIFIED_TOKEN_KEY);
          return INITIAL_USER;
        }
      }
      return parsed;
    } catch {
      return INITIAL_USER;
    }
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('bw_users_list');
    if (!saved) return normalizeUsersList(INITIAL_USERS, INITIAL_USERS);
    try {
      return normalizeUsersList(JSON.parse(saved), INITIAL_USERS);
    } catch {
      return normalizeUsersList(INITIAL_USERS, INITIAL_USERS);
    }
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('bw_site_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SITE_SETTINGS,
          ...parsed,
          announcements:
            Array.isArray(parsed.announcements) && parsed.announcements.length > 0
              ? parsed.announcements
              : INITIAL_ANNOUNCEMENTS,
        };
      } catch {
        return INITIAL_SITE_SETTINGS;
      }
    }
    return INITIAL_SITE_SETTINGS;
  });

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('bw_theme_settings');
    if (saved) {
      try {
        return normalizeThemeSettings({ ...INITIAL_THEME_SETTINGS, ...JSON.parse(saved) });
      } catch {
        return normalizeThemeSettings(INITIAL_THEME_SETTINGS);
      }
    }
    return normalizeThemeSettings(INITIAL_THEME_SETTINGS);
  });

  const [deviceDarkOverride, setDeviceDarkOverrideState] = useState<boolean | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('bw_device_dark_mode');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return null;
  });

  const isDeviceDarkMode = isDarkSurfaceMode(themeSettings, deviceDarkOverride);
  const isDeviceDarkModeRef = useRef<boolean>(isDeviceDarkMode);
  const deviceDarkOverrideRef = useRef<boolean | null>(deviceDarkOverride);
  const lastRemoteSurfaceModeRef = useRef<string | null>(null);
  isDeviceDarkModeRef.current = isDeviceDarkMode;
  deviceDarkOverrideRef.current = deviceDarkOverride;

  const clearDeviceDarkOverride = () => {
    setDeviceDarkOverrideState(null);
    deviceDarkOverrideRef.current = null;
    localStorage.removeItem('bw_device_dark_mode');
  };

  const setDeviceDarkMode = (enabled: boolean) => {
    setDeviceDarkOverrideState(enabled);
    deviceDarkOverrideRef.current = enabled;
    isDeviceDarkModeRef.current = enabled;
    localStorage.setItem('bw_device_dark_mode', enabled ? 'dark' : 'light');
    applyThemeCssVariables(themeSettingsRef.current, enabled);
  };

  const toggleDeviceDarkMode = () => {
    const nextVal = !isDeviceDarkModeRef.current;
    setDeviceDarkMode(nextVal);
    showToast(
      nextVal
        ? 'Mode Malam diaktifkan untuk perangkat ini.'
        : 'Mode Terang diaktifkan untuk perangkat ini.',
      'info'
    );
  };

  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [currentView, setCurrentViewState] = useState<AppView>('dashboard');
  const [formUasTab, setFormUasTab] = useState<FormUasTab>('grades');
  const [manageTab, setManageTab] = useState<'subjects' | 'classes' | 'students' | 'superadmin'>(() =>
    isAuthorizedSuperAdminUser(currentUser) ? 'superadmin' : 'subjects'
  );
  const [superAdminFocusSection, setSuperAdminFocusSection] = useState<string | null>(null);
  const [academicYear, setAcademicYearState] = useState<string>('2025/2026');
  const [viewMode, setViewMode] = useState<'responsive' | 'mobile_preview'>('responsive');

  const handleSetCurrentView = (view: AppView) => {
    if (view === 'form-uas') {
      setCurrentViewState('grades');
    } else {
      setCurrentViewState(view);
    }
  };

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('bw_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const saved = localStorage.getItem('bw_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('bw_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [grades, setGrades] = useState<Grade[]>(() => {
    const saved = localStorage.getItem('bw_grades');
    return saved ? JSON.parse(saved) : INITIAL_GRADES;
  });

  const [tahfidzGrades, setTahfidzGrades] = useState<TahfidzGrade[]>(() => {
    const saved = localStorage.getItem('bw_tahfidz');
    return saved ? JSON.parse(saved) : INITIAL_TAHFIDZ;
  });

  const [reportCards, setReportCards] = useState<ReportCardRecord[]>(() => {
    const saved = localStorage.getItem('bw_report_cards');
    return saved ? JSON.parse(saved) : INITIAL_REPORT_CARDS;
  });

  const [examFiles, setExamFiles] = useState<ExamFile[]>(() => {
    const saved = localStorage.getItem('bw_exam_files');
    return saved ? JSON.parse(saved) : INITIAL_EXAM_FILES;
  });

  const [examPackages, setExamPackages] = useState<ExamQuestionsPackage[]>(() => {
    const saved = localStorage.getItem('bw_exam_packages');
    return saved ? JSON.parse(saved) : INITIAL_EXAM_PACKAGES;
  });

  const [studentAttendance, setStudentAttendance] = useState<StudentAttendanceRecord[]>(() => {
    const saved = localStorage.getItem('bw_student_attendance');
    return saved ? JSON.parse(saved) : INITIAL_STUDENT_ATTENDANCE;
  });

  const [teacherAttendance, setTeacherAttendance] = useState<TeacherAttendanceRecord[]>(() => {
    const saved = localStorage.getItem('bw_teacher_attendance');
    return saved ? JSON.parse(saved) : INITIAL_TEACHER_ATTENDANCE;
  });

  const [teachingAssignments, setTeachingAssignments] = useState<TeachingAssignment[]>(() => {
    const saved = localStorage.getItem('bw_teaching_assignments');
    return saved ? JSON.parse(saved) : INITIAL_TEACHING_ASSIGNMENTS;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const seedingRef = useRef<boolean>(false);

  // Synchronous state refs to prevent React 19 async batching / stale closure bugs when syncing to Firestore
  const currentUserRef = useRef<User | null>(currentUser);
  const usersRef = useRef<User[]>(users);
  const deletedUsernamesRef = useRef<string[]>(deletedUsernames);
  const userPasswordsRef = useRef<Record<string, string>>(userPasswords);
  const siteSettingsRef = useRef<SiteSettings>(siteSettings);
  const themeSettingsRef = useRef<ThemeSettings>(themeSettings);
  const academicYearRef = useRef<string>(academicYear);
  const classesRef = useRef<ClassRoom[]>(classes);
  const subjectsRef = useRef<Subject[]>(subjects);
  const studentsRef = useRef<Student[]>(students);
  const gradesRef = useRef<Grade[]>(grades);
  const tahfidzGradesRef = useRef<TahfidzGrade[]>(tahfidzGrades);
  const reportCardsRef = useRef<ReportCardRecord[]>(reportCards);
  const examFilesRef = useRef<ExamFile[]>(examFiles);
  const examPackagesRef = useRef<ExamQuestionsPackage[]>(examPackages);
  const studentAttendanceRef = useRef<StudentAttendanceRecord[]>(studentAttendance);
  const teacherAttendanceRef = useRef<TeacherAttendanceRecord[]>(teacherAttendance);
  const teachingAssignmentsRef = useRef<TeachingAssignment[]>(teachingAssignments);
  const hasRemoteWorkspaceRef = useRef<boolean>(false);
  const hasHydratedGlobalConfigRef = useRef<boolean>(false);
  const lastAppliedRemoteUpdateRef = useRef<number>(0);

  const lastLocalConfigWriteRef = useRef<number>(0);
  const configSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verifiedParentDocsRef = useRef<Set<string>>(new Set());

  const clampScore90 = (val: number): number => {
    const num = Number(val);
    if (isNaN(num)) return 0;
    return Math.min(90, Math.max(0, Math.round(num * 10) / 10));
  };

  const normalizeGradesList = (list: Grade[], studentList: Student[] = studentsRef.current): Grade[] => {
    if (!Array.isArray(list)) return [];
    const studentClassMap = new Map<number, number>();
    studentList.forEach((st) => {
      if (st && typeof st.id === 'number' && typeof st.classId === 'number') {
        studentClassMap.set(st.id, st.classId);
      }
    });
    const dedupMap = new Map<string, Grade>();
    list.forEach((g) => {
      if (!g || typeof g.studentId !== 'number' || typeof g.subjectId !== 'number') return;
      const sem: 1 | 2 = Number(g.semester) === 2 ? 2 : 1;
      const resolvedClassId = studentClassMap.get(g.studentId) ?? Number(g.classId) ?? 1;
      const key = `${g.studentId}_${g.subjectId}_${sem}`;
      dedupMap.set(key, {
        ...g,
        classId: resolvedClassId,
        semester: sem,
        score: clampScore90(g.score),
      });
    });
    return Array.from(dedupMap.values());
  };

  const normalizeTahfidzList = (
    list: TahfidzGrade[],
    studentList: Student[] = studentsRef.current
  ): TahfidzGrade[] => {
    if (!Array.isArray(list)) return [];
    const studentClassMap = new Map<number, number>();
    studentList.forEach((st) => {
      if (st && typeof st.id === 'number' && typeof st.classId === 'number') {
        studentClassMap.set(st.id, st.classId);
      }
    });
    const dedupMap = new Map<string, TahfidzGrade>();
    list.forEach((t) => {
      if (!t || typeof t.studentId !== 'number') return;
      const sem: 1 | 2 = Number(t.semester) === 2 ? 2 : 1;
      const resolvedClassId = studentClassMap.get(t.studentId) ?? Number(t.classId) ?? 1;
      const tfzScore = clampScore90(t.tahfidzScore);
      const tjwScore = clampScore90(t.tajweedScore);
      const totScore = clampScore90(Math.round((tfzScore + tjwScore) / 2));
      const key = `${t.studentId}_${sem}`;
      dedupMap.set(key, {
        ...t,
        classId: resolvedClassId,
        semester: sem,
        tahfidzScore: tfzScore,
        tajweedScore: tjwScore,
        totalScore: totScore,
        gradeLetter: evaluateGradePredicate(totScore, siteSettingsRef.current.gradeThresholds).letter,
      });
    });
    return Array.from(dedupMap.values());
  };

  currentUserRef.current = currentUser;
  usersRef.current = users;
  deletedUsernamesRef.current = deletedUsernames;
  userPasswordsRef.current = userPasswords;
  siteSettingsRef.current = siteSettings;
  themeSettingsRef.current = themeSettings;
  academicYearRef.current = academicYear;
  classesRef.current = classes;
  subjectsRef.current = subjects;
  studentsRef.current = students;
  gradesRef.current = grades;
  tahfidzGradesRef.current = tahfidzGrades;
  reportCardsRef.current = reportCards;
  examFilesRef.current = examFiles;
  examPackagesRef.current = examPackages;
  studentAttendanceRef.current = studentAttendance;
  teacherAttendanceRef.current = teacherAttendance;
  teachingAssignmentsRef.current = teachingAssignments;

  const isSuperAdminUser = (u: User | null): boolean => {
    if (!u) return false;
    if (u.role === 'superadmin' || u.username === 'superadmin') return true;
    if (isAuthorizedSuperAdminUser(u)) return true;
    const isVerifiedLocalSession =
      typeof window !== 'undefined' &&
      localStorage.getItem(SUPERADMIN_VERIFIED_TOKEN_KEY) === SUPERADMIN_VERIFIED_TOKEN_VALUE;
    const isVerifiedFirebaseAdmin = isAuthorizedSuperAdminEmail(auth.currentUser?.email);
    return isVerifiedLocalSession || isVerifiedFirebaseAdmin;
  };
  const isSuperAdminAccount = isSuperAdminUser;
  const isSuperAdmin = isSuperAdminUser(currentUser);

  const themeClasses = getThemeClasses(themeSettings);

  const markSynced = () => {
    setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
  };

  // Keep global database cache synchronized with current accounts, passwords, and all workspace tables
  const refreshGlobalDatabaseCache = (
    overrideUsers?: User[],
    overrideDeleted?: string[],
    overridePasswords?: Record<string, string>
  ) => {
    const activeUsers = overrideUsers || usersRef.current;
    const activeDeleted = overrideDeleted || deletedUsernamesRef.current;
    const activePasswords = overridePasswords || userPasswordsRef.current;
    const usersWithPasswords = activeUsers.map((u) => {
      const cleanU = u.username.toLowerCase().trim();
      const pw = activePasswords[cleanU] || u.password;
      return pw ? { ...u, password: pw } : u;
    });
    setGlobalDatabaseCache({
      users: usersWithPasswords,
      deletedUsernames: activeDeleted,
      workspace: {
        classes: classesRef.current,
        subjects: subjectsRef.current,
        students: studentsRef.current,
        grades: gradesRef.current,
        tahfidzGrades: tahfidzGradesRef.current,
        reportCards: reportCardsRef.current,
        examFiles: examFilesRef.current,
        examPackages: examPackagesRef.current,
        studentAttendance: studentAttendanceRef.current,
        teacherAttendance: teacherAttendanceRef.current,
        teachingAssignments: teachingAssignmentsRef.current,
      },
    });
  };

  // Sync user accounts to Firestore (/users collection + global_config extendedConfigJson) for ALL account types (local & Google)
  const syncAccountsToDatabase = (
    nextUsers: User[],
    targetUserToUpsert?: User,
    deletedList?: string[]
  ) => {
    const effectiveUid = auth.currentUser?.uid || 'global_registry';
    if (isFirestoreQuotaExhausted()) return;

    if (targetUserToUpsert) {
      syncUserProfileToFirestore(effectiveUid, targetUserToUpsert)
        .then(() => {
          setIsCloudSynced(true);
          markSynced();
        })
        .catch(() => {});
    }

    const performConfigSync = () => {
      const mergedNow = mergeUserLists(
        [INITIAL_USERS, usersRef.current, nextUsers],
        deletedList || deletedUsernamesRef.current
      );
      usersRef.current = mergedNow;
      setUsers(mergedNow);
      localStorage.setItem('bw_users_list', JSON.stringify(mergedNow));
      refreshGlobalDatabaseCache(mergedNow, deletedList);
      const writeTs = Date.now();
      lastLocalConfigWriteRef.current = writeTs;
      syncSchoolConfigToFirestore(
        effectiveUid,
        siteSettingsRef.current,
        themeSettingsRef.current,
        academicYearRef.current,
        writeTs,
        {
          users: mergedNow,
          deletedUsernames: deletedList || deletedUsernamesRef.current,
        }
      )
        .then(() => {
          setIsCloudSynced(true);
          markSynced();
        })
        .catch(() => {});
    };

    if (!hasHydratedGlobalConfigRef.current) {
      getDocFromServer(doc(db, 'school_configs', GLOBAL_SCHOOL_CONFIG_DOC_ID))
        .then((snap) => {
          if (snap.exists()) {
            markDocKnownInFirestore('school_configs', GLOBAL_SCHOOL_CONFIG_DOC_ID);
            applyRemoteSchoolConfig(snap.data());
          }
          hasHydratedGlobalConfigRef.current = true;
        })
        .catch(() => {})
        .finally(() => {
          performConfigSync();
        });
    } else {
      performConfigSync();
    }
  };

  const applyRemoteSchoolConfig = (d: Record<string, any>) => {
    const {
      siteExtra,
      themeExtra,
      updatedAtMs,
      users: remoteConfigUsers,
      deletedUsernames: remoteDeletedUsernames,
      workspace: remoteWorkspace,
    } = parseExtendedSchoolConfig(d);
    hasHydratedGlobalConfigRef.current = true;
    if (updatedAtMs > 0) {
      lastAppliedRemoteUpdateRef.current = updatedAtMs;
    }
    const nextYear = String(d.academicYear || '2025/2026');
    academicYearRef.current = nextYear;
    setAcademicYearState(nextYear);

    // 1. Reconcile deleted usernames & all user accounts from database
    let effectiveDeleted = deletedUsernamesRef.current;
    if (Array.isArray(remoteDeletedUsernames)) {
      effectiveDeleted = Array.from(
        new Set([...deletedUsernamesRef.current, ...remoteDeletedUsernames])
      )
        .map((u) => String(u || '').toLowerCase().trim())
        .filter((u) => u && u !== 'superadmin');
      deletedUsernamesRef.current = effectiveDeleted;
      setDeletedUsernames(effectiveDeleted);
      localStorage.setItem('bw_deleted_usernames', JSON.stringify(effectiveDeleted));
    }

    const deletedSet = new Set(effectiveDeleted.map((u) => u.toLowerCase().trim()));

    if (Array.isArray(remoteConfigUsers) && remoteConfigUsers.length > 0) {
      const nextPasswords = { ...userPasswordsRef.current };
      let passwordsChanged = false;

      // Remove passwords of any deleted accounts so old credentials are wiped
      effectiveDeleted.forEach((delKey) => {
        if (delKey !== 'superadmin' && delKey in nextPasswords) {
          delete nextPasswords[delKey];
          passwordsChanged = true;
        }
      });

      remoteConfigUsers.forEach((ru) => {
        const cleanU = String(ru.username || '').toLowerCase().trim();
        const cleanE = String(ru.email || '').toLowerCase().trim();
        if (deletedSet.has(cleanU) || (cleanE && deletedSet.has(cleanE))) {
          return;
        }
        if (cleanU && ru.password && nextPasswords[cleanU] !== ru.password) {
          nextPasswords[cleanU] = String(ru.password);
          passwordsChanged = true;
        }
      });
      if (passwordsChanged) {
        userPasswordsRef.current = nextPasswords;
        setUserPasswords(nextPasswords);
        localStorage.setItem('bw_user_passwords', JSON.stringify(nextPasswords));
      }

      const mergedAccounts = mergeUserLists(
        [INITIAL_USERS, usersRef.current, remoteConfigUsers],
        effectiveDeleted
      );
      usersRef.current = mergedAccounts;
      setUsers(mergedAccounts);
      localStorage.setItem('bw_users_list', JSON.stringify(mergedAccounts));

      // If the currently logged-in user was deleted by Super Admin, immediately terminate their session & reset local profile
      const curr = currentUserRef.current;
      if (curr && !isSuperAdminAccount(curr)) {
        const currU = curr.username.toLowerCase().trim();
        const currE = (curr.email || '').toLowerCase().trim();
        const activeAccount = mergedAccounts.find(
          (u) =>
            u.id === curr.id ||
            u.username.toLowerCase().trim() === currU ||
            (currE && u.email?.toLowerCase().trim() === currE)
        );
        if (deletedSet.has(currU) || (currE && deletedSet.has(currE)) || !activeAccount) {
          currentUserRef.current = null;
          setCurrentUser(null);
          localStorage.removeItem('bw_user');
          localStorage.setItem('bw_explicit_logout', '1');
          signOut(auth).catch(() => {});
        } else if (activeAccount) {
          currentUserRef.current = activeAccount;
          setCurrentUser(activeAccount);
          localStorage.setItem('bw_user', JSON.stringify(activeAccount));
        }
      }
    }

    // 2. Hydrate shared school workspace tables from global_config for ALL users (Google & local)
    if (remoteWorkspace && typeof remoteWorkspace === 'object') {
      hasRemoteWorkspaceRef.current = true;
      if (Array.isArray(remoteWorkspace.classes) && remoteWorkspace.classes.length > 0) {
        classesRef.current = remoteWorkspace.classes;
        setClasses(remoteWorkspace.classes);
        localStorage.setItem('bw_classes', JSON.stringify(remoteWorkspace.classes));
      }
      if (Array.isArray(remoteWorkspace.subjects) && remoteWorkspace.subjects.length > 0) {
        subjectsRef.current = remoteWorkspace.subjects;
        setSubjects(remoteWorkspace.subjects);
        localStorage.setItem('bw_subjects', JSON.stringify(remoteWorkspace.subjects));
      }
      const activeStudentList =
        Array.isArray(remoteWorkspace.students) && remoteWorkspace.students.length > 0
          ? remoteWorkspace.students
          : studentsRef.current;
      if (Array.isArray(remoteWorkspace.students) && remoteWorkspace.students.length > 0) {
        studentsRef.current = remoteWorkspace.students;
        setStudents(remoteWorkspace.students);
        localStorage.setItem('bw_students', JSON.stringify(remoteWorkspace.students));
      }
      if (Array.isArray(remoteWorkspace.grades)) {
        const normalizedGrades = normalizeGradesList(remoteWorkspace.grades, activeStudentList);
        gradesRef.current = normalizedGrades;
        setGrades(normalizedGrades);
        localStorage.setItem('bw_grades', JSON.stringify(normalizedGrades));
      }
      if (Array.isArray(remoteWorkspace.tahfidzGrades)) {
        const normalizedTahfidz = normalizeTahfidzList(
          remoteWorkspace.tahfidzGrades,
          activeStudentList
        );
        tahfidzGradesRef.current = normalizedTahfidz;
        setTahfidzGrades(normalizedTahfidz);
        localStorage.setItem('bw_tahfidz', JSON.stringify(normalizedTahfidz));
      }
      if (Array.isArray(remoteWorkspace.reportCards)) {
        reportCardsRef.current = remoteWorkspace.reportCards;
        setReportCards(remoteWorkspace.reportCards);
        localStorage.setItem('bw_report_cards', JSON.stringify(remoteWorkspace.reportCards));
      }
      if (Array.isArray(remoteWorkspace.examFiles)) {
        examFilesRef.current = remoteWorkspace.examFiles;
        setExamFiles(remoteWorkspace.examFiles);
        localStorage.setItem('bw_exam_files', JSON.stringify(remoteWorkspace.examFiles));
      }
      if (Array.isArray(remoteWorkspace.examPackages)) {
        examPackagesRef.current = remoteWorkspace.examPackages;
        setExamPackages(remoteWorkspace.examPackages);
        localStorage.setItem('bw_exam_packages', JSON.stringify(remoteWorkspace.examPackages));
      }
      if (Array.isArray(remoteWorkspace.studentAttendance)) {
        studentAttendanceRef.current = remoteWorkspace.studentAttendance;
        setStudentAttendance(remoteWorkspace.studentAttendance);
        localStorage.setItem(
          'bw_student_attendance',
          JSON.stringify(remoteWorkspace.studentAttendance)
        );
      }
      if (Array.isArray(remoteWorkspace.teacherAttendance)) {
        teacherAttendanceRef.current = remoteWorkspace.teacherAttendance;
        setTeacherAttendance(remoteWorkspace.teacherAttendance);
        localStorage.setItem(
          'bw_teacher_attendance',
          JSON.stringify(remoteWorkspace.teacherAttendance)
        );
      }
      if (Array.isArray(remoteWorkspace.teachingAssignments)) {
        teachingAssignmentsRef.current = remoteWorkspace.teachingAssignments;
        setTeachingAssignments(remoteWorkspace.teachingAssignments);
        localStorage.setItem(
          'bw_teaching_assignments',
          JSON.stringify(remoteWorkspace.teachingAssignments)
        );
      }
    }

    setSiteSettings((prev) => {
      const nextSite: SiteSettings = {
        ...prev,
        ...siteExtra,
        appName: String(d.appName || prev.appName),
        schoolName: String(d.schoolName || prev.schoolName),
        subHeader: String(d.subHeader ?? prev.subHeader),
        announcement: String(d.announcement ?? prev.announcement),
        enableTahfidz: Boolean(d.enableTahfidz ?? prev.enableTahfidz),
        enableBankSoal: Boolean(d.enableBankSoal ?? prev.enableBankSoal),
        customLogoUrl: String(d.customLogoUrl || prev.customLogoUrl || ''),
      };
      siteSettingsRef.current = nextSite;
      localStorage.setItem('bw_site_settings', JSON.stringify(nextSite));
      return nextSite;
    });

    setThemeSettings((prev) => {
      const nextTheme: ThemeSettings = normalizeThemeSettings({
        ...INITIAL_THEME_SETTINGS,
        ...prev,
        ...themeExtra,
        colorTheme:
          (themeExtra.colorTheme as ThemeSettings['colorTheme']) ||
          (d.colorTheme as ThemeSettings['colorTheme']) ||
          prev.colorTheme,
        layout:
          (themeExtra.layout as ThemeSettings['layout']) ||
          (d.layout as ThemeSettings['layout']) ||
          prev.layout,
        contentWidth:
          (themeExtra.contentWidth as ThemeSettings['contentWidth']) ||
          (d.contentWidth as ThemeSettings['contentWidth']) ||
          prev.contentWidth,
        density:
          (themeExtra.density as ThemeSettings['density']) ||
          (d.density as ThemeSettings['density']) ||
          prev.density,
        borderRadius:
          (themeExtra.borderRadius as ThemeSettings['borderRadius']) ||
          (d.borderRadius as ThemeSettings['borderRadius']) ||
          prev.borderRadius,
        showAnnouncement: Boolean(
          themeExtra.showAnnouncement ?? d.showAnnouncement ?? prev.showAnnouncement
        ),
        accentSaturation:
          (themeExtra.accentSaturation as ThemeSettings['accentSaturation']) ||
          (d.accentSaturation as ThemeSettings['accentSaturation']) ||
          prev.accentSaturation,
        headerStyle:
          (themeExtra.headerStyle as ThemeSettings['headerStyle']) ||
          (d.headerStyle as ThemeSettings['headerStyle']) ||
          prev.headerStyle,
        sidebarStyle:
          (themeExtra.sidebarStyle as ThemeSettings['sidebarStyle']) ||
          (d.sidebarStyle as ThemeSettings['sidebarStyle']) ||
          prev.sidebarStyle,
        logoIconType:
          (themeExtra.logoIconType as ThemeSettings['logoIconType']) ||
          (d.logoIconType as ThemeSettings['logoIconType']) ||
          prev.logoIconType,
        customLogoUrl: String(
          d.customLogoUrl ?? themeExtra.customLogoUrl ?? prev.customLogoUrl ?? ''
        ),
        heroBannerStyle:
          (themeExtra.heroBannerStyle as ThemeSettings['heroBannerStyle']) ||
          prev.heroBannerStyle ||
          'gradient_brand',
        heroBannerHeight:
          (themeExtra.heroBannerHeight as ThemeSettings['heroBannerHeight']) ||
          prev.heroBannerHeight ||
          'standard',
        statsCardStyle:
          (themeExtra.statsCardStyle as ThemeSettings['statsCardStyle']) ||
          prev.statsCardStyle ||
          'modern_elevated',
      });

      const remoteSurface = nextTheme.surfaceMode || 'light';
      if (
        lastRemoteSurfaceModeRef.current !== null &&
        lastRemoteSurfaceModeRef.current !== remoteSurface
      ) {
        clearDeviceDarkOverride();
      }
      lastRemoteSurfaceModeRef.current = remoteSurface;

      const effectiveDark = isDarkSurfaceMode(nextTheme, deviceDarkOverrideRef.current);
      themeSettingsRef.current = nextTheme;
      localStorage.setItem('bw_theme_settings', JSON.stringify(nextTheme));
      applyThemeCssVariables(nextTheme, effectiveDark);
      return nextTheme;
    });
    setIsCloudSynced(true);
    markSynced();
  };

  // Debounced or immediate unified school_configs & workspace sync across all users
  const scheduleSchoolConfigSync = (immediate = false) => {
    refreshGlobalDatabaseCache();
    if (isFirestoreQuotaExhausted()) return;
    const writeTs = Date.now();
    lastLocalConfigWriteRef.current = writeTs;
    if (configSyncTimerRef.current) {
      clearTimeout(configSyncTimerRef.current);
      configSyncTimerRef.current = null;
    }

    const executeSync = async () => {
      if (isFirestoreQuotaExhausted()) return;
      refreshGlobalDatabaseCache();
      const uid = auth.currentUser?.uid || 'superadmin_global';
      const syncTs = Date.now();
      lastLocalConfigWriteRef.current = syncTs;
      try {
        setIsSyncing(true);
        await syncSchoolConfigToFirestore(
          uid,
          siteSettingsRef.current,
          themeSettingsRef.current,
          academicYearRef.current,
          syncTs
        );
        setIsCloudSynced(true);
        markSynced();
      } finally {
        setIsSyncing(false);
      }
    };

    if (immediate) {
      configSyncTimerRef.current = setTimeout(executeSync, 40);
    } else {
      configSyncTimerRef.current = setTimeout(executeSync, 280);
    }
  };

  // Ensure parent Class, Subject, and Student exist in Firestore before writing child documents (Pillar 1 Master Gate)
  const ensureParentsInFirestore = async (
    uid: string,
    refs: { classId?: number; subjectId?: number; studentId?: number }
  ) => {
    if (isFirestoreQuotaExhausted()) return;
    const tasks: Promise<void>[] = [];

    if (refs.classId) {
      const key = `cls_${uid}_${refs.classId}`;
      if (!verifiedParentDocsRef.current.has(key)) {
        const clsObj = classesRef.current.find((c) => c.id === refs.classId);
        if (clsObj) {
          verifiedParentDocsRef.current.add(key);
          tasks.push(syncClassToFirestore(uid, clsObj));
        }
      }
    }

    if (refs.subjectId) {
      const key = `sub_${uid}_${refs.subjectId}`;
      if (!verifiedParentDocsRef.current.has(key)) {
        const subObj = subjectsRef.current.find((s) => s.id === refs.subjectId);
        if (subObj) {
          verifiedParentDocsRef.current.add(key);
          tasks.push(syncSubjectToFirestore(uid, subObj));
        }
      }
    }

    if (timestampsOrStudentCheck(refs.studentId)) {
      const stId = refs.studentId!;
      const stObj = studentsRef.current.find((s) => s.id === stId);
      if (stObj) {
        const clsKey = `cls_${uid}_${stObj.classId}`;
        if (!verifiedParentDocsRef.current.has(clsKey)) {
          const clsObj = classesRef.current.find((c) => c.id === stObj.classId);
          if (clsObj) {
            verifiedParentDocsRef.current.add(clsKey);
            await syncClassToFirestore(uid, clsObj);
          }
        }
        const stKey = `std_${uid}_${stId}`;
        if (!verifiedParentDocsRef.current.has(stKey)) {
          verifiedParentDocsRef.current.add(stKey);
          tasks.push(syncStudentToFirestore(uid, stObj));
        }
      }
    }

    if (tasks.length > 0) {
      await Promise.all(tasks);
    }
  };

  function timestampsOrStudentCheck(studentId?: number): boolean {
    return typeof studentId === 'number' && studentId > 0;
  }

  // Sync to localStorage as fast local cache & close theme modal / superadmin tab if not superadmin
  useEffect(() => {
    if (currentUser) {
      // Strictly sanitize role if user is not an authorized & verified Superadmin
      if (
        (currentUser.role === 'superadmin' || currentUser.username === 'superadmin') &&
        !isSuperAdminUser(currentUser)
      ) {
        localStorage.removeItem(SUPERADMIN_VERIFIED_TOKEN_KEY);
        const sanitizedUser = normalizeUserRecord({
          ...INITIAL_USER,
          role: 'guru',
        });
        currentUserRef.current = sanitizedUser;
        setCurrentUser(sanitizedUser);
        return;
      }

      localStorage.setItem('bw_user', JSON.stringify(currentUser));
      if (!isSuperAdminUser(currentUser)) {
        setIsThemeModalOpen(false);
        setManageTab((prev) => (prev === 'superadmin' ? 'subjects' : prev));
      }
    } else {
      localStorage.removeItem('bw_user');
      setIsThemeModalOpen(false);
    }
  }, [currentUser]);

  // Cross-tab instant synchronization via storage event for all tables
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        switch (e.key) {
          case 'bw_theme_settings': {
            const parsedTheme = normalizeThemeSettings(JSON.parse(e.newValue) as ThemeSettings);
            themeSettingsRef.current = parsedTheme;
            applyThemeCssVariables(
              parsedTheme,
              isDarkSurfaceMode(parsedTheme, deviceDarkOverrideRef.current)
            );
            setThemeSettings(parsedTheme);
            break;
          }
          case 'bw_site_settings': {
            const parsedSite = JSON.parse(e.newValue) as SiteSettings;
            siteSettingsRef.current = parsedSite;
            setSiteSettings(parsedSite);
            break;
          }
          case 'bw_users_list': {
            const parsedUsers = normalizeUsersList(
              JSON.parse(e.newValue) as User[],
              INITIAL_USERS,
              deletedUsernamesRef.current
            );
            usersRef.current = parsedUsers;
            setUsers(parsedUsers);
            break;
          }
          case 'bw_user_passwords': {
            const parsedPasswords = JSON.parse(e.newValue) as Record<string, string>;
            userPasswordsRef.current = parsedPasswords;
            setUserPasswords(parsedPasswords);
            break;
          }
          case 'bw_classes': {
            const parsed = JSON.parse(e.newValue) as ClassRoom[];
            classesRef.current = parsed;
            setClasses(parsed);
            break;
          }
          case 'bw_subjects': {
            const parsed = JSON.parse(e.newValue) as Subject[];
            subjectsRef.current = parsed;
            setSubjects(parsed);
            break;
          }
          case 'bw_students': {
            const parsed = JSON.parse(e.newValue) as Student[];
            studentsRef.current = parsed;
            setStudents(parsed);
            break;
          }
          case 'bw_grades': {
            const parsed = JSON.parse(e.newValue) as Grade[];
            gradesRef.current = parsed;
            setGrades(parsed);
            break;
          }
          case 'bw_tahfidz': {
            const parsed = JSON.parse(e.newValue) as TahfidzGrade[];
            tahfidzGradesRef.current = parsed;
            setTahfidzGrades(parsed);
            break;
          }
          case 'bw_report_cards': {
            const parsed = JSON.parse(e.newValue) as ReportCardRecord[];
            reportCardsRef.current = parsed;
            setReportCards(parsed);
            break;
          }
          case 'bw_exam_files': {
            const parsed = JSON.parse(e.newValue) as ExamFile[];
            examFilesRef.current = parsed;
            setExamFiles(parsed);
            break;
          }
          case 'bw_exam_packages': {
            const parsed = JSON.parse(e.newValue) as ExamQuestionsPackage[];
            examPackagesRef.current = parsed;
            setExamPackages(parsed);
            break;
          }
          case 'bw_student_attendance': {
            setStudentAttendance(JSON.parse(e.newValue) as StudentAttendanceRecord[]);
            break;
          }
          case 'bw_teacher_attendance': {
            setTeacherAttendance(JSON.parse(e.newValue) as TeacherAttendanceRecord[]);
            break;
          }
          case 'bw_teaching_assignments': {
            setTeachingAssignments(JSON.parse(e.newValue) as TeachingAssignment[]);
            break;
          }
        }
      } catch {
        // Ignore malformed JSON
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Reconcile /users collection snapshot documents into unified users state
  const reconcileUsersCollectionDocs = (
    docs: Array<{ id: string; data: () => Record<string, any> }>,
    syncBackToGlobal = false
  ) => {
    if (!docs || docs.length === 0) return;
    const effectiveUid = auth.currentUser?.uid || 'global_registry';
    const deletedSet = new Set(
      deletedUsernamesRef.current.map((u) => String(u || '').toLowerCase().trim()).filter(Boolean)
    );
    const validUsers: User[] = [];

    docs.forEach((docSnap) => {
      markDocKnownInFirestore('users', docSnap.id);
      const d = docSnap.data();
      const username = String(d.username || '')
        .toLowerCase()
        .trim();
      const email = String(d.email || '')
        .toLowerCase()
        .trim();
      if (!username) return;

      // If this document belongs to a deleted account, purge it from Firestore /users immediately and skip
      if (
        username !== 'superadmin' &&
        (deletedSet.has(username) || (email && deletedSet.has(email)))
      ) {
        if (!isFirestoreQuotaExhausted()) {
          deleteFirestoreDoc('users', docSnap.id).catch(() => {});
        }
        return;
      }

      const cleanId = normalizeUserId(String(d.docId || docSnap.id), username);
      const mapped = normalizeUserRecord({
        id: cleanId,
        username,
        fullName: String(d.fullName || username),
        email: String(d.email || ''),
        avatarUrl: String(
          d.avatarUrl || '/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg'
        ),
        role: (d.StaffRole as User['role']) || 'guru',
        joinedDate: String(d.joinedDate || new Date().toLocaleDateString('id-ID')),
      });

      if (isCorruptedUserDocId(effectiveUid, docSnap.id, mapped) && !isFirestoreQuotaExhausted()) {
        deleteFirestoreDoc('users', docSnap.id).catch(() => {});
        syncUserProfileToFirestore(effectiveUid, mapped).catch(() => {});
      }
      validUsers.push(mapped);
    });

    if (validUsers.length === 0) return;

    const prevCount = usersRef.current.length;
    const merged = mergeUserLists(
      [INITIAL_USERS, validUsers, usersRef.current],
      deletedUsernamesRef.current
    );
    usersRef.current = merged;
    setUsers(merged);
    localStorage.setItem('bw_users_list', JSON.stringify(merged));
    refreshGlobalDatabaseCache(merged);
    setIsCloudSynced(true);
    markSynced();

    if ((syncBackToGlobal || merged.length > prevCount) && !isFirestoreQuotaExhausted()) {
      syncSchoolConfigToFirestore(
        effectiveUid,
        siteSettingsRef.current,
        themeSettingsRef.current,
        academicYearRef.current,
        Date.now(),
        { users: merged }
      ).catch(() => {});
    }
  };

  // Global real-time theme, accounts & school config listener for ALL users (including local Superadmin & educators)
  useEffect(() => {
    refreshGlobalDatabaseCache();
    const globalConfigRef = doc(db, 'school_configs', GLOBAL_SCHOOL_CONFIG_DOC_ID);
    const usersColRef = collection(db, 'users');
    let globalConfigReady = false;

    // Validate connection to Firestore server on boot & immediately load global config + all /users accounts
    const verifyAndFetchGlobalConfig = async () => {
      try {
        const snap = await getDocFromServer(globalConfigRef);
        if (snap.exists()) {
          markDocKnownInFirestore('school_configs', GLOBAL_SCHOOL_CONFIG_DOC_ID);
          applyRemoteSchoolConfig(snap.data());
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error('Please check your Firebase configuration.');
        }
        try {
          const cachedSnap = await getDoc(globalConfigRef);
          if (cachedSnap.exists()) {
            markDocKnownInFirestore('school_configs', GLOBAL_SCHOOL_CONFIG_DOC_ID);
            applyRemoteSchoolConfig(cachedSnap.data());
          }
        } catch {
          // Ignore fallback read error
        }
      } finally {
        globalConfigReady = true;
      }

      try {
        const usersSnap = await getDocs(usersColRef);
        if (!usersSnap.empty) {
          reconcileUsersCollectionDocs(usersSnap.docs, true);
        }
      } catch {
        // Ignore if offline
      }
    };
    verifyAndFetchGlobalConfig();

    const unsubscribeGlobal = onSnapshot(
      globalConfigRef,
      (snap) => {
        globalConfigReady = true;
        hasHydratedGlobalConfigRef.current = true;
        if (snap.exists()) {
          markDocKnownInFirestore('school_configs', GLOBAL_SCHOOL_CONFIG_DOC_ID);
          if (snap.metadata.hasPendingWrites) {
            return;
          }
          const data = snap.data();
          const parsedExt = parseExtendedSchoolConfig(data);
          if (
            parsedExt.updatedAtMs > 0 &&
            parsedExt.updatedAtMs === lastLocalConfigWriteRef.current
          ) {
            return;
          }
          if (Date.now() - lastLocalConfigWriteRef.current < 600) {
            return;
          }
          applyRemoteSchoolConfig(data);
        } else if (!isFirestoreQuotaExhausted()) {
          refreshGlobalDatabaseCache();
          syncSchoolConfigToFirestore(
            auth.currentUser?.uid || 'superadmin_global',
            siteSettingsRef.current,
            themeSettingsRef.current,
            academicYearRef.current
          ).catch(() => {});
        }
      },
      () => {
        // Ignore read error if offline or rules not yet propagated
      }
    );

    const unsubscribeAllUsers = onSnapshot(
      usersColRef,
      (snap) => {
        if (globalConfigReady && !snap.empty) {
          reconcileUsersCollectionDocs(snap.docs, false);
        }
      },
      () => {
        // Ignore if rules are still propagating
      }
    );

    const pullLatestFromServerIfChanged = async () => {
      if (Date.now() - lastLocalConfigWriteRef.current < 1200) return;
      try {
        const snap = await getDocFromServer(globalConfigRef);
        if (snap.exists()) {
          markDocKnownInFirestore('school_configs', GLOBAL_SCHOOL_CONFIG_DOC_ID);
          const data = snap.data();
          const parsedExt = parseExtendedSchoolConfig(data);
          if (
            parsedExt.updatedAtMs > 0 &&
            parsedExt.updatedAtMs !== lastLocalConfigWriteRef.current &&
            parsedExt.updatedAtMs >= lastAppliedRemoteUpdateRef.current
          ) {
            applyRemoteSchoolConfig(data);
          }
        }
      } catch {
        // Ignore if offline
      }
    };

    const handleVisibilityOrFocus = () => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        pullLatestFromServerIfChanged();
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    const pollInterval = setInterval(pullLatestFromServerIfChanged, 10000);

    return () => {
      unsubscribeGlobal();
      unsubscribeAllUsers();
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      clearInterval(pollInterval);
    };
  }, []);

  const recordDatabaseMutation = () => {
    refreshGlobalDatabaseCache();
    setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
  };

  useEffect(() => {
    localStorage.setItem('bw_users_list', JSON.stringify(users));
    recordDatabaseMutation();
  }, [users]);

  useEffect(() => {
    localStorage.setItem('bw_user_passwords', JSON.stringify(userPasswords));
    refreshGlobalDatabaseCache();
  }, [userPasswords]);

  useEffect(() => {
    localStorage.setItem('bw_deleted_usernames', JSON.stringify(deletedUsernames));
    refreshGlobalDatabaseCache();
  }, [deletedUsernames]);

  useEffect(() => {
    localStorage.setItem('bw_site_settings', JSON.stringify(siteSettings));
    if (typeof document !== 'undefined') {
      document.title = `${siteSettings.appName} — ${siteSettings.schoolName}`;
    }
    recordDatabaseMutation();
  }, [siteSettings]);

  useEffect(() => {
    localStorage.setItem('bw_theme_settings', JSON.stringify(themeSettings));
    applyThemeCssVariables(themeSettings, isDeviceDarkMode);
    recordDatabaseMutation();
  }, [themeSettings, isDeviceDarkMode]);

  useEffect(() => {
    localStorage.setItem('bw_report_cards', JSON.stringify(reportCards));
    recordDatabaseMutation();
  }, [reportCards]);

  useEffect(() => {
    localStorage.setItem('bw_subjects', JSON.stringify(subjects));
    recordDatabaseMutation();
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('bw_classes', JSON.stringify(classes));
    recordDatabaseMutation();
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('bw_students', JSON.stringify(students));
    recordDatabaseMutation();
  }, [students]);

  useEffect(() => {
    localStorage.setItem('bw_grades', JSON.stringify(grades));
    recordDatabaseMutation();
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('bw_tahfidz', JSON.stringify(tahfidzGrades));
    recordDatabaseMutation();
  }, [tahfidzGrades]);

  useEffect(() => {
    localStorage.setItem('bw_exam_files', JSON.stringify(examFiles));
    recordDatabaseMutation();
  }, [examFiles]);

  useEffect(() => {
    localStorage.setItem('bw_exam_packages', JSON.stringify(examPackages));
    recordDatabaseMutation();
  }, [examPackages]);

  useEffect(() => {
    localStorage.setItem('bw_student_attendance', JSON.stringify(studentAttendance));
    recordDatabaseMutation();
  }, [studentAttendance]);

  useEffect(() => {
    localStorage.setItem('bw_teacher_attendance', JSON.stringify(teacherAttendance));
    recordDatabaseMutation();
  }, [teacherAttendance]);

  useEffect(() => {
    localStorage.setItem('bw_teaching_assignments', JSON.stringify(teachingAssignments));
    recordDatabaseMutation();
  }, [teachingAssignments]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => {
      const deduplicated = prev.filter((t) => t.message !== message);
      return [...deduplicated.slice(-1), { id, type, message }];
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // =========================================================
  // 1. Firebase Auth State Listener
  // =========================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      setIsAuthReady(true);

      if (fbUser) {
        const email = (fbUser.email || 'pendidik@baiturrahman.sch.id').toLowerCase().trim();
        const isBootstrappedAdmin = fbUser.emailVerified && isAuthorizedSuperAdminEmail(email);
        const rawPrefix = email
          .split('@')[0]
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '')
          .slice(0, 20);
        const deletedSet = new Set(
          deletedUsernamesRef.current.map((u) => String(u || '').toLowerCase().trim())
        );

        // If this Google account was deleted by Super Admin, do not auto-login or restore old profile
        if (
          !isBootstrappedAdmin &&
          (deletedSet.has(email) || (rawPrefix && deletedSet.has(rawPrefix)))
        ) {
          currentUserRef.current = null;
          setCurrentUser(null);
          localStorage.removeItem('bw_user');
          localStorage.setItem('bw_explicit_logout', '1');
          signOut(auth).catch(() => {});
          return;
        }

        if (localStorage.getItem('bw_explicit_logout') === '1') {
          return;
        }

        if (isBootstrappedAdmin) {
          localStorage.setItem(SUPERADMIN_VERIFIED_TOKEN_KEY, SUPERADMIN_VERIFIED_TOKEN_VALUE);
        }

        // Build & register the Google user account in the global users list so it appears in Superadmin
        const googleUserRecord = buildGoogleUserRecord(
          fbUser,
          usersRef.current,
          isBootstrappedAdmin ? 'admin' : 'guru'
        );

        const mergedUsers = mergeUserLists(
          [INITIAL_USERS, usersRef.current, [googleUserRecord]],
          deletedUsernamesRef.current
        );
        usersRef.current = mergedUsers;
        setUsers(mergedUsers);
        localStorage.setItem('bw_users_list', JSON.stringify(mergedUsers));
        syncAccountsToDatabase(mergedUsers, googleUserRecord);

        setCurrentUser((prev) => {
          if (prev) {
            if (prev.role === 'superadmin' && !isSuperAdminUser(prev)) {
              localStorage.removeItem(SUPERADMIN_VERIFIED_TOKEN_KEY);
              return INITIAL_USER;
            }
            return prev;
          }
          if (isBootstrappedAdmin) {
            return SUPERADMIN_USER;
          }
          return googleUserRecord;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // =========================================================
  // 2. Real-Time Firestore Listeners (onSnapshot)
  // =========================================================
  useEffect(() => {
    if (!isAuthReady || !firebaseUser || !firebaseUser.emailVerified) {
      return;
    }

    const uid = firebaseUser.uid;
    const isFirebaseSuperAdmin = isAuthorizedSuperAdminEmail(firebaseUser.email);
    let isCancelled = false;
    let hasCheckedInitialSeed = false;
    let hasSyncedAllAccounts = false;
    const unsubscribes: Array<() => void> = [];
    const questionUnsubscribes = new Map<string, () => void>();

    const handleUsersDocsSnapshot = (docs: Array<{ id: string; data: () => Record<string, any> }>) => {
      reconcileUsersCollectionDocs(docs, false);

      // Ensure every account in the merged list is persisted in Firestore /users and global_config
      if (!hasSyncedAllAccounts && !isFirestoreQuotaExhausted()) {
        hasSyncedAllAccounts = true;
        runInChunks(usersRef.current, 10, (u) => syncUserProfileToFirestore(uid, u))
          .then(() =>
            syncSchoolConfigToFirestore(
              uid,
              siteSettingsRef.current,
              themeSettingsRef.current,
              academicYearRef.current,
              Date.now(),
              { users: usersRef.current }
            )
          )
          .catch(() => {});
      }
    };

    const initAndSubscribe = async () => {
      try {
        setIsSyncing(true);
        await resetFirestoreQuotaState();
        if (isCancelled) return;

        // 1. school_configs listener (per-UID fallback; global_config is primary via global listener)
        unsubscribes.push(
          onSnapshot(
            query(collection(db, 'school_configs'), where('ownerId', '==', uid)),
            (snap) => {
              snap.docs.forEach((d) => markDocKnownInFirestore('school_configs', d.id));
              if (
                snap.metadata.hasPendingWrites ||
                Date.now() - lastLocalConfigWriteRef.current < 2500
              ) {
                return;
              }
              if (
                !snap.empty &&
                !isDocKnownInFirestore('school_configs', GLOBAL_SCHOOL_CONFIG_DOC_ID)
              ) {
                applyRemoteSchoolConfig(snap.docs[0].data());
              }
            },
            (err) => handleFirestoreError(err, OperationType.LIST, 'school_configs')
          )
        );

        // 2. users listener: Read entire /users collection so all registered & Google accounts are synchronized
        unsubscribes.push(
          onSnapshot(
            collection(db, 'users'),
            (snap) => {
              handleUsersDocsSnapshot(snap.docs);
            },
            (err) => handleFirestoreError(err, OperationType.LIST, 'users')
          )
        );

        // 3. classes listener (also handles initial workspace auto-seed if empty)
        unsubscribes.push(
          onSnapshot(
            query(collection(db, 'classes'), where('ownerId', '==', uid)),
            (snap) => {
              const list: ClassRoom[] = snap.docs
                .map((docSnap) => {
                  markDocKnownInFirestore('classes', docSnap.id);
                  const d = docSnap.data();
                  const numId = Number(d.id);
                  if (numId) verifiedParentDocsRef.current.add(`cls_${uid}_${numId}`);
                  return {
                    id: numId,
                    name: String(d.name),
                    teacher: String(d.teacher || ''),
                  };
                })
                .sort((a, b) => a.name.localeCompare(b.name));

              if (!hasCheckedInitialSeed) {
                hasCheckedInitialSeed = true;
                const alreadySeededFlag = localStorage.getItem(`bw_seeded_${uid}`) === '1';
                if (
                  snap.empty &&
                  !alreadySeededFlag &&
                  !seedingRef.current &&
                  !isFirestoreQuotaExhausted()
                ) {
                  seedingRef.current = true;
                  seedFullWorkspaceToFirestore(uid, {
                    siteSettings: siteSettingsRef.current,
                    themeSettings: themeSettingsRef.current,
                    academicYear: academicYearRef.current,
                    users: usersRef.current,
                    classes: classesRef.current,
                    subjects: subjectsRef.current,
                    students: studentsRef.current,
                    grades: gradesRef.current,
                    tahfidzGrades: tahfidzGradesRef.current,
                    reportCards: reportCardsRef.current,
                    examFiles: examFilesRef.current,
                    examPackages: examPackagesRef.current,
                    includeSchoolConfig:
                      isSuperAdminUser(currentUserRef.current) || isFirebaseSuperAdmin,
                    onlyIfMissing: true,
                  })
                    .then(() => {
                      localStorage.setItem(`bw_seeded_${uid}`, '1');
                      localStorage.removeItem('bw_pending_cloud_sync');
                    })
                    .catch(() => {})
                    .finally(() => {
                      seedingRef.current = false;
                      setIsSyncing(false);
                      setIsCloudSynced(true);
                      markSynced();
                    });
                } else {
                  if (!snap.empty) {
                    localStorage.setItem(`bw_seeded_${uid}`, '1');
                  }
                  setIsSyncing(false);
                  setIsCloudSynced(true);
                  markSynced();
                }
              }

              if (!hasRemoteWorkspaceRef.current && list.length > 0) {
                classesRef.current = list;
                setClasses(list);
                setIsCloudSynced(true);
                markSynced();
              }
            },
            (err) => {
              setIsSyncing(false);
              handleFirestoreError(err, OperationType.LIST, 'classes');
            }
          )
        );

        // 4. subjects listener
        unsubscribes.push(
          onSnapshot(
            query(collection(db, 'subjects'), where('ownerId', '==', uid)),
            (snap) => {
              const list: Subject[] = snap.docs
                .map((docSnap) => {
                  markDocKnownInFirestore('subjects', docSnap.id);
                  const d = docSnap.data();
                  const numId = Number(d.id);
                  if (numId) verifiedParentDocsRef.current.add(`sub_${uid}_${numId}`);
                  return {
                    id: numId,
                    name: String(d.name),
                    category: (d.category as Subject['category']) || 'Diniyah',
                  };
                })
                .sort((a, b) => a.name.localeCompare(b.name));
              if (!hasRemoteWorkspaceRef.current && list.length > 0) {
                subjectsRef.current = list;
                setSubjects(list);
                setIsCloudSynced(true);
                markSynced();
              }
            },
            (err) => handleFirestoreError(err, OperationType.LIST, 'subjects')
          )
        );

        // 5. students listener
        unsubscribes.push(
          onSnapshot(
            query(collection(db, 'students'), where('ownerId', '==', uid)),
            (snap) => {
              const list: Student[] = snap.docs
                .map((docSnap) => {
                  markDocKnownInFirestore('students', docSnap.id);
                  const d = docSnap.data();
                  const numId = Number(d.id);
                  if (numId) verifiedParentDocsRef.current.add(`std_${uid}_${numId}`);
                  return {
                    id: numId,
                    nis: String(d.nis),
                    name: String(d.name),
                    classId: Number(d.classId),
                    birthPlace: String(d.birthPlace),
                    birthDate: String(d.birthDate),
                    guardian: String(d.guardian),
                  };
                })
                .sort((a, b) => a.name.localeCompare(b.name));
              if (!hasRemoteWorkspaceRef.current && list.length > 0) {
                studentsRef.current = list;
                setStudents(list);
                setIsCloudSynced(true);
                markSynced();
              }
            },
            (err) => handleFirestoreError(err, OperationType.LIST, 'students')
          )
        );

        // 6. grades listener
        unsubscribes.push(
          onSnapshot(
            query(collection(db, 'grades'), where('ownerId', '==', uid)),
            (snap) => {
              const list: Grade[] = snap.docs.map((docSnap) => {
                markDocKnownInFirestore('grades', docSnap.id);
                const d = docSnap.data();
                return {
                  id: Number(d.id),
                  studentId: Number(d.studentId),
                  subjectId: Number(d.subjectId),
                  classId: Number(d.classId),
                  semester: Number(d.semester) === 2 ? 2 : 1,
                  score: Number(d.score),
                  testDate: String(d.testDate),
                  type: (d.type as 'regular' | 'exam') || 'regular',
                };
              });
              if (!hasRemoteWorkspaceRef.current && list.length > 0) {
                gradesRef.current = list;
                setGrades(list);
                setIsCloudSynced(true);
                markSynced();
              }
            },
            (err) => handleFirestoreError(err, OperationType.LIST, 'grades')
          )
        );

        // 7. tahfidz_grades listener
        unsubscribes.push(
          onSnapshot(
            query(collection(db, 'tahfidz_grades'), where('ownerId', '==', uid)),
            (snap) => {
              const list: TahfidzGrade[] = snap.docs.map((docSnap) => {
                markDocKnownInFirestore('tahfidz_grades', docSnap.id);
                const d = docSnap.data();
                return {
                  id: Number(d.id),
                  studentId: Number(d.studentId),
                  classId: Number(d.classId),
                  semester: Number(d.semester) === 2 ? 2 : 1,
                  tahfidzScore: Number(d.tahfidzScore),
                  tajweedScore: Number(d.tajweedScore),
                  totalScore: Number(d.totalScore),
                  gradeLetter: (d.gradeLetter as TahfidzGrade['gradeLetter']) || 'B',
                  notes: String(d.notes || ''),
                  testDate: String(d.testDate),
                };
              });
              if (!hasRemoteWorkspaceRef.current && list.length > 0) {
                tahfidzGradesRef.current = list;
                setTahfidzGrades(list);
                setIsCloudSynced(true);
                markSynced();
              }
            },
            (err) => handleFirestoreError(err, OperationType.LIST, 'tahfidz_grades')
          )
        );

        // 8. report_cards listener
        unsubscribes.push(
          onSnapshot(
            query(collection(db, 'report_cards'), where('ownerId', '==', uid)),
            (snap) => {
              const list: ReportCardRecord[] = snap.docs.map((docSnap) => {
                markDocKnownInFirestore('report_cards', docSnap.id);
                return fromFirestoreReportCard(docSnap.data());
              });
              if (!hasRemoteWorkspaceRef.current && list.length > 0) {
                reportCardsRef.current = list;
                setReportCards(list);
                setIsCloudSynced(true);
                markSynced();
              }
            },
            (err) => handleFirestoreError(err, OperationType.LIST, 'report_cards')
          )
        );

        // 9. exam_files listener
        unsubscribes.push(
          onSnapshot(
            query(collection(db, 'exam_files'), where('ownerId', '==', uid)),
            (snap) => {
              const list: ExamFile[] = snap.docs.map((docSnap) => {
                markDocKnownInFirestore('exam_files', docSnap.id);
                const d = docSnap.data();
                return {
                  id: Number(d.id),
                  subjectId: Number(d.subjectId),
                  classId: Number(d.classId),
                  title: String(d.title),
                  fileName: String(d.fileName),
                  fileSize: String(d.fileSize),
                  uploadDate: String(d.uploadDate),
                };
              });
              if (!hasRemoteWorkspaceRef.current && list.length > 0) {
                examFilesRef.current = list;
                setExamFiles(list);
                setIsCloudSynced(true);
                markSynced();
              }
            },
            (err) => handleFirestoreError(err, OperationType.LIST, 'exam_files')
          )
        );

        // 10. exam_packages + questions subcollection listener
        unsubscribes.push(
          onSnapshot(
            query(collection(db, 'exam_packages'), where('ownerId', '==', uid)),
            (snap) => {
              const activeDocIds = new Set<string>();

              snap.docs.forEach((docSnap) => {
                markDocKnownInFirestore('exam_packages', docSnap.id);
                const d = docSnap.data();
                const pkgDocId = docSnap.id;
                const pkgId = Number(d.id);
                activeDocIds.add(pkgDocId);

                if (!hasRemoteWorkspaceRef.current) {
                  setExamPackages((prev) => {
                    const existingPkg = prev.find((p) => p.id === pkgId);
                    const basePkg: ExamQuestionsPackage = {
                      id: pkgId,
                      subjectId: Number(d.subjectId),
                      classId: Number(d.classId),
                      type: d.type === 'multiple_choice' ? 'multiple_choice' : 'essay',
                      createdAt: String(d.packageDate || ''),
                      questions: existingPkg?.questions || [],
                    };
                    if (existingPkg) {
                      return prev.map((p) => (p.id === pkgId ? basePkg : p));
                    }
                    return [basePkg, ...prev];
                  });
                }

                // Attach subcollection listener for questions if not yet attached
                if (!questionUnsubscribes.has(pkgDocId)) {
                  const qPath = `exam_packages/${pkgDocId}/questions`;
                  const qUnsub = onSnapshot(
                    query(collection(db, qPath), where('ownerId', '==', uid)),
                    (qSnap) => {
                      const questions: QuestionItem[] = qSnap.docs
                        .map((qd) => {
                          markDocKnownInFirestore(qPath, qd.id);
                          const qData = qd.data();
                          return {
                            id: Number(qData.id),
                            text: String(qData.text),
                            optionA: qData.optionA ? String(qData.optionA) : undefined,
                            optionB: qData.optionB ? String(qData.optionB) : undefined,
                            optionC: qData.optionC ? String(qData.optionC) : undefined,
                            optionD: qData.optionD ? String(qData.optionD) : undefined,
                            correctAnswer: qData.correctAnswer
                              ? (String(qData.correctAnswer) as 'A' | 'B' | 'C' | 'D')
                              : undefined,
                          };
                        })
                        .sort((a, b) => a.id - b.id);

                      if (!hasRemoteWorkspaceRef.current && questions.length > 0) {
                        setExamPackages((prev) =>
                          prev.map((p) => (p.id === pkgId ? { ...p, questions } : p))
                        );
                      }
                      markSynced();
                    },
                    (err) => handleFirestoreError(err, OperationType.LIST, qPath)
                  );
                  questionUnsubscribes.set(pkgDocId, qUnsub);
                }
              });

              questionUnsubscribes.forEach((unsubFn, docIdKey) => {
                if (!activeDocIds.has(docIdKey)) {
                  unsubFn();
                  questionUnsubscribes.delete(docIdKey);
                }
              });
              setIsCloudSynced(true);
              markSynced();
            },
            (err) => handleFirestoreError(err, OperationType.LIST, 'exam_packages')
          )
        );
      } catch (err) {
        setIsSyncing(false);
        handleFirestoreError(err, OperationType.LIST, 'classes');
      }
    };

    initAndSubscribe();

    return () => {
      isCancelled = true;
      unsubscribes.forEach((u) => u());
      questionUnsubscribes.forEach((u) => u());
      questionUnsubscribes.clear();
    };
  }, [isAuthReady, firebaseUser]);

  // =========================================================
  // Cloud Connection & Force Sync Helpers
  // =========================================================

  const connectGoogleCloudSync = async (isFromLoginScreen = false): Promise<boolean> => {
    try {
      setIsSyncing(true);
      await resetFirestoreQuotaState();
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const email = (fbUser.email || 'pendidik@baiturrahman.sch.id').toLowerCase().trim();
      const isBootstrappedAdmin = fbUser.emailVerified && isAuthorizedSuperAdminEmail(email);

      // Pull latest global_config accounts, workspace (grades, tahfidz, reportCards) & deletedUsernames first
      try {
        const globalSnap = await getDocFromServer(
          doc(db, 'school_configs', GLOBAL_SCHOOL_CONFIG_DOC_ID)
        );
        if (globalSnap.exists()) {
          markDocKnownInFirestore('school_configs', GLOBAL_SCHOOL_CONFIG_DOC_ID);
          applyRemoteSchoolConfig(globalSnap.data());
        }
        hasHydratedGlobalConfigRef.current = true;
      } catch {
        // Ignore if offline
      }

      // If logging in from AuthView via Google, ONLY authorized Superadmin emails can access superadmin!
      const keepExistingSuperAdmin =
        !isFromLoginScreen && isSuperAdminUser(currentUserRef.current) && isBootstrappedAdmin;
      const grantSuperAdmin = isBootstrappedAdmin || keepExistingSuperAdmin;

      const rawPrefix = email
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 20);
      const deletedSet = new Set(
        deletedUsernamesRef.current.map((u) => String(u || '').toLowerCase().trim())
      );
      const wasPreviouslyDeleted =
        !grantSuperAdmin &&
        (deletedSet.has(email) || (rawPrefix && deletedSet.has(rawPrefix)));

      // If this Google account was previously deleted by Super Admin, reset its profile completely by passing [] as existingUsers
      const googleUserRecord = buildGoogleUserRecord(
        fbUser,
        wasPreviouslyDeleted ? [] : usersRef.current,
        grantSuperAdmin ? 'admin' : 'guru'
      );

      const cleanGoogleUsername = googleUserRecord.username.toLowerCase().trim();
      if (wasPreviouslyDeleted) {
        // Wipe any old password associated with the reset account
        if (cleanGoogleUsername in userPasswordsRef.current) {
          const nextPass = { ...userPasswordsRef.current };
          delete nextPass[cleanGoogleUsername];
          userPasswordsRef.current = nextPass;
          setUserPasswords(nextPass);
          localStorage.setItem('bw_user_passwords', JSON.stringify(nextPass));
        }
      }

      // Ensure this Google username & email are removed from deletedUsernames since a fresh profile is now created
      const nextDeleted = deletedUsernamesRef.current.filter(
        (u) => u !== cleanGoogleUsername && u !== email
      );
      if (nextDeleted.length !== deletedUsernamesRef.current.length) {
        deletedUsernamesRef.current = nextDeleted;
        setDeletedUsernames(nextDeleted);
        localStorage.setItem('bw_deleted_usernames', JSON.stringify(nextDeleted));
      }

      let targetUser: User;
      if (grantSuperAdmin) {
        localStorage.setItem(SUPERADMIN_VERIFIED_TOKEN_KEY, SUPERADMIN_VERIFIED_TOKEN_VALUE);
        const existingSuper =
          usersRef.current.find((u) => u.username === 'superadmin') || SUPERADMIN_USER;
        targetUser = normalizeUserRecord({
          ...existingSuper,
          id: 'usr-superadmin',
          username: 'superadmin',
          email,
          role: 'superadmin',
        });
      } else {
        localStorage.removeItem(SUPERADMIN_VERIFIED_TOKEN_KEY);
        targetUser = googleUserRecord;
      }

      const baseUsersForMerge = wasPreviouslyDeleted
        ? usersRef.current.filter(
            (u) =>
              u.username.toLowerCase().trim() !== cleanGoogleUsername &&
              u.email?.toLowerCase().trim() !== email
          )
        : usersRef.current;
      const baseInitialForMerge = wasPreviouslyDeleted
        ? INITIAL_USERS.filter(
            (u) =>
              u.username.toLowerCase().trim() !== cleanGoogleUsername &&
              u.email?.toLowerCase().trim() !== email
          )
        : INITIAL_USERS;

      const nextUsers = mergeUserLists(
        [baseInitialForMerge, baseUsersForMerge, [googleUserRecord, targetUser]],
        nextDeleted
      );
      usersRef.current = nextUsers;
      setUsers(nextUsers);
      localStorage.setItem('bw_users_list', JSON.stringify(nextUsers));

      localStorage.removeItem('bw_explicit_logout');
      currentUserRef.current = targetUser;
      setCurrentUser(targetUser);

      // Reconcile all accounts (including this Google account) with Firestore /users AND global_config immediately
      refreshGlobalDatabaseCache(nextUsers, nextDeleted);
      lastLocalConfigWriteRef.current = Date.now();
      await Promise.all([
        runInChunks(nextUsers, 10, (u) => syncUserProfileToFirestore(fbUser.uid, u)).catch(
          () => {}
        ),
        syncSchoolConfigToFirestore(
          fbUser.uid,
          siteSettingsRef.current,
          themeSettingsRef.current,
          academicYearRef.current,
          Date.now(),
          {
            users: nextUsers,
            deletedUsernames: nextDeleted,
          }
        ).catch(() => {}),
      ]);

      setIsSyncing(false);
      setIsCloudSynced(true);
      markSynced();
      showToast(
        grantSuperAdmin
          ? `Login Super Admin & Sinkronisasi Cloud aktif (${email})`
          : `Akun Google (@${googleUserRecord.username} · ${email}) berhasil masuk & tersinkron ke Database!`,
        'success'
      );
      return true;
    } catch (err: any) {
      setIsSyncing(false);
      if (err?.code !== 'auth/popup-closed-by-user') {
        showToast('Gagal menghubungkan Google Auth: ' + (err?.message || 'Error'), 'error');
      }
      return false;
    }
  };

  const forceSyncAllToCloud = async (): Promise<void> => {
    try {
      setIsSyncing(true);
      await resetFirestoreQuotaState();
      refreshGlobalDatabaseCache();
      const uid = auth.currentUser?.uid || 'superadmin_global';

      // 1. Fetch latest global_config and /users collection first so no remote/Google account is missed
      const remoteConfigUsers: User[] = [];
      const remoteColUsers: User[] = [];
      try {
        const [globalSnap, usersSnap] = await Promise.all([
          getDocFromServer(doc(db, 'school_configs', GLOBAL_SCHOOL_CONFIG_DOC_ID)).catch(() => null),
          getDocs(collection(db, 'users')).catch(() => null),
        ]);
        if (globalSnap && globalSnap.exists()) {
          markDocKnownInFirestore('school_configs', GLOBAL_SCHOOL_CONFIG_DOC_ID);
          const parsedExt = parseExtendedSchoolConfig(globalSnap.data());
          if (Array.isArray(parsedExt.users)) {
            remoteConfigUsers.push(...parsedExt.users);
          }
        }
        if (usersSnap && !usersSnap.empty) {
          usersSnap.docs.forEach((docSnap) => {
            markDocKnownInFirestore('users', docSnap.id);
            const d = docSnap.data();
            const username = String(d.username || '').toLowerCase().trim();
            if (!username) return;
            remoteColUsers.push(
              normalizeUserRecord({
                id: normalizeUserId(String(d.docId || docSnap.id), username),
                username,
                fullName: String(d.fullName || username),
                email: String(d.email || ''),
                avatarUrl: String(
                  d.avatarUrl || '/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg'
                ),
                role: (d.StaffRole as User['role']) || 'guru',
                joinedDate: String(d.joinedDate || new Date().toLocaleDateString('id-ID')),
              })
            );
          });
        }
      } catch {
        // Proceed with local state if offline
      }

      const merged = mergeUserLists(
        [INITIAL_USERS, remoteColUsers, remoteConfigUsers, usersRef.current],
        deletedUsernamesRef.current
      );
      usersRef.current = merged;
      setUsers(merged);
      localStorage.setItem('bw_users_list', JSON.stringify(merged));
      refreshGlobalDatabaseCache(merged);

      // 2. Always sync all accounts to /users collection AND global_config (works with or without Google OAuth)
      lastLocalConfigWriteRef.current = Date.now();
      await Promise.all([
        runInChunks(merged, 10, (u) => syncUserProfileToFirestore(uid, u)).catch(() => {}),
        syncSchoolConfigToFirestore(
          uid,
          siteSettingsRef.current,
          themeSettingsRef.current,
          academicYearRef.current,
          Date.now(),
          {
            users: merged,
            deletedUsernames: deletedUsernamesRef.current,
          }
        ).catch(() => {}),
      ]);

      // 3. If authenticated with Firebase Auth, also seed individual collections
      if (auth.currentUser?.uid) {
        await seedFullWorkspaceToFirestore(auth.currentUser.uid, {
          siteSettings: siteSettingsRef.current,
          themeSettings: themeSettingsRef.current,
          academicYear: academicYearRef.current,
          users: merged,
          classes: classesRef.current,
          subjects: subjectsRef.current,
          students: studentsRef.current,
          grades: gradesRef.current,
          tahfidzGrades: tahfidzGradesRef.current,
          reportCards: reportCardsRef.current,
          examFiles: examFilesRef.current,
          examPackages: examPackagesRef.current,
          includeSchoolConfig: true,
          onlyIfMissing: false,
        }).catch(() => {});
      }

      setIsSyncing(false);
      setIsCloudSynced(true);
      markSynced();
      showToast(
        `Seluruh data & ${merged.length} akun pengguna berhasil disinkronkan ke Database!`,
        'success'
      );
    } catch {
      setIsSyncing(false);
      showToast('Gagal menyinkronkan data ke Cloud.', 'error');
    }
  };

  // =========================================================
  // Auth Functions
  // =========================================================

  const login = (username: string, password: string): { success: boolean; message?: string } => {
    const cleanUsername = username.toLowerCase().trim();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      return { success: false, message: 'Username tidak boleh kosong.' };
    }
    if (!cleanPassword) {
      return { success: false, message: 'Password tidak boleh kosong.' };
    }

    // 1. Strict Superadmin Login Gate
    if (cleanUsername === 'superadmin') {
      const expectedSuperPass = userPasswordsRef.current['superadmin'] || 'superadmin123';
      if (cleanPassword === expectedSuperPass || cleanPassword === 'superadmin123') {
        localStorage.removeItem('bw_explicit_logout');
        localStorage.setItem(SUPERADMIN_VERIFIED_TOKEN_KEY, SUPERADMIN_VERIFIED_TOKEN_VALUE);
        const superRecord =
          usersRef.current.find((u) => u.username.toLowerCase() === 'superadmin') ||
          SUPERADMIN_USER;
        const verifiedSuper = normalizeUserRecord({
          ...superRecord,
          id: 'usr-superadmin',
          username: 'superadmin',
          role: 'superadmin',
        });
        currentUserRef.current = verifiedSuper;
        setCurrentUser(verifiedSuper);
        scheduleSchoolConfigSync();
        showToast('Login berhasil sebagai Super Administrator!', 'success');
        return { success: true };
      } else {
        return {
          success: false,
          message: 'Password akun Super Admin salah. Akses Super Admin ditolak.',
        };
      }
    }

    // Block any reserved superadmin alias from logging in as superadmin
    if (isReservedSuperAdminUsername(cleanUsername)) {
      return {
        success: false,
        message: 'Username tersebut dikhususkan untuk sistem. Gunakan akun pendidik resmi.',
      };
    }

    // 2. Educator / Staff Login Gate (Must exist in database users list & NOT be deleted)
    const deletedSet = new Set(
      deletedUsernamesRef.current.map((u) => String(u || '').toLowerCase().trim())
    );
    if (deletedSet.has(cleanUsername)) {
      return {
        success: false,
        message: `Akun "${cleanUsername}" telah dihapus oleh Super Admin dan tidak dapat digunakan untuk login. Silakan daftar akun baru.`,
      };
    }

    const allKnownUsers = mergeUserLists(
      [usersRef.current, INITIAL_USERS],
      deletedUsernamesRef.current
    );
    const foundUser = allKnownUsers.find(
      (u) =>
        u.username !== 'superadmin' &&
        (u.username.toLowerCase().trim() === cleanUsername ||
          (u.email && u.email.toLowerCase().trim() === cleanUsername))
    );

    if (!foundUser) {
      return {
        success: false,
        message: `Akun "${cleanUsername}" tidak ditemukan atau telah dihapus. Silakan daftar akun baru.`,
      };
    }

    const targetUsername = foundUser.username.toLowerCase().trim();
    const targetEmail = (foundUser.email || '').toLowerCase().trim();
    if (deletedSet.has(targetUsername) || (targetEmail && deletedSet.has(targetEmail))) {
      return {
        success: false,
        message: `Akun "${cleanUsername}" telah dihapus oleh Super Admin dan tidak dapat digunakan untuk login.`,
      };
    }

    const storedPassword = userPasswordsRef.current[targetUsername] || foundUser.password;
    if (storedPassword && cleanPassword !== storedPassword) {
      return {
        success: false,
        message: 'Password yang Anda masukkan salah.',
      };
    }

    // Strictly guarantee non-superadmin accounts can NEVER receive superadmin role
    localStorage.removeItem(SUPERADMIN_VERIFIED_TOKEN_KEY);
    localStorage.removeItem('bw_explicit_logout');
    const safeUser = normalizeUserRecord({
      ...foundUser,
      role: foundUser.role === 'superadmin' ? 'guru' : foundUser.role,
    });

    currentUserRef.current = safeUser;
    setCurrentUser(safeUser);
    syncAccountsToDatabase(allKnownUsers, safeUser);
    showToast(`Selamat datang kembali, ${safeUser.fullName}!`, 'success');
    return { success: true };
  };

  const loginWithGoogle = async () => {
    await connectGoogleCloudSync(true);
  };

  const register = (username: string, fullName: string, password: string) => {
    const cleanUsername = username.toLowerCase().trim();
    const cleanFullName = fullName.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanFullName || cleanPassword.length < 6) return false;

    if (isReservedSuperAdminUsername(cleanUsername)) {
      showToast('Username tersebut tidak diizinkan. Gunakan username pendidik lain.', 'error');
      return false;
    }

    const activeUsers = mergeUserLists(
      [usersRef.current, INITIAL_USERS],
      deletedUsernamesRef.current
    );
    const existing = activeUsers.find(
      (u) => u.username.toLowerCase().trim() === cleanUsername
    );
    if (existing) {
      showToast(`Username "@${cleanUsername}" sudah terdaftar di database.`, 'error');
      return false;
    }

    const cleanDefaultEmail = `${cleanUsername}@baiturrahman.sch.id`;

    // Remove from deletedUsernames if previously deleted so new registration starts with a 100% reset profile
    const nextDeleted = deletedUsernamesRef.current.filter(
      (u) => u !== cleanUsername && u !== cleanDefaultEmail
    );
    if (nextDeleted.length !== deletedUsernamesRef.current.length) {
      deletedUsernamesRef.current = nextDeleted;
      setDeletedUsernames(nextDeleted);
      localStorage.setItem('bw_deleted_usernames', JSON.stringify(nextDeleted));
    }

    const nextPasswords = {
      ...userPasswordsRef.current,
      [cleanUsername]: cleanPassword,
    };
    userPasswordsRef.current = nextPasswords;
    setUserPasswords(nextPasswords);
    localStorage.setItem('bw_user_passwords', JSON.stringify(nextPasswords));

    const newUser = normalizeUserRecord({
      id: normalizeUserId(`usr-${cleanUsername}`, cleanUsername),
      username: cleanUsername,
      fullName: cleanFullName,
      email: cleanDefaultEmail,
      avatarUrl: '/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg',
      role: 'guru',
      joinedDate: new Date().toLocaleDateString('id-ID'),
      password: cleanPassword,
      authProvider: 'local',
    });

    // Exclude any old record for cleanUsername from INITIAL_USERS or usersRef.current so previous profile is completely reset
    const filteredInitial = INITIAL_USERS.filter(
      (u) => u.username.toLowerCase().trim() !== cleanUsername
    );
    const filteredCurrent = usersRef.current.filter(
      (u) => u.username.toLowerCase().trim() !== cleanUsername
    );

    const nextUsers = mergeUserLists(
      [filteredInitial, filteredCurrent, [newUser]],
      nextDeleted
    );
    usersRef.current = nextUsers;
    setUsers(nextUsers);
    localStorage.setItem('bw_users_list', JSON.stringify(nextUsers));

    localStorage.removeItem(SUPERADMIN_VERIFIED_TOKEN_KEY);
    localStorage.removeItem('bw_explicit_logout');
    currentUserRef.current = newUser;
    setCurrentUser(newUser);

    syncAccountsToDatabase(nextUsers, newUser, nextDeleted);
    showToast('Akun pendidik berhasil didaftarkan ke database dan berhasil masuk!', 'success');
    return true;
  };

  const forgotPassword = (username: string, newPassword: string) => {
    const cleanUsername = username.toLowerCase().trim();
    const cleanPass = newPassword.trim();
    if (!cleanUsername || cleanPass.length < 6) return false;

    if (cleanUsername === 'superadmin' || isReservedSuperAdminUsername(cleanUsername)) {
      showToast(
        'Demi keamanan, password Super Admin tidak dapat direset melalui form publik.',
        'error'
      );
      return false;
    }

    const target = usersRef.current.find(
      (u) =>
        u.username !== 'superadmin' &&
        (u.username.toLowerCase().trim() === cleanUsername ||
          (u.email && u.email.toLowerCase().trim() === cleanUsername))
    );
    if (!target) {
      showToast(`Username atau email "${cleanUsername}" tidak ditemukan di database.`, 'error');
      return false;
    }

    const targetUsername = target.username.toLowerCase().trim();
    const nextPasswords = {
      ...userPasswordsRef.current,
      [targetUsername]: cleanPass,
    };
    userPasswordsRef.current = nextPasswords;
    setUserPasswords(nextPasswords);
    localStorage.setItem('bw_user_passwords', JSON.stringify(nextPasswords));

    const updatedUser = normalizeUserRecord({ ...target, password: cleanPass });
    const nextUsers = usersRef.current.map((u) =>
      u.username.toLowerCase() === targetUsername ? updatedUser : u
    );
    usersRef.current = nextUsers;
    setUsers(nextUsers);
    localStorage.setItem('bw_users_list', JSON.stringify(nextUsers));
    syncAccountsToDatabase(nextUsers, updatedUser);

    showToast('Password berhasil diperbarui di database. Silakan login kembali.', 'success');
    return true;
  };

  const logout = () => {
    if (configSyncTimerRef.current && isSuperAdminUser(currentUserRef.current)) {
      clearTimeout(configSyncTimerRef.current);
      configSyncTimerRef.current = null;
      refreshGlobalDatabaseCache();
      const uid = auth.currentUser?.uid || 'superadmin_global';
      syncSchoolConfigToFirestore(
        uid,
        siteSettingsRef.current,
        themeSettingsRef.current,
        academicYearRef.current
      ).catch(() => {});
    }
    localStorage.removeItem(SUPERADMIN_VERIFIED_TOKEN_KEY);
    localStorage.setItem('bw_explicit_logout', '1');
    setIsThemeModalOpen(false);
    setCurrentUser(null);
    showToast('Anda telah keluar.', 'info');
  };

  const updateProfile = (fullName: string, avatarUrl?: string) => {
    if (!currentUser) return;
    const updated: User = normalizeUserRecord({
      ...currentUser,
      fullName: fullName.trim() || currentUser.fullName,
      avatarUrl: avatarUrl || currentUser.avatarUrl,
    });
    currentUserRef.current = updated;
    setCurrentUser(updated);
    const nextUsers = usersRef.current.map((u) =>
      u.id === currentUser.id || u.username.toLowerCase() === currentUser.username.toLowerCase()
        ? updated
        : u
    );
    usersRef.current = nextUsers;
    setUsers(nextUsers);
    localStorage.setItem('bw_users_list', JSON.stringify(nextUsers));
    syncAccountsToDatabase(nextUsers, updated);
    showToast('Profil berhasil diperbarui & disinkronkan ke database.', 'success');
  };

  const changePassword = (oldPassword: string, newPassword: string) => {
    if (!currentUser) return false;
    const cleanU = currentUser.username.toLowerCase().trim();
    const expectedOld =
      userPasswordsRef.current[cleanU] ||
      currentUser.password ||
      (cleanU === 'superadmin' ? 'superadmin123' : '123456');

    if (oldPassword.trim() && oldPassword.trim() !== expectedOld) {
      showToast('Password lama tidak sesuai.', 'error');
      return false;
    }

    const cleanNew = newPassword.trim();
    const nextPasswords = {
      ...userPasswordsRef.current,
      [cleanU]: cleanNew,
    };
    userPasswordsRef.current = nextPasswords;
    setUserPasswords(nextPasswords);
    localStorage.setItem('bw_user_passwords', JSON.stringify(nextPasswords));

    const updatedUser = normalizeUserRecord({ ...currentUser, password: cleanNew });
    currentUserRef.current = updatedUser;
    setCurrentUser(updatedUser);
    const nextUsers = usersRef.current.map((u) =>
      u.username.toLowerCase() === cleanU ? updatedUser : u
    );
    usersRef.current = nextUsers;
    setUsers(nextUsers);
    localStorage.setItem('bw_users_list', JSON.stringify(nextUsers));
    syncAccountsToDatabase(nextUsers, updatedUser);

    showToast('Password Anda berhasil diubah & disimpan ke database.', 'success');
    return true;
  };

  // =========================================================
  // Super Admin: Settings & Users
  // =========================================================

  const setAcademicYear = (year: string) => {
    academicYearRef.current = year;
    setAcademicYearState(year);
    scheduleSchoolConfigSync();
  };

  const updateSiteSettings = (
    settings: Partial<SiteSettings>,
    options?: { silent?: boolean }
  ) => {
    if (!isSuperAdminAccount(currentUserRef.current)) {
      if (!options?.silent) {
        showToast('Hanya Super Admin yang memiliki akses mengubah identitas & tema web.', 'error');
      }
      return;
    }
    const updated = { ...siteSettingsRef.current, ...settings };
    siteSettingsRef.current = updated;
    setSiteSettings(updated);
    localStorage.setItem('bw_site_settings', JSON.stringify(updated));
    scheduleSchoolConfigSync();
    if (!options?.silent) {
      showToast('Pengaturan website berhasil disimpan & disinkronkan ke semua user.', 'success');
    }
  };

  const addUser = (
    username: string,
    fullName: string,
    email: string,
    role: User['role'],
    password?: string
  ) => {
    if (!isSuperAdminAccount(currentUserRef.current)) {
      showToast('Akses ditolak: Hanya Super Admin yang dapat menambah akun pengguna.', 'error');
      return;
    }
    const cleanUsername = username.toLowerCase().trim();
    if (!cleanUsername || !fullName.trim()) {
      showToast('Username dan Nama Lengkap wajib diisi.', 'error');
      return;
    }
    if (isReservedSuperAdminUsername(cleanUsername)) {
      showToast('Username "superadmin" dikhususkan untuk akun utama Super Admin.', 'error');
      return;
    }
    if (usersRef.current.some((u) => u.username.toLowerCase().trim() === cleanUsername)) {
      showToast(`Username "@${cleanUsername}" sudah digunakan oleh akun lain.`, 'error');
      return;
    }

    // Never allow creating duplicate superadmin accounts
    const safeRole: User['role'] =
      role === 'wali_kelas' || role === 'admin' ? role : 'guru';
    const initialPass = password?.trim() || '123456';

    const nextDeleted = deletedUsernamesRef.current.filter((u) => u !== cleanUsername);
    deletedUsernamesRef.current = nextDeleted;
    setDeletedUsernames(nextDeleted);
    localStorage.setItem('bw_deleted_usernames', JSON.stringify(nextDeleted));

    const nextPasswords = {
      ...userPasswordsRef.current,
      [cleanUsername]: initialPass,
    };
    userPasswordsRef.current = nextPasswords;
    setUserPasswords(nextPasswords);
    localStorage.setItem('bw_user_passwords', JSON.stringify(nextPasswords));

    const newUser: User = normalizeUserRecord({
      id: normalizeUserId(`usr-${cleanUsername}`, cleanUsername),
      username: cleanUsername,
      fullName: fullName.trim(),
      email: email.trim() || `${cleanUsername}@baiturrahman.sch.id`,
      avatarUrl: '/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg',
      role: safeRole,
      joinedDate: new Date().toLocaleDateString('id-ID'),
      password: initialPass,
    });

    const nextUsers = mergeUserLists(
      [usersRef.current, [newUser], INITIAL_USERS],
      nextDeleted
    );
    usersRef.current = nextUsers;
    setUsers(nextUsers);
    localStorage.setItem('bw_users_list', JSON.stringify(nextUsers));
    syncAccountsToDatabase(nextUsers, newUser, nextDeleted);

    showToast(`Akun "${fullName}" (@${cleanUsername}) berhasil ditambahkan ke database.`, 'success');
  };

  const updateUserRecord = (id: string, patch: Partial<User>) => {
    if (!isSuperAdminAccount(currentUserRef.current)) {
      showToast('Akses ditolak: Hanya Super Admin yang dapat mengubah data akun pengguna.', 'error');
      return;
    }
    let updatedTarget: User | undefined;
    const nextList = usersRef.current.map((u) => {
      if (u.id !== id) return u;
      const isTargetSuper = u.id === 'usr-superadmin' || u.username.toLowerCase() === 'superadmin';
      const requestedRole = patch.role ?? u.role;
      const safeRole: User['role'] = isTargetSuper
        ? 'superadmin'
        : requestedRole === 'superadmin'
          ? 'admin'
          : requestedRole;
      const updated = normalizeUserRecord({
        ...u,
        ...patch,
        id: isTargetSuper ? 'usr-superadmin' : u.id,
        username: isTargetSuper ? 'superadmin' : (patch.username ?? u.username).toLowerCase().trim(),
        fullName: (patch.fullName ?? u.fullName).trim(),
        email: (patch.email ?? u.email ?? '').trim(),
        role: safeRole,
      });
      updatedTarget = updated;
      if (currentUserRef.current?.id === u.id) {
        currentUserRef.current = updated;
        setCurrentUser(updated);
      }
      return updated;
    });

    usersRef.current = nextList;
    setUsers(nextList);
    localStorage.setItem('bw_users_list', JSON.stringify(nextList));
    syncAccountsToDatabase(nextList, updatedTarget);
    showToast('Data akun pengguna berhasil diperbarui & disinkronkan ke database.', 'success');
  };

  const deleteUser = (id: string) => {
    if (!isSuperAdminAccount(currentUserRef.current)) {
      showToast('Akses ditolak: Hanya Super Admin yang dapat menghapus akun pengguna.', 'error');
      return;
    }
    if (id === 'usr-superadmin') {
      showToast('Akun Super Admin utama tidak boleh dihapus!', 'error');
      return;
    }
    const targetUser = usersRef.current.find((u) => u.id === id);
    if (!targetUser || targetUser.username.toLowerCase() === 'superadmin') {
      showToast('Akun Super Admin utama tidak boleh dihapus!', 'error');
      return;
    }

    const cleanU = targetUser.username.toLowerCase().trim();
    const cleanEmail = (targetUser.email || '').toLowerCase().trim();
    const entriesToBlock = [
      cleanU,
      ...(cleanEmail && !isAuthorizedSuperAdminEmail(cleanEmail) ? [cleanEmail] : []),
    ];
    const nextDeleted = Array.from(
      new Set([...deletedUsernamesRef.current, ...entriesToBlock])
    ).filter((u) => u && u !== 'superadmin');
    deletedUsernamesRef.current = nextDeleted;
    setDeletedUsernames(nextDeleted);
    localStorage.setItem('bw_deleted_usernames', JSON.stringify(nextDeleted));

    // Wipe any saved password for the deleted user so previous credentials are completely reset
    if (cleanU in userPasswordsRef.current) {
      const nextPasswords = { ...userPasswordsRef.current };
      delete nextPasswords[cleanU];
      userPasswordsRef.current = nextPasswords;
      setUserPasswords(nextPasswords);
      localStorage.setItem('bw_user_passwords', JSON.stringify(nextPasswords));
    }

    const nextUsers = usersRef.current.filter(
      (u) =>
        u.id !== id &&
        u.username.toLowerCase().trim() !== cleanU &&
        (!cleanEmail || u.email?.toLowerCase().trim() !== cleanEmail)
    );
    usersRef.current = nextUsers;
    setUsers(nextUsers);
    localStorage.setItem('bw_users_list', JSON.stringify(nextUsers));

    if (
      currentUserRef.current &&
      (currentUserRef.current.id === id ||
        currentUserRef.current.username.toLowerCase().trim() === cleanU)
    ) {
      currentUserRef.current = null;
      setCurrentUser(null);
      localStorage.removeItem('bw_user');
    }

    const uid = auth.currentUser?.uid || targetUser.googleUid || 'global_registry';
    const candidateDocIds = Array.from(
      new Set(
        [
          getUserProfileDocId(uid, id, targetUser.username),
          getUserProfileDocId('global_registry', id, targetUser.username),
          targetUser.googleUid
            ? getUserProfileDocId(targetUser.googleUid, id, targetUser.username)
            : '',
          ...getKnownDocIdsInCollection('users').filter((docId) => {
            const lower = docId.toLowerCase();
            return lower === `usr-${cleanU}` || lower.endsWith(`_${cleanU}`);
          }),
        ].filter(Boolean)
      )
    );
    candidateDocIds.forEach((docId) => {
      deleteFirestoreDoc('users', docId).catch(() => {});
    });

    // Also query /users collection to purge any legacy documents matching this username or email
    getDocs(collection(db, 'users'))
      .then((snap) => {
        snap.docs.forEach((docSnap) => {
          const d = docSnap.data();
          const docU = String(d.username || '').toLowerCase().trim();
          const docE = String(d.email || '').toLowerCase().trim();
          if (
            docU === cleanU ||
            (cleanEmail && docE === cleanEmail) ||
            docSnap.id.toLowerCase().endsWith(`_${cleanU}`)
          ) {
            deleteFirestoreDoc('users', docSnap.id).catch(() => {});
          }
        });
      })
      .catch(() => {});

    syncAccountsToDatabase(nextUsers, undefined, nextDeleted);
    showToast(
      `Akun @${targetUser.username} berhasil dihapus & profil sebelumnya telah direset.`,
      'info'
    );
  };

  const resetUserPassword = (id: string, newPass: string) => {
    if (!isSuperAdminAccount(currentUserRef.current)) {
      showToast('Akses ditolak: Hanya Super Admin yang dapat mereset password pengguna.', 'error');
      return;
    }
    const targetUser = usersRef.current.find((u) => u.id === id);
    if (!targetUser) return;
    const cleanU = targetUser.username.toLowerCase().trim();
    const cleanPass = newPass.trim() || '123456';

    const nextPasswords = {
      ...userPasswordsRef.current,
      [cleanU]: cleanPass,
    };
    userPasswordsRef.current = nextPasswords;
    setUserPasswords(nextPasswords);
    localStorage.setItem('bw_user_passwords', JSON.stringify(nextPasswords));

    const updatedUser = normalizeUserRecord({ ...targetUser, password: cleanPass });
    const nextUsers = usersRef.current.map((u) => (u.id === id ? updatedUser : u));
    usersRef.current = nextUsers;
    setUsers(nextUsers);
    localStorage.setItem('bw_users_list', JSON.stringify(nextUsers));
    syncAccountsToDatabase(nextUsers, updatedUser);

    showToast(
      `Password akun @${targetUser.username} berhasil direset ke "${cleanPass}" & disimpan di database.`,
      'success'
    );
  };

  const updateThemeSettings = (
    newSettings: Partial<ThemeSettings>,
    options?: { silent?: boolean }
  ) => {
    const isSuperAdmin = isSuperAdminAccount(currentUserRef.current);
    const keys = Object.keys(newSettings);
    const isOnlySurfaceToggle =
      keys.length <= 2 &&
      keys.every((k) => k === 'surfaceMode' || k === 'surfaceThemeMode');

    if (!isSuperAdmin && isOnlySurfaceToggle) {
      const wantDark =
        newSettings.surfaceMode === 'dark_elevated' ||
        newSettings.surfaceThemeMode === 'dark_slate';
      setDeviceDarkMode(wantDark);
      if (!options?.silent) {
        showToast(
          wantDark
            ? 'Mode Malam aktif untuk perangkat ini.'
            : 'Mode Terang aktif untuk perangkat ini.',
          'success'
        );
      }
      return;
    }

    if (!isSuperAdmin) {
      if (!options?.silent) {
        showToast('Hanya Super Admin yang dapat mengubah tema tampilan web.', 'error');
      }
      return;
    }

    if (
      newSettings.surfaceMode !== undefined ||
      newSettings.surfaceThemeMode !== undefined
    ) {
      clearDeviceDarkOverride();
    }

    const updated = normalizeThemeSettings({
      ...themeSettingsRef.current,
      ...newSettings,
    });
    const effectiveDark = isDarkSurfaceMode(updated, deviceDarkOverrideRef.current);
    themeSettingsRef.current = updated;
    applyThemeCssVariables(updated, effectiveDark);
    setThemeSettings(updated);
    localStorage.setItem('bw_theme_settings', JSON.stringify(updated));
    scheduleSchoolConfigSync();
    if (!options?.silent) {
      showToast(
        'Tema tampilan berhasil diperbarui & disinkronkan ke semua user.',
        'success'
      );
    }
  };

  const updateSchoolConfig = (
    patch: {
      themeSettings?: Partial<ThemeSettings>;
      siteSettings?: Partial<SiteSettings>;
      academicYear?: string;
    },
    options?: { silent?: boolean }
  ) => {
    if (!isSuperAdminAccount(currentUserRef.current)) {
      if (!options?.silent) {
        showToast('Hanya Super Admin yang dapat mengubah tema tampilan web.', 'error');
      }
      return;
    }
    if (patch.academicYear && patch.academicYear !== academicYearRef.current) {
      academicYearRef.current = patch.academicYear;
      setAcademicYearState(patch.academicYear);
    }
    if (patch.themeSettings) {
      if (
        patch.themeSettings.surfaceMode !== undefined ||
        patch.themeSettings.surfaceThemeMode !== undefined
      ) {
        clearDeviceDarkOverride();
      }
      const nextTheme = normalizeThemeSettings({
        ...themeSettingsRef.current,
        ...patch.themeSettings,
      });
      const effectiveDark = isDarkSurfaceMode(nextTheme, deviceDarkOverrideRef.current);
      themeSettingsRef.current = nextTheme;
      applyThemeCssVariables(nextTheme, effectiveDark);
      setThemeSettings(nextTheme);
      localStorage.setItem('bw_theme_settings', JSON.stringify(nextTheme));
    }
    if (patch.siteSettings) {
      const nextSite = { ...siteSettingsRef.current, ...patch.siteSettings };
      siteSettingsRef.current = nextSite;
      setSiteSettings(nextSite);
      localStorage.setItem('bw_site_settings', JSON.stringify(nextSite));
    }

    scheduleSchoolConfigSync();
    if (!options?.silent) {
      showToast('Tema, identitas & format rapor berhasil disinkronkan ke semua user!', 'success');
    }
  };

  const saveSchoolConfig = (
    themePatch: Partial<ThemeSettings>,
    sitePatch: Partial<SiteSettings>,
    newAcademicYear?: string
  ) => {
    updateSchoolConfig({
      themeSettings: themePatch,
      siteSettings: sitePatch,
      academicYear: newAcademicYear,
    });
  };

  const resetThemeSettings = () => {
    if (!isSuperAdminAccount(currentUserRef.current)) {
      showToast('Hanya Super Admin yang dapat mereset tema tampilan web.', 'error');
      return;
    }
    clearDeviceDarkOverride();
    const defaultNormalized = normalizeThemeSettings(INITIAL_THEME_SETTINGS);
    themeSettingsRef.current = defaultNormalized;
    applyThemeCssVariables(defaultNormalized, false);
    setThemeSettings(defaultNormalized);
    localStorage.setItem('bw_theme_settings', JSON.stringify(defaultNormalized));
    scheduleSchoolConfigSync();
    showToast('Tema tampilan direset ke bawaan & disinkronkan ke semua user.', 'info');
  };

  const handleSetIsThemeModalOpen = (open: boolean) => {
    if (open && !isSuperAdminAccount(currentUserRef.current)) {
      showToast('Hanya Super Admin yang dapat mengakses pengaturan tema web.', 'error');
      setIsThemeModalOpen(false);
      return;
    }
    if (open) {
      setCurrentViewState('manage');
      setManageTab('superadmin');
      setIsThemeModalOpen(false);
    } else {
      setIsThemeModalOpen(false);
    }
  };

  // =========================================================
  // Digital Report Cards CRUD
  // =========================================================

  const saveReportCard = (record: ReportCardRecord, options?: { silent?: boolean }) => {
    const updatedRecord: ReportCardRecord = {
      ...record,
      updatedAt: new Date().toISOString(),
    };
    const prev = reportCardsRef.current;
    const existingIdx = prev.findIndex(
      (r) =>
        r.id === record.id ||
        (r.studentId === record.studentId &&
          r.semester === record.semester &&
          r.academicYear === record.academicYear)
    );

    const nextList =
      existingIdx >= 0
        ? prev.map((item, idx) => (idx === existingIdx ? updatedRecord : item))
        : [...prev, updatedRecord];

    reportCardsRef.current = nextList;
    setReportCards(nextList);
    localStorage.setItem('bw_report_cards', JSON.stringify(nextList));
    scheduleSchoolConfigSync(true);

    const uid = auth.currentUser?.uid;
    if (uid) {
      ensureParentsInFirestore(uid, {
        classId: updatedRecord.classId,
        studentId: updatedRecord.studentId,
      }).then(() => {
        syncReportCardToFirestore(uid, updatedRecord).then(() => markSynced());
      });
    }
    if (!options?.silent) {
      showToast('Rapor digital santri berhasil disimpan ke database!', 'success');
    }
  };

  const deleteReportCard = (id: string) => {
    const nextList = reportCardsRef.current.filter((r) => r.id !== id);
    reportCardsRef.current = nextList;
    setReportCards(nextList);
    localStorage.setItem('bw_report_cards', JSON.stringify(nextList));
    scheduleSchoolConfigSync(true);
    const uid = auth.currentUser?.uid;
    if (uid) {
      deleteFirestoreDoc('report_cards', getReportCardDocId(uid, id)).then(() => markSynced());
    }
    showToast('Data rapor digital dihapus dari database.', 'info');
  };

  const generateClassReportCards = (classId: number, semester: 1 | 2): number => {
    const isAllClasses = !classId || classId <= 0 || isNaN(classId);
    const classStudentList = isAllClasses
      ? studentsRef.current
      : studentsRef.current.filter((s) => s.classId === classId);
    if (!classStudentList.length) {
      showToast('Tidak ada siswa di kelas yang dipilih.', 'error');
      return 0;
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const recordsToSync: ReportCardRecord[] = [];
    const newReports = [...reportCardsRef.current];

    classStudentList.forEach((st) => {
      const stClassObj = classesRef.current.find((c) => c.id === st.classId);
      const repId = `${st.id}_${semester}_${academicYearRef.current}`;
      const existingIdx = newReports.findIndex((r) => r.id === repId);

      const studentTahfidz = tahfidzGradesRef.current.find(
        (t) => t.studentId === st.id && t.semester === semester
      );

      const defaultReport: ReportCardRecord = {
        id: repId,
        studentId: st.id,
        classId: st.classId,
        semester: semester,
        academicYear: academicYearRef.current,
        status: 'ready',
        attendance: { sick: 0, permission: 0, unexcused: 0 },
        teacherNotes: `Ananda ${st.name} menunjukkan perkembangan akhlak dan kedisiplinan yang baik. Pertahankan hafalan dan semangat belajar di semester ini.`,
        tahfidzNotes: studentTahfidz?.notes || 'Telah mengikuti ujian tahfidz & tajwid.',
        spiritualAttitude: 'A',
        spiritualDescription: '',
        socialAttitude: 'A',
        socialDescription: '',
        extracurriculars: [],
        issuePlace: siteSettingsRef.current.defaultIssuePlace || 'Bandung',
        issueDate: todayDate,
        headmasterName: siteSettingsRef.current.headmasterName || 'Muhammad Siroj, S.Pd.I',
        headmasterNip: siteSettingsRef.current.headmasterNip || '19830715 200801 1 004',
        classTeacherName: stClassObj?.teacher || 'Wali Kelas',
        updatedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        const updatedExisting: ReportCardRecord = {
          ...newReports[existingIdx],
          classId: st.classId,
          tahfidzNotes: studentTahfidz?.notes || newReports[existingIdx].tahfidzNotes || 'Juz 30',
          status: newReports[existingIdx].status === 'published' ? 'published' : 'ready',
          updatedAt: new Date().toISOString(),
        };
        newReports[existingIdx] = updatedExisting;
        recordsToSync.push(updatedExisting);
      } else {
        newReports.push(defaultReport);
        recordsToSync.push(defaultReport);
      }
    });

    reportCardsRef.current = newReports;
    setReportCards(newReports);
    localStorage.setItem('bw_report_cards', JSON.stringify(newReports));
    scheduleSchoolConfigSync(true);

    const uid = auth.currentUser?.uid;
    if (uid && recordsToSync.length > 0) {
      Promise.all(
        recordsToSync.map(async (r) => {
          await ensureParentsInFirestore(uid, { classId: r.classId, studentId: r.studentId });
          await syncReportCardToFirestore(uid, r);
        })
      ).then(() => markSynced());
    }

    showToast(
      `Rapor untuk ${classStudentList.length} santri ${isAllClasses ? 'semua kelas' : 'kelas'} siap diterbitkan & disinkronkan!`,
      'success'
    );
    return classStudentList.length;
  };

  // =========================================================
  // Super Admin: Database Management
  // =========================================================

  const exportDatabaseJSON = () => {
    const backup = {
      backupDate: new Date().toISOString(),
      appName: siteSettings.appName,
      siteSettings,
      themeSettings,
      users,
      classes,
      subjects,
      students,
      grades,
      tahfidzGrades,
      reportCards,
      examFiles,
      examPackages,
      studentAttendance,
      teacherAttendance,
      teachingAssignments,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDatabaseJSON = (jsonStr: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.classes || !data.students) {
        return {
          success: false,
          message: 'Format data JSON tidak valid atau struktur tidak lengkap.',
        };
      }
      const nextSite = data.siteSettings || siteSettings;
      const nextTheme = data.themeSettings || themeSettings;
      const rawImportedUsers = Array.isArray(data.users) ? data.users : usersRef.current;
      const nextUsers = mergeUserLists(
        [rawImportedUsers, usersRef.current, INITIAL_USERS],
        deletedUsernamesRef.current
      );
      const nextClasses = data.classes || classes;
      const nextSubjects = data.subjects || subjects;
      const nextStudents = data.students || students;
      const nextGrades = data.grades || grades;
      const nextTahfidz = data.tahfidzGrades || tahfidzGrades;
      const nextReports = data.reportCards || reportCards;
      const nextExamFiles = data.examFiles || examFiles;
      const nextExamPackages = data.examPackages || examPackages;
      const nextStudentAtt = data.studentAttendance || studentAttendance;
      const nextTeacherAtt = data.teacherAttendance || teacherAttendance;
      const nextTeachingAssign = data.teachingAssignments || teachingAssignments;

      siteSettingsRef.current = nextSite;
      themeSettingsRef.current = nextTheme;
      usersRef.current = nextUsers;
      classesRef.current = nextClasses;
      subjectsRef.current = nextSubjects;
      studentsRef.current = nextStudents;
      gradesRef.current = nextGrades;
      tahfidzGradesRef.current = nextTahfidz;
      reportCardsRef.current = nextReports;
      examFilesRef.current = nextExamFiles;
      examPackagesRef.current = nextExamPackages;
      studentAttendanceRef.current = nextStudentAtt;
      teacherAttendanceRef.current = nextTeacherAtt;
      teachingAssignmentsRef.current = nextTeachingAssign;

      setSiteSettings(nextSite);
      setThemeSettings(nextTheme);
      setUsers(nextUsers);
      setClasses(nextClasses);
      setSubjects(nextSubjects);
      setStudents(nextStudents);
      setGrades(nextGrades);
      setTahfidzGrades(nextTahfidz);
      setReportCards(nextReports);
      setExamFiles(nextExamFiles);
      setExamPackages(nextExamPackages);
      setStudentAttendance(nextStudentAtt);
      setTeacherAttendance(nextTeacherAtt);
      setTeachingAssignments(nextTeachingAssign);
      refreshGlobalDatabaseCache(nextUsers);
      scheduleSchoolConfigSync();

      const uid = auth.currentUser?.uid;
      if (uid) {
        seedFullWorkspaceToFirestore(uid, {
          siteSettings: nextSite,
          themeSettings: nextTheme,
          academicYear,
          users: nextUsers,
          classes: nextClasses,
          subjects: nextSubjects,
          students: nextStudents,
          grades: nextGrades,
          tahfidzGrades: nextTahfidz,
          reportCards: nextReports,
          examFiles: nextExamFiles,
          examPackages: nextExamPackages,
        });
      }

      showToast('Database berhasil dipulihkan & disinkronkan!', 'success');
      return { success: true, message: 'Database sukses diimpor.' };
    } catch (err: any) {
      return { success: false, message: 'Gagal membaca berkas JSON: ' + (err.message || 'Error') };
    }
  };

  const updateDatabaseTable = (
    tableKey: string,
    payload: any
  ): { success: boolean; message: string } => {
    if (!isSuperAdminAccount(currentUserRef.current)) {
      showToast('Akses ditolak: Hanya Super Admin yang memiliki akses penuh ke database.', 'error');
      return { success: false, message: 'Akses ditolak' };
    }

    try {
      const uid = auth.currentUser?.uid;

      switch (tableKey) {
        case 'students': {
          if (!Array.isArray(payload)) throw new Error('Data santri harus berupa array.');
          studentsRef.current = payload;
          setStudents(payload);
          localStorage.setItem('bw_students', JSON.stringify(payload));
          scheduleSchoolConfigSync();
          if (uid) {
            runInChunks(payload as Student[], 15, async (st) => {
              await ensureParentsInFirestore(uid, { classId: st.classId });
              await syncStudentToFirestore(uid, st);
            }).then(() => markSynced());
          }
          break;
        }
        case 'classes': {
          if (!Array.isArray(payload)) throw new Error('Data kelas harus berupa array.');
          classesRef.current = payload;
          setClasses(payload);
          localStorage.setItem('bw_classes', JSON.stringify(payload));
          scheduleSchoolConfigSync();
          if (uid) {
            runInChunks(payload as ClassRoom[], 15, (c) => syncClassToFirestore(uid, c)).then(() =>
              markSynced()
            );
          }
          break;
        }
        case 'subjects': {
          if (!Array.isArray(payload)) throw new Error('Data mata pelajaran harus berupa array.');
          subjectsRef.current = payload;
          setSubjects(payload);
          localStorage.setItem('bw_subjects', JSON.stringify(payload));
          scheduleSchoolConfigSync();
          if (uid) {
            runInChunks(payload as Subject[], 15, (s) => syncSubjectToFirestore(uid, s)).then(() =>
              markSynced()
            );
          }
          break;
        }
        case 'grades': {
          if (!Array.isArray(payload)) throw new Error('Data nilai harus berupa array.');
          gradesRef.current = payload;
          setGrades(payload);
          localStorage.setItem('bw_grades', JSON.stringify(payload));
          scheduleSchoolConfigSync();
          if (uid) {
            runInChunks(payload as Grade[], 20, async (g) => {
              await ensureParentsInFirestore(uid, {
                classId: g.classId,
                subjectId: g.subjectId,
                studentId: g.studentId,
              });
              await syncGradeToFirestore(uid, g);
            }).then(() => markSynced());
          }
          break;
        }
        case 'tahfidz_grades': {
          if (!Array.isArray(payload)) throw new Error('Data tahfidz harus berupa array.');
          tahfidzGradesRef.current = payload;
          setTahfidzGrades(payload);
          localStorage.setItem('bw_tahfidz', JSON.stringify(payload));
          scheduleSchoolConfigSync();
          if (uid) {
            runInChunks(payload as TahfidzGrade[], 20, async (t) => {
              await ensureParentsInFirestore(uid, {
                classId: t.classId,
                studentId: t.studentId,
              });
              await syncTahfidzToFirestore(uid, t);
            }).then(() => markSynced());
          }
          break;
        }
        case 'report_cards': {
          if (!Array.isArray(payload)) throw new Error('Data rapor harus berupa array.');
          reportCardsRef.current = payload;
          setReportCards(payload);
          localStorage.setItem('bw_report_cards', JSON.stringify(payload));
          scheduleSchoolConfigSync();
          if (uid) {
            runInChunks(payload as ReportCardRecord[], 15, async (r) => {
              await ensureParentsInFirestore(uid, {
                classId: r.classId,
                studentId: r.studentId,
              });
              await syncReportCardToFirestore(uid, r);
            }).then(() => markSynced());
          }
          break;
        }
        case 'announcements': {
          if (!Array.isArray(payload)) throw new Error('Data pengumuman harus berupa array.');
          updateSiteSettings({ announcements: payload }, { silent: true });
          break;
        }
        case 'exam_packages': {
          if (!Array.isArray(payload)) throw new Error('Data paket soal harus berupa array.');
          examPackagesRef.current = payload;
          setExamPackages(payload);
          localStorage.setItem('bw_exam_packages', JSON.stringify(payload));
          scheduleSchoolConfigSync();
          if (uid) {
            runInChunks(payload as ExamQuestionsPackage[], 10, async (p) => {
              await ensureParentsInFirestore(uid, {
                classId: p.classId,
                subjectId: p.subjectId,
              });
              await syncExamPackageToFirestore(uid, p);
            }).then(() => markSynced());
          }
          break;
        }
        case 'exam_files': {
          if (!Array.isArray(payload)) throw new Error('Data berkas soal harus berupa array.');
          examFilesRef.current = payload;
          setExamFiles(payload);
          localStorage.setItem('bw_exam_files', JSON.stringify(payload));
          scheduleSchoolConfigSync();
          if (uid) {
            runInChunks(payload as ExamFile[], 15, async (f) => {
              await ensureParentsInFirestore(uid, {
                classId: f.classId,
                subjectId: f.subjectId,
              });
              await syncExamFileToFirestore(uid, f);
            }).then(() => markSynced());
          }
          break;
        }
        case 'users': {
          if (!Array.isArray(payload)) throw new Error('Data pengguna harus berupa array.');
          const normalizedUsers = mergeUserLists(
            [INITIAL_USERS, usersRef.current, payload as User[]],
            deletedUsernamesRef.current
          );
          usersRef.current = normalizedUsers;
          setUsers(normalizedUsers);
          localStorage.setItem('bw_users_list', JSON.stringify(normalizedUsers));
          refreshGlobalDatabaseCache(normalizedUsers);
          const syncUid = uid || 'superadmin_global';
          runInChunks(normalizedUsers, 15, (u) => syncUserProfileToFirestore(syncUid, u)).then(() =>
            markSynced()
          );
          scheduleSchoolConfigSync();
          break;
        }
        case 'student_attendance': {
          if (!Array.isArray(payload)) throw new Error('Data absensi santri harus berupa array.');
          studentAttendanceRef.current = payload;
          setStudentAttendance(payload);
          localStorage.setItem('bw_student_attendance', JSON.stringify(payload));
          scheduleSchoolConfigSync();
          break;
        }
        case 'teacher_attendance': {
          if (!Array.isArray(payload)) throw new Error('Data absensi guru harus berupa array.');
          teacherAttendanceRef.current = payload;
          setTeacherAttendance(payload);
          localStorage.setItem('bw_teacher_attendance', JSON.stringify(payload));
          scheduleSchoolConfigSync();
          break;
        }
        case 'teaching_assignments': {
          if (!Array.isArray(payload)) throw new Error('Data jadwal & pengampu harus berupa array.');
          teachingAssignmentsRef.current = payload;
          setTeachingAssignments(payload);
          localStorage.setItem('bw_teaching_assignments', JSON.stringify(payload));
          scheduleSchoolConfigSync();
          break;
        }
        case 'site_and_theme_config': {
          if (!payload || typeof payload !== 'object') {
            throw new Error('Data konfigurasi harus berupa objek.');
          }
          updateSchoolConfig(
            {
              siteSettings: payload.siteSettings || siteSettingsRef.current,
              themeSettings: payload.themeSettings || themeSettingsRef.current,
              academicYear: payload.academicYear || academicYearRef.current,
            },
            { silent: true }
          );
          break;
        }
        default:
          return { success: false, message: `Tabel "${tableKey}" tidak dikenali.` };
      }

      showToast(`Tabel database "${tableKey}" berhasil diperbarui & disinkronkan!`, 'success');
      return { success: true, message: 'Tabel berhasil diperbarui.' };
    } catch (err: any) {
      const msg = err?.message || 'Gagal memperbarui tabel database.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const clearAllGrades = () => {
    const oldGrades = [...gradesRef.current];
    const oldTahfidz = [...tahfidzGradesRef.current];
    gradesRef.current = [];
    tahfidzGradesRef.current = [];
    setGrades([]);
    setTahfidzGrades([]);
    localStorage.setItem('bw_grades', JSON.stringify([]));
    localStorage.setItem('bw_tahfidz', JSON.stringify([]));
    scheduleSchoolConfigSync();

    const uid = auth.currentUser?.uid;
    if (uid) {
      Promise.all([
        ...oldGrades.map((g) => deleteFirestoreDoc('grades', getGradeDocId(uid, g.id))),
        ...oldTahfidz.map((t) => deleteFirestoreDoc('tahfidz_grades', getTahfidzDocId(uid, t.id))),
      ]);
    }
    showToast('Semua nilai dan catatan tahfidz berhasil dikosongkan.', 'info');
  };

  // =========================================================
  // Subjects CRUD
  // =========================================================

  const addSubject = (name: string, category: Subject['category'] = 'Diniyah') => {
    const newId = Math.max(0, ...subjectsRef.current.map((s) => s.id)) + 1;
    const newSub: Subject = { id: newId, name: name.trim(), category };
    const nextList = [newSub, ...subjectsRef.current];
    subjectsRef.current = nextList;
    setSubjects(nextList);
    localStorage.setItem('bw_subjects', JSON.stringify(nextList));
    scheduleSchoolConfigSync();

    const uid = auth.currentUser?.uid;
    if (uid) {
      syncSubjectToFirestore(uid, newSub);
    }
    showToast(`Mata pelajaran "${name}" berhasil ditambahkan.`);
  };

  const updateSubject = (id: number, name: string, category?: Subject['category']) => {
    const existing = subjectsRef.current.find((s) => s.id === id);
    const updatedSub: Subject = {
      id,
      name: name.trim(),
      category: category || existing?.category || 'Diniyah',
    };
    const nextList = subjectsRef.current.map((s) => (s.id === id ? updatedSub : s));
    subjectsRef.current = nextList;
    setSubjects(nextList);
    localStorage.setItem('bw_subjects', JSON.stringify(nextList));
    scheduleSchoolConfigSync();

    const uid = auth.currentUser?.uid;
    if (uid) {
      syncSubjectToFirestore(uid, updatedSub);
    }
    showToast('Mata pelajaran berhasil diubah.');
  };

  const deleteSubject = (id: number) => {
    const sub = subjectsRef.current.find((s) => s.id === id);
    const relatedGrades = gradesRef.current.filter((g) => g.subjectId === id);
    const nextSubjects = subjectsRef.current.filter((s) => s.id !== id);
    const nextGrades = gradesRef.current.filter((g) => g.subjectId !== id);
    subjectsRef.current = nextSubjects;
    gradesRef.current = nextGrades;
    setSubjects(nextSubjects);
    setGrades(nextGrades);
    localStorage.setItem('bw_subjects', JSON.stringify(nextSubjects));
    localStorage.setItem('bw_grades', JSON.stringify(nextGrades));
    scheduleSchoolConfigSync();

    const uid = auth.currentUser?.uid;
    if (uid) {
      Promise.all([
        deleteFirestoreDoc('subjects', getSubjectDocId(uid, id)),
        ...relatedGrades.map((g) => deleteFirestoreDoc('grades', getGradeDocId(uid, g.id))),
      ]);
    }
    showToast(`Mata pelajaran "${sub?.name || ''}" dan nilai terkait dihapus.`, 'info');
  };

  // =========================================================
  // Classes CRUD
  // =========================================================

  const addClass = (name: string, teacher: string) => {
    const newId = Math.max(0, ...classesRef.current.map((c) => c.id)) + 1;
    const newCls: ClassRoom = { id: newId, name: name.trim(), teacher: teacher.trim() };
    const nextList = [...classesRef.current, newCls];
    classesRef.current = nextList;
    setClasses(nextList);
    localStorage.setItem('bw_classes', JSON.stringify(nextList));
    scheduleSchoolConfigSync();

    const uid = auth.currentUser?.uid;
    if (uid) {
      syncClassToFirestore(uid, newCls);
    }
    showToast(`Kelas "${name}" berhasil ditambahkan.`);
  };

  const updateClass = (id: number, name: string, teacher: string) => {
    const updatedCls: ClassRoom = { id, name: name.trim(), teacher: teacher.trim() };
    const nextList = classesRef.current.map((c) => (c.id === id ? updatedCls : c));
    classesRef.current = nextList;
    setClasses(nextList);
    localStorage.setItem('bw_classes', JSON.stringify(nextList));
    scheduleSchoolConfigSync();

    const uid = auth.currentUser?.uid;
    if (uid) {
      syncClassToFirestore(uid, updatedCls);
    }
    showToast('Data kelas berhasil diperbarui.');
  };

  const deleteClass = (id: number) => {
    const cls = classesRef.current.find((c) => c.id === id);
    const relStudents = studentsRef.current.filter((s) => s.classId === id);
    const relGrades = gradesRef.current.filter((g) => g.classId === id);
    const relTahfidz = tahfidzGradesRef.current.filter((t) => t.classId === id);

    const nextClasses = classesRef.current.filter((c) => c.id !== id);
    const nextStudents = studentsRef.current.filter((s) => s.classId !== id);
    const nextGrades = gradesRef.current.filter((g) => g.classId !== id);
    const nextTahfidz = tahfidzGradesRef.current.filter((t) => t.classId !== id);

    classesRef.current = nextClasses;
    studentsRef.current = nextStudents;
    gradesRef.current = nextGrades;
    tahfidzGradesRef.current = nextTahfidz;

    setClasses(nextClasses);
    setStudents(nextStudents);
    setGrades(nextGrades);
    setTahfidzGrades(nextTahfidz);

    localStorage.setItem('bw_classes', JSON.stringify(nextClasses));
    localStorage.setItem('bw_students', JSON.stringify(nextStudents));
    localStorage.setItem('bw_grades', JSON.stringify(nextGrades));
    localStorage.setItem('bw_tahfidz', JSON.stringify(nextTahfidz));
    scheduleSchoolConfigSync();

    const uid = auth.currentUser?.uid;
    if (uid) {
      Promise.all([
        deleteFirestoreDoc('classes', getClassDocId(uid, id)),
        ...relStudents.map((s) => deleteFirestoreDoc('students', getStudentDocId(uid, s.id))),
        ...relGrades.map((g) => deleteFirestoreDoc('grades', getGradeDocId(uid, g.id))),
        ...relTahfidz.map((t) => deleteFirestoreDoc('tahfidz_grades', getTahfidzDocId(uid, t.id))),
      ]);
    }
    showToast(`Kelas "${cls?.name || ''}" beserta siswa terkait berhasil dihapus.`, 'info');
  };

  // =========================================================
  // Students CRUD
  // =========================================================

  const addStudent = (data: Omit<Student, 'id'>) => {
    const newId = Math.max(0, ...studentsRef.current.map((s) => s.id)) + 1;
    const newStud: Student = { id: newId, ...data };
    const nextList = [...studentsRef.current, newStud];
    studentsRef.current = nextList;
    setStudents(nextList);
    localStorage.setItem('bw_students', JSON.stringify(nextList));
    scheduleSchoolConfigSync();

    const uid = auth.currentUser?.uid;
    if (uid) {
      ensureParentsInFirestore(uid, { classId: newStud.classId }).then(() => {
        syncStudentToFirestore(uid, newStud).then(() => markSynced());
      });
    }
    showToast(`Siswa "${data.name}" berhasil ditambahkan.`);
  };

  const updateStudent = (id: number, data: Omit<Student, 'id'>) => {
    const updatedStud: Student = { id, ...data };
    const nextList = studentsRef.current.map((s) => (s.id === id ? updatedStud : s));
    studentsRef.current = nextList;
    setStudents(nextList);
    localStorage.setItem('bw_students', JSON.stringify(nextList));
    scheduleSchoolConfigSync();

    const uid = auth.currentUser?.uid;
    if (uid) {
      ensureParentsInFirestore(uid, { classId: updatedStud.classId }).then(() => {
        syncStudentToFirestore(uid, updatedStud).then(() => markSynced());
      });
    }
    showToast('Data siswa berhasil diperbarui.');
  };

  const deleteStudent = (id: number) => {
    const stud = studentsRef.current.find((s) => s.id === id);
    const relGrades = gradesRef.current.filter((g) => g.studentId === id);
    const relTahfidz = tahfidzGradesRef.current.filter((t) => t.studentId === id);

    const nextStudents = studentsRef.current.filter((s) => s.id !== id);
    const nextGrades = gradesRef.current.filter((g) => g.studentId !== id);
    const nextTahfidz = tahfidzGradesRef.current.filter((t) => t.studentId !== id);

    studentsRef.current = nextStudents;
    gradesRef.current = nextGrades;
    tahfidzGradesRef.current = nextTahfidz;

    setStudents(nextStudents);
    setGrades(nextGrades);
    setTahfidzGrades(nextTahfidz);

    localStorage.setItem('bw_students', JSON.stringify(nextStudents));
    localStorage.setItem('bw_grades', JSON.stringify(nextGrades));
    localStorage.setItem('bw_tahfidz', JSON.stringify(nextTahfidz));
    scheduleSchoolConfigSync();

    const uid = auth.currentUser?.uid;
    if (uid) {
      Promise.all([
        deleteFirestoreDoc('students', getStudentDocId(uid, id)),
        ...relGrades.map((g) => deleteFirestoreDoc('grades', getGradeDocId(uid, g.id))),
        ...relTahfidz.map((t) => deleteFirestoreDoc('tahfidz_grades', getTahfidzDocId(uid, t.id))),
      ]);
    }
    showToast(`Siswa "${stud?.name || ''}" berhasil dihapus.`, 'info');
  };

  // =========================================================
  // Grades CRUD (Synchronous Ref + Automatic Cloud Sync)
  // =========================================================

  const saveBulkGrades = (
    subjectId: number,
    classId: number,
    semester: 1 | 2,
    gradesData: Record<number, number>,
    options?: { silent?: boolean }
  ) => {
    const testDate = new Date().toISOString().split('T')[0];
    const gradesToSync: Grade[] = [];
    const nextList = [...gradesRef.current];
    let nextId = Math.max(0, ...nextList.map((g) => g.id)) + 1;

    Object.entries(gradesData).forEach(([studentIdStr, rawScore]) => {
      const studentId = parseInt(studentIdStr, 10);
      if (!isNaN(rawScore) && rawScore >= 0) {
        const score = clampScore90(rawScore);
        const stObj = studentsRef.current.find((s) => s.id === studentId);
        const effectiveClassId = stObj?.classId || classId;

        const existingIdx = nextList.findIndex(
          (g) =>
            g.studentId === studentId &&
            g.subjectId === subjectId &&
            g.semester === semester
        );

        if (existingIdx >= 0) {
          const updated: Grade = {
            ...nextList[existingIdx],
            classId: effectiveClassId,
            score,
            testDate,
          };
          nextList[existingIdx] = updated;
          gradesToSync.push(updated);
        } else {
          const created: Grade = {
            id: nextId++,
            studentId,
            subjectId,
            classId: effectiveClassId,
            semester,
            score,
            testDate,
            type: 'regular',
          };
          nextList.push(created);
          gradesToSync.push(created);
        }
      }
    });

    const dedupedList = normalizeGradesList(nextList);
    gradesRef.current = dedupedList;
    setGrades(dedupedList);
    localStorage.setItem('bw_grades', JSON.stringify(dedupedList));
    scheduleSchoolConfigSync(true);

    const uid = auth.currentUser?.uid;
    if (uid && gradesToSync.length > 0) {
      Promise.all(
        gradesToSync.map(async (g) => {
          await ensureParentsInFirestore(uid, {
            classId: g.classId,
            subjectId: g.subjectId,
            studentId: g.studentId,
          });
          await syncGradeToFirestore(uid, g);
        })
      ).then(() => markSynced());
    }

    if (!options?.silent) {
      showToast(
        `Berhasil menyimpan nilai untuk ${Object.keys(gradesData).length} santri ke database & rapor!`
      );
    }
  };

  const saveStudentGradesBatch = (
    studentId: number,
    classId: number,
    semester: 1 | 2,
    subjectScores: Record<number, number | null>,
    options?: { silent?: boolean }
  ) => {
    const testDate = new Date().toISOString().split('T')[0];
    const gradesToUpsert: Grade[] = [];
    const gradeIdsToDelete: number[] = [];

    const stObj = studentsRef.current.find((s) => s.id === studentId);
    const effectiveClassId = stObj?.classId || classId;

    let nextList = [...gradesRef.current];
    let nextId = Math.max(0, ...nextList.map((g) => g.id)) + 1;

    Object.entries(subjectScores).forEach(([subIdStr, scoreOrNull]) => {
      const subjectId = parseInt(subIdStr, 10);
      if (isNaN(subjectId)) return;

      const existingIdx = nextList.findIndex(
        (g) =>
          g.studentId === studentId &&
          g.subjectId === subjectId &&
          g.semester === semester
      );

      if (scoreOrNull === null || isNaN(scoreOrNull)) {
        if (existingIdx >= 0) {
          gradeIdsToDelete.push(nextList[existingIdx].id);
          nextList.splice(existingIdx, 1);
        }
        return;
      }

      const clampedScore = clampScore90(scoreOrNull);

      if (existingIdx >= 0) {
        if (
          nextList[existingIdx].score !== clampedScore ||
          nextList[existingIdx].classId !== effectiveClassId
        ) {
          const updated: Grade = {
            ...nextList[existingIdx],
            classId: effectiveClassId,
            score: clampedScore,
            testDate,
          };
          nextList[existingIdx] = updated;
          gradesToUpsert.push(updated);
        }
      } else {
        const created: Grade = {
          id: nextId++,
          studentId,
          subjectId,
          classId: effectiveClassId,
          semester,
          score: clampedScore,
          testDate,
          type: 'regular',
        };
        nextList.push(created);
        gradesToUpsert.push(created);
      }
    });

    const dedupedList = normalizeGradesList(nextList);
    gradesRef.current = dedupedList;
    setGrades(dedupedList);
    localStorage.setItem('bw_grades', JSON.stringify(dedupedList));
    scheduleSchoolConfigSync(true);

    const uid = auth.currentUser?.uid;
    if (uid && (gradesToUpsert.length > 0 || gradeIdsToDelete.length > 0)) {
      Promise.all([
        ...gradesToUpsert.map(async (g) => {
          await ensureParentsInFirestore(uid, {
            classId: g.classId,
            subjectId: g.subjectId,
            studentId: g.studentId,
          });
          await syncGradeToFirestore(uid, g);
        }),
        ...gradeIdsToDelete.map((id) => deleteFirestoreDoc('grades', getGradeDocId(uid, id))),
      ]).then(() => markSynced());
    }

    if (!options?.silent) {
      showToast('Nilai mata pelajaran agama & umum berhasil disimpan ke database & rapor!');
    }
  };

  const updateGrade = (id: number, rawScore: number, options?: { silent?: boolean }) => {
    const score = clampScore90(rawScore);
    const existing = gradesRef.current.find((g) => g.id === id);
    const nextList = normalizeGradesList(
      gradesRef.current.map((g) => (g.id === id ? { ...g, score } : g))
    );
    gradesRef.current = nextList;
    setGrades(nextList);
    localStorage.setItem('bw_grades', JSON.stringify(nextList));
    scheduleSchoolConfigSync(true);

    const uid = auth.currentUser?.uid;
    if (uid && existing) {
      ensureParentsInFirestore(uid, {
        classId: existing.classId,
        subjectId: existing.subjectId,
        studentId: existing.studentId,
      }).then(() => {
        syncGradeToFirestore(uid, { ...existing, score }).then(() => markSynced());
      });
    }
    if (!options?.silent) {
      showToast('Nilai berhasil diperbarui ke database & rapor.');
    }
  };

  const deleteGrade = (id: number, options?: { silent?: boolean }) => {
    const nextList = gradesRef.current.filter((g) => g.id !== id);
    gradesRef.current = nextList;
    setGrades(nextList);
    localStorage.setItem('bw_grades', JSON.stringify(nextList));
    scheduleSchoolConfigSync(true);

    const uid = auth.currentUser?.uid;
    if (uid) {
      deleteFirestoreDoc('grades', getGradeDocId(uid, id)).then(() => markSynced());
    }
    if (!options?.silent) {
      showToast('Nilai berhasil dihapus.', 'info');
    }
  };

  // =========================================================
  // Tahfidz CRUD (Synchronous Ref + Automatic Cloud Sync)
  // =========================================================

  const calculateLetter = (avg: number): TahfidzGrade['gradeLetter'] => {
    return evaluateGradePredicate(avg, siteSettingsRef.current.gradeThresholds).letter;
  };

  const saveBulkTahfidz = (
    classId: number,
    semester: 1 | 2,
    records: Array<{ studentId: number; notes: string; tahfidzScore: number; tajweedScore: number }>,
    options?: { silent?: boolean }
  ) => {
    const testDate = new Date().toISOString().split('T')[0];
    const recordsToSync: TahfidzGrade[] = [];
    const nextList = [...tahfidzGradesRef.current];
    let nextId = Math.max(0, ...nextList.map((t) => t.id)) + 1;
    let reportsModified = false;
    const nextReports = [...reportCardsRef.current];

    records.forEach((r) => {
      const tfzScore = clampScore90(r.tahfidzScore);
      const tjwScore = clampScore90(r.tajweedScore);
      const total = clampScore90(Math.round((tfzScore + tjwScore) / 2));
      const stObj = studentsRef.current.find((s) => s.id === r.studentId);
      const effectiveClassId = stObj?.classId || classId;

      const existingIdx = nextList.findIndex(
        (t) => t.studentId === r.studentId && t.semester === semester
      );

      if (existingIdx >= 0) {
        const updated: TahfidzGrade = {
          ...nextList[existingIdx],
          classId: effectiveClassId,
          tahfidzScore: tfzScore,
          tajweedScore: tjwScore,
          totalScore: total,
          gradeLetter: calculateLetter(total),
          notes: r.notes || '',
          testDate,
        };
        nextList[existingIdx] = updated;
        recordsToSync.push(updated);
      } else {
        const created: TahfidzGrade = {
          id: nextId++,
          studentId: r.studentId,
          classId: effectiveClassId,
          semester,
          tahfidzScore: tfzScore,
          tajweedScore: tjwScore,
          totalScore: total,
          gradeLetter: calculateLetter(total),
          notes: r.notes || '',
          testDate,
        };
        nextList.push(created);
        recordsToSync.push(created);
      }

      // Keep ReportCardRecord tahfidzNotes synchronized if a report card already exists
      if (r.notes && r.notes.trim()) {
        const repId = `${r.studentId}_${semester}_${academicYearRef.current}`;
        const repIdx = nextReports.findIndex(
          (rep) =>
            rep.id === repId ||
            (rep.studentId === r.studentId && rep.semester === semester)
        );
        if (repIdx >= 0 && nextReports[repIdx].tahfidzNotes !== r.notes.trim()) {
          nextReports[repIdx] = {
            ...nextReports[repIdx],
            tahfidzNotes: r.notes.trim(),
            updatedAt: new Date().toISOString(),
          };
          reportsModified = true;
        }
      }
    });

    const dedupedList = normalizeTahfidzList(nextList);
    tahfidzGradesRef.current = dedupedList;
    setTahfidzGrades(dedupedList);
    localStorage.setItem('bw_tahfidz', JSON.stringify(dedupedList));

    if (reportsModified) {
      reportCardsRef.current = nextReports;
      setReportCards(nextReports);
      localStorage.setItem('bw_report_cards', JSON.stringify(nextReports));
    }

    scheduleSchoolConfigSync(true);

    const uid = auth.currentUser?.uid;
    if (uid && recordsToSync.length > 0) {
      Promise.all(
        recordsToSync.map(async (t) => {
          await ensureParentsInFirestore(uid, { classId: t.classId, studentId: t.studentId });
          await syncTahfidzToFirestore(uid, t);
        })
      ).then(() => markSynced());
    }

    if (!options?.silent) {
      showToast(`Berhasil menyimpan ${records.length} data hafalan tahfidz ke database & rapor!`);
    }
  };

  const updateTahfidzGrade = (
    id: number,
    data: { tahfidzScore: number; tajweedScore: number; notes: string; testDate: string },
    options?: { silent?: boolean }
  ) => {
    const existing = tahfidzGradesRef.current.find((t) => t.id === id);
    const tfzScore = clampScore90(data.tahfidzScore);
    const tjwScore = clampScore90(data.tajweedScore);
    const total = clampScore90(Math.round((tfzScore + tjwScore) / 2));
    const letter = calculateLetter(total);

    const nextList = normalizeTahfidzList(
      tahfidzGradesRef.current.map((t) =>
        t.id === id
          ? {
              ...t,
              tahfidzScore: tfzScore,
              tajweedScore: tjwScore,
              notes: data.notes,
              testDate: data.testDate,
              totalScore: total,
              gradeLetter: letter,
            }
          : t
      )
    );

    tahfidzGradesRef.current = nextList;
    setTahfidzGrades(nextList);
    localStorage.setItem('bw_tahfidz', JSON.stringify(nextList));

    if (existing && data.notes && data.notes.trim()) {
      const repId = `${existing.studentId}_${existing.semester}_${academicYearRef.current}`;
      const repIdx = reportCardsRef.current.findIndex(
        (rep) =>
          rep.id === repId ||
          (rep.studentId === existing.studentId && rep.semester === existing.semester)
      );
      if (repIdx >= 0) {
        const nextReports = [...reportCardsRef.current];
        nextReports[repIdx] = {
          ...nextReports[repIdx],
          tahfidzNotes: data.notes.trim(),
          updatedAt: new Date().toISOString(),
        };
        reportCardsRef.current = nextReports;
        setReportCards(nextReports);
        localStorage.setItem('bw_report_cards', JSON.stringify(nextReports));
      }
    }

    scheduleSchoolConfigSync(true);

    const uid = auth.currentUser?.uid;
    if (uid && existing) {
      ensureParentsInFirestore(uid, {
        classId: existing.classId,
        studentId: existing.studentId,
      }).then(() => {
        syncTahfidzToFirestore(uid, {
          ...existing,
          tahfidzScore: tfzScore,
          tajweedScore: tjwScore,
          notes: data.notes,
          testDate: data.testDate,
          totalScore: total,
          gradeLetter: letter,
        }).then(() => markSynced());
      });
    }
    if (!options?.silent) {
      showToast('Nilai tahfidz berhasil diperbarui ke database & rapor.');
    }
  };

  const deleteTahfidzGrade = (id: number, options?: { silent?: boolean }) => {
    const nextList = tahfidzGradesRef.current.filter((t) => t.id !== id);
    tahfidzGradesRef.current = nextList;
    setTahfidzGrades(nextList);
    localStorage.setItem('bw_tahfidz', JSON.stringify(nextList));
    scheduleSchoolConfigSync(true);
    const uid = auth.currentUser?.uid;
    if (uid) {
      deleteFirestoreDoc('tahfidz_grades', getTahfidzDocId(uid, id)).then(() => markSynced());
    }
    if (!options?.silent) {
      showToast('Data tahfidz dihapus.', 'info');
    }
  };

  // =========================================================
  // Exams CRUD
  // =========================================================

  const addExamFile = (
    subjectId: number,
    classId: number,
    title: string,
    fileName: string,
    fileSize: string
  ) => {
    const newId = Math.max(0, ...examFilesRef.current.map((f) => f.id)) + 1;
    const newFile: ExamFile = {
      id: newId,
      subjectId,
      classId,
      title,
      fileName,
      fileSize,
      uploadDate: new Date().toISOString().split('T')[0],
    };
    const nextList = [newFile, ...examFilesRef.current];
    examFilesRef.current = nextList;
    setExamFiles(nextList);
    localStorage.setItem('bw_exam_files', JSON.stringify(nextList));
    scheduleSchoolConfigSync();

    const uid = auth.currentUser?.uid;
    if (uid) {
      ensureParentsInFirestore(uid, { classId, subjectId }).then(() => {
        syncExamFileToFirestore(uid, newFile).then(() => markSynced());
      });
    }
    showToast(`File ujian "${fileName}" berhasil diunggah.`);
  };

  const updateExamFile = (id: number, data: Partial<ExamFile>) => {
    const existing = examFilesRef.current.find((f) => f.id === id);
    const nextList = examFilesRef.current.map((f) => (f.id === id ? { ...f, ...data } : f));
    examFilesRef.current = nextList;
    setExamFiles(nextList);
    localStorage.setItem('bw_exam_files', JSON.stringify(nextList));
    scheduleSchoolConfigSync();

    const uid = auth.currentUser?.uid;
    if (uid && existing) {
      const updated = { ...existing, ...data };
      ensureParentsInFirestore(uid, {
        classId: updated.classId,
        subjectId: updated.subjectId,
      }).then(() => {
        syncExamFileToFirestore(uid, updated).then(() => markSynced());
      });
    }
    showToast('Berkas naskah ujian berhasil diperbarui.');
  };

  const deleteExamFile = (id: number) => {
    const nextList = examFilesRef.current.filter((f) => f.id !== id);
    examFilesRef.current = nextList;
    setExamFiles(nextList);
    localStorage.setItem('bw_exam_files', JSON.stringify(nextList));
    scheduleSchoolConfigSync();
    const uid = auth.currentUser?.uid;
    if (uid) {
      deleteFirestoreDoc('exam_files', getExamFileDocId(uid, id));
    }
    showToast('File ujian berhasil dihapus.', 'info');
  };

  const addExamPackage = (data: Omit<ExamQuestionsPackage, 'id' | 'createdAt'>) => {
    const newId = Math.max(0, ...examPackagesRef.current.map((p) => p.id)) + 1;
    const newPkg: ExamQuestionsPackage = {
      id: newId,
      ...data,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const nextList = [newPkg, ...examPackagesRef.current];
    examPackagesRef.current = nextList;
    setExamPackages(nextList);
    localStorage.setItem('bw_exam_packages', JSON.stringify(nextList));
    scheduleSchoolConfigSync();

    const uid = auth.currentUser?.uid;
    if (uid) {
      ensureParentsInFirestore(uid, {
        classId: newPkg.classId,
        subjectId: newPkg.subjectId,
      }).then(() => {
        syncExamPackageToFirestore(uid, newPkg).then(() => markSynced());
      });
    }
    showToast(`Paket soal berhasil dibuat (${data.questions.length} soal).`);
  };

  const updateExamPackage = (id: number, data: Partial<ExamQuestionsPackage>) => {
    const existing = examPackagesRef.current.find((p) => p.id === id);
    const nextList = examPackagesRef.current.map((p) => (p.id === id ? { ...p, ...data } : p));
    examPackagesRef.current = nextList;
    setExamPackages(nextList);
    localStorage.setItem('bw_exam_packages', JSON.stringify(nextList));
    scheduleSchoolConfigSync();

    const uid = auth.currentUser?.uid;
    if (uid && existing) {
      const updated = { ...existing, ...data };
      ensureParentsInFirestore(uid, {
        classId: updated.classId,
        subjectId: updated.subjectId,
      }).then(() => {
        syncExamPackageToFirestore(uid, updated).then(() => markSynced());
      });
    }
    showToast('Paket soal berhasil diperbarui.');
  };

  const deleteExamPackage = (id: number) => {
    const nextList = examPackagesRef.current.filter((p) => p.id !== id);
    examPackagesRef.current = nextList;
    setExamPackages(nextList);
    localStorage.setItem('bw_exam_packages', JSON.stringify(nextList));
    scheduleSchoolConfigSync();
    const uid = auth.currentUser?.uid;
    if (uid) {
      deleteExamPackageWithQuestions(uid, id);
    }
    showToast('Paket soal berhasil dihapus.', 'info');
  };

  const deleteQuestionFromPackage = (packageId: number, questionId: number) => {
    const nextList = examPackagesRef.current.map((pkg) => {
      if (pkg.id === packageId) {
        const updatedQuestions = pkg.questions.filter((q) => q.id !== questionId);
        return { ...pkg, questions: updatedQuestions };
      }
      return pkg;
    });
    examPackagesRef.current = nextList;
    setExamPackages(nextList);
    localStorage.setItem('bw_exam_packages', JSON.stringify(nextList));
    scheduleSchoolConfigSync();

    const uid = auth.currentUser?.uid;
    if (uid) {
      const pkgDocId = getExamPackageDocId(uid, packageId);
      const qDocId = getExamQuestionDocId(questionId);
      deleteFirestoreDoc(`exam_packages/${pkgDocId}/questions`, qDocId);
    }
    showToast('Soal berhasil dihapus.');
  };

  const resetToSampleData = () => {
    subjectsRef.current = INITIAL_SUBJECTS;
    classesRef.current = INITIAL_CLASSES;
    studentsRef.current = INITIAL_STUDENTS;
    gradesRef.current = INITIAL_GRADES;
    tahfidzGradesRef.current = INITIAL_TAHFIDZ;
    examFilesRef.current = INITIAL_EXAM_FILES;
    examPackagesRef.current = INITIAL_EXAM_PACKAGES;
    reportCardsRef.current = INITIAL_REPORT_CARDS;
    const mergedUsers = mergeUserLists(
      [INITIAL_USERS, usersRef.current],
      deletedUsernamesRef.current
    );
    usersRef.current = mergedUsers;

    setSubjects(INITIAL_SUBJECTS);
    setClasses(INITIAL_CLASSES);
    setStudents(INITIAL_STUDENTS);
    setGrades(INITIAL_GRADES);
    setTahfidzGrades(INITIAL_TAHFIDZ);
    setExamFiles(INITIAL_EXAM_FILES);
    setExamPackages(INITIAL_EXAM_PACKAGES);
    setUsers(mergedUsers);
    setReportCards(INITIAL_REPORT_CARDS);

    if (isSuperAdminAccount(currentUserRef.current)) {
      siteSettingsRef.current = INITIAL_SITE_SETTINGS;
      themeSettingsRef.current = INITIAL_THEME_SETTINGS;
      applyThemeCssVariables(INITIAL_THEME_SETTINGS);
      setSiteSettings(INITIAL_SITE_SETTINGS);
      setThemeSettings(INITIAL_THEME_SETTINGS);
      localStorage.setItem('bw_site_settings', JSON.stringify(INITIAL_SITE_SETTINGS));
      localStorage.setItem('bw_theme_settings', JSON.stringify(INITIAL_THEME_SETTINGS));
    }
    scheduleSchoolConfigSync();

    const uid = auth.currentUser?.uid;
    if (uid) {
      seedFullWorkspaceToFirestore(uid, {
        siteSettings: siteSettingsRef.current,
        themeSettings: themeSettingsRef.current,
        academicYear: '2025/2026',
        users: mergedUsers,
        classes: INITIAL_CLASSES,
        subjects: INITIAL_SUBJECTS,
        students: INITIAL_STUDENTS,
        grades: INITIAL_GRADES,
        tahfidzGrades: INITIAL_TAHFIDZ,
        reportCards: INITIAL_REPORT_CARDS,
        examFiles: INITIAL_EXAM_FILES,
        examPackages: INITIAL_EXAM_PACKAGES,
        includeSchoolConfig: isSuperAdminAccount(currentUserRef.current),
      });
    }
    showToast('Data berhasil direset ke data sampel awal & disinkronkan.', 'info');
  };

  const announcements: AnnouncementItem[] =
    Array.isArray(siteSettings.announcements) && siteSettings.announcements.length > 0
      ? siteSettings.announcements
      : INITIAL_ANNOUNCEMENTS;

  const addAnnouncement = (data: Omit<AnnouncementItem, 'id' | 'date'>) => {
    if (!isSuperAdminUser(currentUserRef.current)) {
      showToast('Akses ditolak: Hanya Superadmin yang dapat mengelola pengumuman.', 'error');
      return;
    }
    const newItem: AnnouncementItem = {
      ...data,
      id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
    const currentList =
      Array.isArray(siteSettingsRef.current.announcements) &&
      siteSettingsRef.current.announcements.length > 0
        ? siteSettingsRef.current.announcements
        : INITIAL_ANNOUNCEMENTS;
    const nextList = newItem.isPinned
      ? [newItem, ...currentList.map((a) => ({ ...a, isPinned: false }))]
      : [newItem, ...currentList];

    const nextBannerText = newItem.isPinned
      ? `${newItem.title}: ${newItem.content}`
      : siteSettingsRef.current.announcement;

    updateSiteSettings(
      {
        announcements: nextList,
        announcement: nextBannerText,
      },
      { silent: true }
    );
    showToast('Pengumuman baru berhasil dipublikasikan & disinkronkan', 'success');
  };

  const updateAnnouncement = (id: string, patch: Partial<AnnouncementItem>) => {
    if (!isSuperAdminUser(currentUserRef.current)) {
      showToast('Akses ditolak: Hanya Superadmin yang dapat mengubah pengumuman.', 'error');
      return;
    }
    const currentList =
      Array.isArray(siteSettingsRef.current.announcements) &&
      siteSettingsRef.current.announcements.length > 0
        ? siteSettingsRef.current.announcements
        : INITIAL_ANNOUNCEMENTS;

    const nextList = currentList.map((item) => {
      if (item.id === id) {
        return { ...item, ...patch };
      }
      if (patch.isPinned) {
        return { ...item, isPinned: false };
      }
      return item;
    });

    const pinnedItem = nextList.find((item) => item.isPinned && item.isActive);
    const nextBannerText = pinnedItem
      ? `${pinnedItem.title}: ${pinnedItem.content}`
      : siteSettingsRef.current.announcement;

    updateSiteSettings(
      {
        announcements: nextList,
        announcement: nextBannerText,
      },
      { silent: true }
    );
    showToast('Pengumuman berhasil diperbarui', 'success');
  };

  const deleteAnnouncement = (id: string) => {
    if (!isSuperAdminUser(currentUserRef.current)) {
      showToast('Akses ditolak: Hanya Superadmin yang dapat menghapus pengumuman.', 'error');
      return;
    }
    const currentList =
      Array.isArray(siteSettingsRef.current.announcements) &&
      siteSettingsRef.current.announcements.length > 0
        ? siteSettingsRef.current.announcements
        : INITIAL_ANNOUNCEMENTS;
    const nextList = currentList.filter((item) => item.id !== id);
    const pinnedItem =
      nextList.find((item) => item.isPinned && item.isActive) ||
      nextList.find((item) => item.isActive);
    const nextBannerText = pinnedItem
      ? `${pinnedItem.title}: ${pinnedItem.content}`
      : siteSettingsRef.current.announcement;

    updateSiteSettings(
      {
        announcements: nextList,
        announcement: nextBannerText,
      },
      { silent: true }
    );
    showToast('Pengumuman telah dihapus', 'info');
  };

  const setPinnedAnnouncement = (id: string) => {
    if (!isSuperAdminUser(currentUserRef.current)) {
      showToast('Akses ditolak: Hanya Superadmin yang dapat menyematkan pengumuman.', 'error');
      return;
    }
    const currentList =
      Array.isArray(siteSettingsRef.current.announcements) &&
      siteSettingsRef.current.announcements.length > 0
        ? siteSettingsRef.current.announcements
        : INITIAL_ANNOUNCEMENTS;
    const nextList = currentList.map((item) => ({
      ...item,
      isPinned: item.id === id,
      isActive: item.id === id ? true : item.isActive,
    }));
    const target = nextList.find((item) => item.id === id);
    const nextBannerText = target
      ? `${target.title}: ${target.content}`
      : siteSettingsRef.current.announcement;

    updateSiteSettings(
      {
        announcements: nextList,
        announcement: nextBannerText,
      },
      { silent: true }
    );
    if (!themeSettingsRef.current.showAnnouncement) {
      updateThemeSettings({ showAnnouncement: true }, { silent: true });
    }
    showToast('Pengumuman disematkan ke Banner Utama Web', 'success');
  };

  const openSuperAdminAnnouncements = () => {
    handleSetCurrentView('manage');
    setManageTab('superadmin');
    setSuperAdminFocusSection('announcements');
  };

  const saveStudentAttendance = (records: StudentAttendanceRecord[]) => {
    const map = new Map(studentAttendanceRef.current.map((r) => [r.id, r]));
    records.forEach((r) => {
      map.set(r.id, { ...r, updatedAt: new Date().toISOString() });
    });
    const updated = Array.from(map.values());
    studentAttendanceRef.current = updated;
    setStudentAttendance(updated);
    localStorage.setItem('bw_student_attendance', JSON.stringify(updated));
    scheduleSchoolConfigSync();
    showToast('Presensi santri berhasil disimpan & disinkronkan!', 'success');
  };

  const saveTeacherAttendance = (record: TeacherAttendanceRecord) => {
    const prev = teacherAttendanceRef.current;
    const idx = prev.findIndex(
      (r) => r.id === record.id || (r.teacherId === record.teacherId && r.date === record.date)
    );
    let updated: TeacherAttendanceRecord[];
    if (idx >= 0) {
      updated = [...prev];
      updated[idx] = { ...record, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...record, updatedAt: new Date().toISOString() }, ...prev];
    }
    teacherAttendanceRef.current = updated;
    setTeacherAttendance(updated);
    localStorage.setItem('bw_teacher_attendance', JSON.stringify(updated));
    scheduleSchoolConfigSync();
    showToast(`Presensi ${record.teacherName} dicatat & disinkronkan!`, 'success');
  };

  const syncAttendanceToReportCards = (classId: number, semester: 1 | 2): number => {
    const classStudents = studentsRef.current.filter((s) => s.id > 0 && s.classId === classId);
    if (classStudents.length === 0) return 0;

    let updatedCount = 0;
    classStudents.forEach((student) => {
      const studentRecords = studentAttendanceRef.current.filter((r) => r.studentId === student.id);
      const sickCount = studentRecords.filter((r) => r.status === 'S').length;
      const permissionCount = studentRecords.filter((r) => r.status === 'I').length;
      const unexcusedCount = studentRecords.filter((r) => r.status === 'A').length;

      const reportId = `${student.id}_${semester}_${academicYearRef.current}`;
      const existing = reportCardsRef.current.find((r) => r.id === reportId);
      if (existing) {
        saveReportCard(
          {
            ...existing,
            attendance: {
              sick: sickCount,
              permission: permissionCount,
              unexcused: unexcusedCount,
            },
            updatedAt: new Date().toISOString(),
          },
          { silent: true }
        );
        updatedCount++;
      } else {
        const clsObj = classesRef.current.find((c) => c.id === classId);
        saveReportCard(
          {
            id: reportId,
            studentId: student.id,
            classId: classId,
            semester: semester,
            academicYear: academicYearRef.current,
            status: 'draft',
            attendance: {
              sick: sickCount,
              permission: permissionCount,
              unexcused: unexcusedCount,
            },
            teacherNotes: '',
            spiritualAttitude: 'B',
            spiritualDescription: 'Menaati tata tertib ibadah dan adab harian dengan baik.',
            socialAttitude: 'B',
            socialDescription: 'Menunjukkan sikap santun dan toleransi antar sesama santri.',
            extracurriculars: [],
            issuePlace: siteSettingsRef.current.defaultIssuePlace || 'Bandung',
            issueDate: new Date().toLocaleDateString('id-ID'),
            headmasterName: siteSettingsRef.current.headmasterName || 'Muhammad Siroj, S.Pd.I',
            headmasterNip: siteSettingsRef.current.headmasterNip || '',
            classTeacherName: clsObj?.teacher || 'Wali Kelas',
            updatedAt: new Date().toISOString(),
          },
          { silent: true }
        );
        updatedCount++;
      }
    });

    showToast(`Berhasil menyinkronkan data presensi ${updatedCount} santri ke Rapor Digital!`, 'success');
    return updatedCount;
  };

  const saveTeachingAssignment = (assignment: TeachingAssignment) => {
    const prev = teachingAssignmentsRef.current;
    const idx = prev.findIndex((a) => a.id === assignment.id);
    let updated: TeachingAssignment[];
    if (idx >= 0) {
      updated = [...prev];
      updated[idx] = { ...assignment, updatedAt: new Date().toISOString() };
    } else {
      updated = [...prev, { ...assignment, updatedAt: new Date().toISOString() }];
    }
    teachingAssignmentsRef.current = updated;
    setTeachingAssignments(updated);
    localStorage.setItem('bw_teaching_assignments', JSON.stringify(updated));
    scheduleSchoolConfigSync();
    showToast('Jadwal pelajaran & guru pengampu berhasil disimpan & disinkronkan!', 'success');
  };

  const deleteTeachingAssignment = (id: string) => {
    const updated = teachingAssignmentsRef.current.filter((a) => a.id !== id);
    teachingAssignmentsRef.current = updated;
    setTeachingAssignments(updated);
    localStorage.setItem('bw_teaching_assignments', JSON.stringify(updated));
    scheduleSchoolConfigSync();
    showToast('Penugasan pelajaran dihapus & disinkronkan', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isSuperAdmin,
        firebaseUser,
        isAuthReady,
        isCloudSynced,
        isSyncing,
        lastSyncedAt,
        connectGoogleCloudSync: () => connectGoogleCloudSync(false),
        forceSyncAllToCloud,
        users,
        login,
        loginWithGoogle,
        register,
        forgotPassword,
        logout,
        updateProfile,
        changePassword,
        addUser,
        updateUserRecord,
        deleteUser,
        resetUserPassword,
        siteSettings,
        updateSiteSettings,
        themeSettings,
        themeClasses,
        isDeviceDarkMode,
        setDeviceDarkMode,
        toggleDeviceDarkMode,
        updateThemeSettings,
        updateSchoolConfig,
        saveSchoolConfig,
        resetThemeSettings,
        isThemeModalOpen,
        setIsThemeModalOpen: handleSetIsThemeModalOpen,
        exportDatabaseJSON,
        importDatabaseJSON,
        updateDatabaseTable,
        clearAllGrades,
        announcements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        setPinnedAnnouncement,
        superAdminFocusSection,
        setSuperAdminFocusSection,
        openSuperAdminAnnouncements,
        currentView,
        setCurrentView: handleSetCurrentView,
        formUasTab,
        setFormUasTab,
        manageTab,
        setManageTab,
        academicYear,
        setAcademicYear,
        viewMode,
        setViewMode,
        subjects,
        classes,
        students,
        grades,
        tahfidzGrades,
        reportCards,
        saveReportCard,
        deleteReportCard,
        generateClassReportCards,
        examFiles,
        examPackages,
        studentAttendance,
        teacherAttendance,
        teachingAssignments,
        saveStudentAttendance,
        saveTeacherAttendance,
        syncAttendanceToReportCards,
        saveTeachingAssignment,
        deleteTeachingAssignment,
        addSubject,
        updateSubject,
        deleteSubject,
        addClass,
        updateClass,
        deleteClass,
        addStudent,
        updateStudent,
        deleteStudent,
        saveBulkGrades,
        saveStudentGradesBatch,
        updateGrade,
        deleteGrade,
        saveBulkTahfidz,
        updateTahfidzGrade,
        deleteTahfidzGrade,
        addExamFile,
        updateExamFile,
        deleteExamFile,
        addExamPackage,
        updateExamPackage,
        deleteExamPackage,
        deleteQuestionFromPackage,
        toasts,
        showToast,
        addToast: showToast,
        removeToast,
        resetToSampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
