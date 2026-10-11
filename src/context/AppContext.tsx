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
  getUserProfileDocId,
  normalizeUserId,
  normalizeUserRecord,
  normalizeUsersList,
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
import { getThemeClasses, ThemeClasses, applyThemeCssVariables } from '../utils/theme';

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
  addUser: (username: string, fullName: string, email: string, role: User['role']) => void;
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bw_user');
    if (!saved) return INITIAL_USER;
    try {
      return normalizeUserRecord(JSON.parse(saved));
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
    if (!saved) return INITIAL_USERS;
    try {
      return normalizeUsersList(JSON.parse(saved), INITIAL_USERS);
    } catch {
      return INITIAL_USERS;
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
    return saved ? JSON.parse(saved) : INITIAL_THEME_SETTINGS;
  });

  const [isDeviceDarkMode, setIsDeviceDarkModeState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('bw_device_dark_mode');
    return saved === 'dark';
  });
  const isDeviceDarkModeRef = useRef<boolean>(isDeviceDarkMode);
  isDeviceDarkModeRef.current = isDeviceDarkMode;

  const setDeviceDarkMode = (enabled: boolean) => {
    setIsDeviceDarkModeState(enabled);
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
  const [manageTab, setManageTab] = useState<'subjects' | 'classes' | 'students' | 'superadmin'>('superadmin');
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

  const lastLocalConfigWriteRef = useRef<number>(0);
  const configSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verifiedParentDocsRef = useRef<Set<string>>(new Set());

  currentUserRef.current = currentUser;
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

  const isSuperAdminUser = (u: User | null): boolean =>
    Boolean(u && (u.role === 'superadmin' || u.username.toLowerCase() === 'superadmin'));
  const isSuperAdminAccount = isSuperAdminUser;

  const themeClasses = getThemeClasses(themeSettings);

  const markSynced = () => {
    setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
  };

  const applyRemoteSchoolConfig = (d: Record<string, any>) => {
    const { siteExtra, themeExtra } = parseExtendedSchoolConfig(d);
    const nextYear = String(d.academicYear || '2025/2026');
    academicYearRef.current = nextYear;
    setAcademicYearState(nextYear);

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
      return nextSite;
    });

    setThemeSettings((prev) => {
      const nextTheme: ThemeSettings = {
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
        customLogoUrl: String(d.customLogoUrl || prev.customLogoUrl || ''),
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
      };
      themeSettingsRef.current = nextTheme;
      applyThemeCssVariables(nextTheme, isDeviceDarkModeRef.current);
      return nextTheme;
    });
    markSynced();
  };

  // Debounced unified school_configs sync (restricted strictly to Superadmin)
  const scheduleSchoolConfigSync = () => {
    if (!isSuperAdminUser(currentUserRef.current) || isFirestoreQuotaExhausted()) return;
    lastLocalConfigWriteRef.current = Date.now();
    if (configSyncTimerRef.current) {
      clearTimeout(configSyncTimerRef.current);
    }
    configSyncTimerRef.current = setTimeout(async () => {
      const uid = auth.currentUser?.uid;
      if (!uid || isFirestoreQuotaExhausted()) return;
      try {
        setIsSyncing(true);
        await syncSchoolConfigToFirestore(
          uid,
          siteSettingsRef.current,
          themeSettingsRef.current,
          academicYearRef.current
        );
        markSynced();
      } finally {
        setIsSyncing(false);
      }
    }, 800);
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

  // Sync to localStorage as fast local cache & close theme modal if not superadmin
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bw_user', JSON.stringify(currentUser));
      if (!isSuperAdminUser(currentUser)) {
        setIsThemeModalOpen(false);
      }
    } else {
      localStorage.removeItem('bw_user');
      setIsThemeModalOpen(false);
    }
  }, [currentUser]);

  // Cross-tab instant synchronization via storage event for all 11 tables
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        switch (e.key) {
          case 'bw_theme_settings': {
            const parsedTheme = JSON.parse(e.newValue) as ThemeSettings;
            themeSettingsRef.current = parsedTheme;
            applyThemeCssVariables(parsedTheme);
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
            setUsers(JSON.parse(e.newValue) as User[]);
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

  // Global real-time theme & school config listener for ALL users (including local educators)
  useEffect(() => {
    const globalConfigRef = doc(db, 'school_configs', GLOBAL_SCHOOL_CONFIG_DOC_ID);
    const unsubscribeGlobal = onSnapshot(
      globalConfigRef,
      (snap) => {
        if (snap.exists()) {
          markDocKnownInFirestore('school_configs', GLOBAL_SCHOOL_CONFIG_DOC_ID);
        }
        if (
          snap.metadata.hasPendingWrites ||
          Date.now() - lastLocalConfigWriteRef.current < 2500
        ) {
          return;
        }
        if (snap.exists()) {
          applyRemoteSchoolConfig(snap.data());
        }
      },
      () => {
        // Ignore read error if offline or rules not yet propagated
      }
    );
    return () => unsubscribeGlobal();
  }, []);

  const recordDatabaseMutation = () => {
    setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
  };

  useEffect(() => {
    localStorage.setItem('bw_users_list', JSON.stringify(users));
    recordDatabaseMutation();
  }, [users]);

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
        const email = fbUser.email || 'pendidik@baiturrahman.sch.id';
        const isBootstrappedAdmin =
          email === 'nasam998@gmail.com' ||
          email === 'akhirzaman998@gmail.com' ||
          email === 'mediabaiturrahman01@gmail.com';
        setCurrentUser((prev) => {
          // Keep existing logged-in user (e.g., abuza, ridwan, hilal, or superadmin) or stay on login screen if explicitly logged out
          if (prev) return prev;
          if (localStorage.getItem('bw_explicit_logout') === '1') return null;

          const mappedUser: User = {
            id: `usr-${fbUser.uid.slice(0, 8)}`,
            username: isBootstrappedAdmin ? 'superadmin' : email.split('@')[0],
            fullName: fbUser.displayName || 'Pendidik Baiturrahman',
            email,
            avatarUrl:
              fbUser.photoURL ||
              '/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg',
            role: isBootstrappedAdmin ? 'superadmin' : 'guru',
            joinedDate: new Date().toLocaleDateString('id-ID'),
          };
          return mappedUser;
        });
      } else {
        setIsCloudSynced(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // =========================================================
  // 2. Real-Time Firestore Listeners (onSnapshot)
  // =========================================================
  useEffect(() => {
    if (!isAuthReady || !firebaseUser || !firebaseUser.emailVerified) {
      setIsCloudSynced(false);
      return;
    }

    const uid = firebaseUser.uid;
    let isCancelled = false;
    let hasCheckedInitialSeed = false;
    const unsubscribes: Array<() => void> = [];
    const questionUnsubscribes = new Map<string, () => void>();

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

        // 2. users listener
        unsubscribes.push(
          onSnapshot(
            query(collection(db, 'users'), where('ownerId', '==', uid)),
            (snap) => {
              if (!snap.empty) {
                const validUsers: User[] = [];
                snap.docs.forEach((docSnap) => {
                  markDocKnownInFirestore('users', docSnap.id);
                  const d = docSnap.data();
                  const username = String(d.username || '');
                  const cleanId = normalizeUserId(String(d.docId || docSnap.id), username);
                  const mapped: User = {
                    id: cleanId,
                    username,
                    fullName: String(d.fullName || ''),
                    email: String(d.email || ''),
                    avatarUrl: String(
                      d.avatarUrl || '/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg'
                    ),
                    role: (d.StaffRole as User['role']) || 'guru',
                    joinedDate: String(d.joinedDate || ''),
                  };

                  if (isCorruptedUserDocId(uid, docSnap.id, mapped) && !isFirestoreQuotaExhausted()) {
                    deleteFirestoreDoc('users', docSnap.id).catch(() => {});
                    syncUserProfileToFirestore(uid, mapped).catch(() => {});
                  }
                  validUsers.push(mapped);
                });

                setUsers(normalizeUsersList(validUsers, INITIAL_USERS));
                setIsCloudSynced(true);
                markSynced();
              }
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
                    users,
                    classes: classesRef.current,
                    subjects: subjectsRef.current,
                    students: studentsRef.current,
                    grades: gradesRef.current,
                    tahfidzGrades: tahfidzGradesRef.current,
                    reportCards: reportCardsRef.current,
                    examFiles: examFilesRef.current,
                    examPackages: examPackagesRef.current,
                    includeSchoolConfig: isSuperAdminUser(currentUserRef.current),
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

              if (list.length > 0 || !seedingRef.current) {
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
              if (list.length > 0 || !seedingRef.current) {
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
              if (list.length > 0 || !seedingRef.current) {
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
              if (list.length > 0 || !seedingRef.current) {
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
              if (list.length > 0 || !seedingRef.current) {
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
              if (list.length > 0 || !seedingRef.current) {
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
              examFilesRef.current = list;
              setExamFiles(list);
              setIsCloudSynced(true);
              markSynced();
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

                      setExamPackages((prev) =>
                        prev.map((p) => (p.id === pkgId ? { ...p, questions } : p))
                      );
                      markSynced();
                    },
                    (err) => handleFirestoreError(err, OperationType.LIST, qPath)
                  );
                  questionUnsubscribes.set(pkgDocId, qUnsub);
                }
              });

              // Clean up removed packages
              const validNumericIds = new Set(snap.docs.map((d) => Number(d.data().id)));
              setExamPackages((prev) => prev.filter((p) => validNumericIds.has(p.id)));

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

  const connectGoogleCloudSync = async (): Promise<boolean> => {
    try {
      setIsSyncing(true);
      await resetFirestoreQuotaState();
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const email = fbUser.email || 'pendidik@baiturrahman.sch.id';
      const isBootstrappedAdmin =
        email === 'nasam998@gmail.com' ||
        email === 'akhirzaman998@gmail.com' ||
        email === 'mediabaiturrahman01@gmail.com';

      const googleUser: User = {
        id: `usr-${fbUser.uid.slice(0, 8)}`,
        username: isBootstrappedAdmin ? 'superadmin' : email.split('@')[0],
        fullName: fbUser.displayName || 'Pendidik Baiturrahman',
        email,
        avatarUrl:
          fbUser.photoURL || '/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg',
        role: isBootstrappedAdmin ? 'superadmin' : 'guru',
        joinedDate: new Date().toLocaleDateString('id-ID'),
      };

      localStorage.removeItem('bw_explicit_logout');
      setCurrentUser(googleUser);
      showToast(`Sinkronisasi Realtime aktif dengan akun ${email}`, 'success');
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
    await resetFirestoreQuotaState();
    const uid = auth.currentUser?.uid;
    if (!uid) {
      await connectGoogleCloudSync();
      return;
    }
    try {
      setIsSyncing(true);
      await seedFullWorkspaceToFirestore(uid, {
        siteSettings: siteSettingsRef.current,
        themeSettings: themeSettingsRef.current,
        academicYear: academicYearRef.current,
        users,
        classes: classesRef.current,
        subjects: subjectsRef.current,
        students: studentsRef.current,
        grades: gradesRef.current,
        tahfidzGrades: tahfidzGradesRef.current,
        reportCards: reportCardsRef.current,
        examFiles: examFilesRef.current,
        examPackages: examPackagesRef.current,
        includeSchoolConfig: isSuperAdminAccount(currentUserRef.current),
        onlyIfMissing: false,
      });
      setIsSyncing(false);
      setIsCloudSynced(true);
      markSynced();
      showToast('Seluruh data berhasil disinkronkan secara real-time ke Cloud Firestore!', 'success');
    } catch (err) {
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

    if (cleanUsername === 'superadmin') {
      if (cleanPassword === 'superadmin123') {
        localStorage.removeItem('bw_explicit_logout');
        setCurrentUser(SUPERADMIN_USER);
        showToast('Login berhasil sebagai Super Administrator!', 'success');
        return { success: true };
      } else {
        return { success: false, message: 'Password akun superadmin salah. Gunakan superadmin123' };
      }
    }

    const foundUser = users.find((u) => u.username.toLowerCase() === cleanUsername);
    if (foundUser) {
      localStorage.removeItem('bw_explicit_logout');
      setCurrentUser(foundUser);
      showToast(`Selamat datang kembali, ${foundUser.fullName}!`, 'success');
      return { success: true };
    }

    if (cleanUsername) {
      const user: User = {
        ...INITIAL_USER,
        username: cleanUsername,
        fullName: cleanUsername === 'abuza' ? 'Muhammad Siroj' : username,
      };
      localStorage.removeItem('bw_explicit_logout');
      setCurrentUser(user);
      showToast(`Selamat datang, ${user.fullName}!`, 'success');
      return { success: true };
    }

    return { success: false, message: 'Username tidak boleh kosong.' };
  };

  const loginWithGoogle = async () => {
    await connectGoogleCloudSync();
  };

  const register = (username: string, fullName: string, _password: string) => {
    if (!username.trim() || !fullName.trim()) return false;
    const cleanUsername = username.toLowerCase().trim();

    const newUser: User = {
      id: 'usr-' + Date.now(),
      username: cleanUsername,
      fullName: fullName.trim(),
      avatarUrl: '/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg',
      role: 'guru',
      joinedDate: new Date().toLocaleDateString('id-ID'),
    };

    localStorage.removeItem('bw_explicit_logout');
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    const uid = auth.currentUser?.uid;
    if (uid) {
      syncUserProfileToFirestore(uid, newUser);
    }
    showToast('Akun berhasil dibuat dan berhasil masuk!', 'success');
    return true;
  };

  const forgotPassword = (_username: string, _newPassword: string) => {
    showToast('Password berhasil diperbarui. Silakan login kembali.', 'success');
    return true;
  };

  const logout = () => {
    localStorage.setItem('bw_explicit_logout', '1');
    setIsThemeModalOpen(false);
    setCurrentUser(null);
    showToast('Anda telah keluar.', 'info');
  };

  const updateProfile = (fullName: string, avatarUrl?: string) => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      fullName,
      avatarUrl: avatarUrl || currentUser.avatarUrl,
    };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    const uid = auth.currentUser?.uid;
    if (uid) {
      syncUserProfileToFirestore(uid, updated);
    }
    showToast('Profil berhasil diperbarui.', 'success');
  };

  const changePassword = (_oldPassword: string, _newPassword: string) => {
    showToast('Password Anda berhasil diubah.', 'success');
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

  const addUser = (username: string, fullName: string, email: string, role: User['role']) => {
    const newUser: User = {
      id: 'usr-' + Date.now(),
      username: username.toLowerCase().trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      avatarUrl: '/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg',
      role,
      joinedDate: new Date().toLocaleDateString('id-ID'),
    };
    setUsers((prev) => [...prev, newUser]);
    const uid = auth.currentUser?.uid;
    if (uid) {
      syncUserProfileToFirestore(uid, newUser);
    }
    showToast(`Pengguna "${fullName}" berhasil ditambahkan.`, 'success');
  };

  const updateUserRecord = (id: string, patch: Partial<User>) => {
    if (!isSuperAdminAccount(currentUserRef.current)) {
      showToast('Akses ditolak: Hanya Super Admin yang dapat mengubah data akun pengguna.', 'error');
      return;
    }
    setUsers((prev) => {
      const nextList = prev.map((u) => {
        if (u.id !== id) return u;
        const updated: User = {
          ...u,
          ...patch,
          id: u.id,
          username: (patch.username ?? u.username).toLowerCase().trim(),
          fullName: (patch.fullName ?? u.fullName).trim(),
          email: (patch.email ?? u.email ?? '').trim(),
          role: u.id === 'usr-superadmin' ? 'superadmin' : (patch.role ?? u.role),
        };
        const uid = auth.currentUser?.uid;
        if (uid) {
          syncUserProfileToFirestore(uid, updated);
        }
        if (currentUserRef.current?.id === u.id) {
          setCurrentUser(updated);
        }
        return updated;
      });
      return nextList;
    });
    showToast('Data pengguna berhasil diperbarui di database.', 'success');
  };

  const deleteUser = (id: string) => {
    if (id === 'usr-superadmin') {
      showToast('Akun Super Admin tidak boleh dihapus!', 'error');
      return;
    }
    const targetUser = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    const uid = auth.currentUser?.uid;
    if (uid) {
      const docId = getUserProfileDocId(uid, id, targetUser?.username);
      deleteFirestoreDoc('users', docId);
    }
    showToast('Akun pengguna berhasil dihapus.', 'info');
  };

  const resetUserPassword = (_id: string, _newPass: string) => {
    showToast('Password pengguna berhasil direset.', 'success');
  };

  const updateThemeSettings = (
    newSettings: Partial<ThemeSettings>,
    options?: { silent?: boolean }
  ) => {
    const keys = Object.keys(newSettings);
    const isDarkToggle =
      newSettings.surfaceMode === 'dark_elevated' ||
      newSettings.surfaceThemeMode === 'dark_slate';
    const isLightToggle =
      (newSettings.surfaceMode === 'light' || newSettings.surfaceThemeMode === 'light') &&
      isDeviceDarkModeRef.current;

    if (isDarkToggle) {
      setDeviceDarkMode(true);
      if (!options?.silent) {
        showToast('Mode Malam aktif untuk perangkat ini.', 'success');
      }
      return;
    }

    if (isLightToggle && keys.length <= 2) {
      setDeviceDarkMode(false);
      if (!options?.silent) {
        showToast('Mode Terang aktif untuk perangkat ini.', 'success');
      }
      return;
    }

    if (!isSuperAdminAccount(currentUserRef.current)) {
      if (!options?.silent) {
        showToast('Hanya Super Admin yang dapat mengubah tema tampilan web.', 'error');
      }
      return;
    }

    const normalizedPatch: Partial<ThemeSettings> = { ...newSettings };
    if (normalizedPatch.surfaceMode === 'dark_elevated') {
      delete normalizedPatch.surfaceMode;
    }
    if (normalizedPatch.surfaceThemeMode === 'dark_slate') {
      delete normalizedPatch.surfaceThemeMode;
    }

    const updated = { ...themeSettingsRef.current, ...normalizedPatch };
    themeSettingsRef.current = updated;
    applyThemeCssVariables(updated, isDeviceDarkModeRef.current);
    setThemeSettings(updated);
    localStorage.setItem('bw_theme_settings', JSON.stringify(updated));
    if (isSuperAdminAccount(currentUserRef.current)) {
      scheduleSchoolConfigSync();
    }
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
      const nextTheme = { ...themeSettingsRef.current, ...patch.themeSettings };
      themeSettingsRef.current = nextTheme;
      applyThemeCssVariables(nextTheme, isDeviceDarkModeRef.current);
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
    themeSettingsRef.current = INITIAL_THEME_SETTINGS;
    applyThemeCssVariables(INITIAL_THEME_SETTINGS);
    setThemeSettings(INITIAL_THEME_SETTINGS);
    localStorage.setItem('bw_theme_settings', JSON.stringify(INITIAL_THEME_SETTINGS));
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
      setCurrentView('manage');
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
          r.classId === record.classId &&
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
    const uid = auth.currentUser?.uid;
    if (uid) {
      deleteFirestoreDoc('report_cards', getReportCardDocId(uid, id)).then(() => markSynced());
    }
    showToast('Data rapor digital dihapus dari database.', 'info');
  };

  const generateClassReportCards = (classId: number, semester: 1 | 2): number => {
    const classObj = classesRef.current.find((c) => c.id === classId);
    const classStudentList = studentsRef.current.filter((s) => s.classId === classId);
    if (!classStudentList.length) {
      showToast('Tidak ada siswa di kelas yang dipilih.', 'error');
      return 0;
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const recordsToSync: ReportCardRecord[] = [];
    const newReports = [...reportCardsRef.current];

    classStudentList.forEach((st) => {
      const repId = `${st.id}_${semester}_${academicYearRef.current}`;
      const existingIdx = newReports.findIndex((r) => r.id === repId);

      const studentTahfidz = tahfidzGradesRef.current.find(
        (t) => t.studentId === st.id && t.semester === semester
      );

      const defaultReport: ReportCardRecord = {
        id: repId,
        studentId: st.id,
        classId: classId,
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
        classTeacherName: classObj?.teacher || 'Wali Kelas',
        updatedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        const updatedExisting: ReportCardRecord = {
          ...newReports[existingIdx],
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

    const uid = auth.currentUser?.uid;
    if (uid && recordsToSync.length > 0) {
      Promise.all(
        recordsToSync.map(async (r) => {
          await ensureParentsInFirestore(uid, { classId: r.classId, studentId: r.studentId });
          await syncReportCardToFirestore(uid, r);
        })
      ).then(() => markSynced());
    }

    showToast(`Rapor untuk ${classStudentList.length} santri kelas siap diterbitkan & disinkronkan!`, 'success');
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
      const nextUsers = data.users || users;
      const nextClasses = data.classes || classes;
      const nextSubjects = data.subjects || subjects;
      const nextStudents = data.students || students;
      const nextGrades = data.grades || grades;
      const nextTahfidz = data.tahfidzGrades || tahfidzGrades;
      const nextReports = data.reportCards || reportCards;
      const nextExamFiles = data.examFiles || examFiles;
      const nextExamPackages = data.examPackages || examPackages;

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
          setUsers(payload);
          localStorage.setItem('bw_users_list', JSON.stringify(payload));
          if (uid) {
            runInChunks(payload as User[], 15, (u) => syncUserProfileToFirestore(uid, u)).then(() =>
              markSynced()
            );
          }
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
    const oldGrades = [...grades];
    const oldTahfidz = [...tahfidzGrades];
    setGrades([]);
    setTahfidzGrades([]);

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
    const newId = Math.max(0, ...subjects.map((s) => s.id)) + 1;
    const newSub: Subject = { id: newId, name: name.trim(), category };
    setSubjects((prev) => [newSub, ...prev]);

    const uid = auth.currentUser?.uid;
    if (uid) {
      syncSubjectToFirestore(uid, newSub);
    }
    showToast(`Mata pelajaran "${name}" berhasil ditambahkan.`);
  };

  const updateSubject = (id: number, name: string, category?: Subject['category']) => {
    const existing = subjects.find((s) => s.id === id);
    const updatedSub: Subject = {
      id,
      name: name.trim(),
      category: category || existing?.category || 'Diniyah',
    };
    setSubjects((prev) => prev.map((s) => (s.id === id ? updatedSub : s)));

    const uid = auth.currentUser?.uid;
    if (uid) {
      syncSubjectToFirestore(uid, updatedSub);
    }
    showToast('Mata pelajaran berhasil diubah.');
  };

  const deleteSubject = (id: number) => {
    const sub = subjects.find((s) => s.id === id);
    const relatedGrades = grades.filter((g) => g.subjectId === id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setGrades((prev) => prev.filter((g) => g.subjectId !== id));

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
    const newId = Math.max(0, ...classes.map((c) => c.id)) + 1;
    const newCls: ClassRoom = { id: newId, name: name.trim(), teacher: teacher.trim() };
    setClasses((prev) => [...prev, newCls]);

    const uid = auth.currentUser?.uid;
    if (uid) {
      syncClassToFirestore(uid, newCls);
    }
    showToast(`Kelas "${name}" berhasil ditambahkan.`);
  };

  const updateClass = (id: number, name: string, teacher: string) => {
    const updatedCls: ClassRoom = { id, name: name.trim(), teacher: teacher.trim() };
    setClasses((prev) => prev.map((c) => (c.id === id ? updatedCls : c)));

    const uid = auth.currentUser?.uid;
    if (uid) {
      syncClassToFirestore(uid, updatedCls);
    }
    showToast('Data kelas berhasil diperbarui.');
  };

  const deleteClass = (id: number) => {
    const cls = classes.find((c) => c.id === id);
    const relStudents = students.filter((s) => s.classId === id);
    const relGrades = grades.filter((g) => g.classId === id);
    const relTahfidz = tahfidzGrades.filter((t) => t.classId === id);

    setClasses((prev) => prev.filter((c) => c.id !== id));
    setStudents((prev) => prev.filter((s) => s.classId !== id));
    setGrades((prev) => prev.filter((g) => g.classId !== id));
    setTahfidzGrades((prev) => prev.filter((t) => t.classId !== id));

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

    const uid = auth.currentUser?.uid;
    if (uid) {
      ensureParentsInFirestore(uid, { classId: updatedStud.classId }).then(() => {
        syncStudentToFirestore(uid, updatedStud).then(() => markSynced());
      });
    }
    showToast('Data siswa berhasil diperbarui.');
  };

  const deleteStudent = (id: number) => {
    const stud = students.find((s) => s.id === id);
    const relGrades = grades.filter((g) => g.studentId === id);
    const relTahfidz = tahfidzGrades.filter((t) => t.studentId === id);

    setStudents((prev) => prev.filter((s) => s.id !== id));
    setGrades((prev) => prev.filter((g) => g.studentId !== id));
    setTahfidzGrades((prev) => prev.filter((t) => t.studentId !== id));

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

    Object.entries(gradesData).forEach(([studentIdStr, score]) => {
      const studentId = parseInt(studentIdStr, 10);
      if (!isNaN(score) && score >= 0) {
        const existingIdx = nextList.findIndex(
          (g) =>
            g.studentId === studentId &&
            g.subjectId === subjectId &&
            g.classId === classId &&
            g.semester === semester
        );

        if (existingIdx >= 0) {
          const updated: Grade = {
            ...nextList[existingIdx],
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
            classId,
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

    gradesRef.current = nextList;
    setGrades(nextList);
    localStorage.setItem('bw_grades', JSON.stringify(nextList));

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
        `Berhasil menyimpan nilai untuk ${Object.keys(gradesData).length} santri ke database!`
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

      if (existingIdx >= 0) {
        if (nextList[existingIdx].score !== scoreOrNull) {
          const updated: Grade = {
            ...nextList[existingIdx],
            score: scoreOrNull,
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
          classId,
          semester,
          score: scoreOrNull,
          testDate,
          type: 'regular',
        };
        nextList.push(created);
        gradesToUpsert.push(created);
      }
    });

    gradesRef.current = nextList;
    setGrades(nextList);
    localStorage.setItem('bw_grades', JSON.stringify(nextList));

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
      showToast('Nilai mata pelajaran agama & umum berhasil disimpan ke database!');
    }
  };

  const updateGrade = (id: number, score: number, options?: { silent?: boolean }) => {
    const existing = gradesRef.current.find((g) => g.id === id);
    const nextList = gradesRef.current.map((g) => (g.id === id ? { ...g, score } : g));
    gradesRef.current = nextList;
    setGrades(nextList);
    localStorage.setItem('bw_grades', JSON.stringify(nextList));

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
      showToast('Nilai berhasil diperbarui ke database.');
    }
  };

  const deleteGrade = (id: number, options?: { silent?: boolean }) => {
    const nextList = gradesRef.current.filter((g) => g.id !== id);
    gradesRef.current = nextList;
    setGrades(nextList);
    localStorage.setItem('bw_grades', JSON.stringify(nextList));

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
    if (avg >= 86) return 'A';
    if (avg >= 81) return 'B';
    if (avg >= 71) return 'C';
    if (avg >= 60) return 'D';
    return 'E';
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

    records.forEach((r) => {
      const total = Math.round((r.tahfidzScore + r.tajweedScore) / 2);
      const existingIdx = nextList.findIndex(
        (t) =>
          t.studentId === r.studentId &&
          t.classId === classId &&
          t.semester === semester
      );

      if (existingIdx >= 0) {
        const updated: TahfidzGrade = {
          ...nextList[existingIdx],
          tahfidzScore: r.tahfidzScore,
          tajweedScore: r.tajweedScore,
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
          classId,
          semester,
          tahfidzScore: r.tahfidzScore,
          tajweedScore: r.tajweedScore,
          totalScore: total,
          gradeLetter: calculateLetter(total),
          notes: r.notes || '',
          testDate,
        };
        nextList.push(created);
        recordsToSync.push(created);
      }
    });

    tahfidzGradesRef.current = nextList;
    setTahfidzGrades(nextList);
    localStorage.setItem('bw_tahfidz', JSON.stringify(nextList));

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
      showToast(`Berhasil menyimpan ${records.length} data hafalan tahfidz ke database!`);
    }
  };

  const updateTahfidzGrade = (
    id: number,
    data: { tahfidzScore: number; tajweedScore: number; notes: string; testDate: string },
    options?: { silent?: boolean }
  ) => {
    const existing = tahfidzGradesRef.current.find((t) => t.id === id);
    const total = Math.round((data.tahfidzScore + data.tajweedScore) / 2);
    const letter = calculateLetter(total);

    const nextList = tahfidzGradesRef.current.map((t) =>
      t.id === id
        ? {
            ...t,
            tahfidzScore: data.tahfidzScore,
            tajweedScore: data.tajweedScore,
            notes: data.notes,
            testDate: data.testDate,
            totalScore: total,
            gradeLetter: letter,
          }
        : t
    );

    tahfidzGradesRef.current = nextList;
    setTahfidzGrades(nextList);
    localStorage.setItem('bw_tahfidz', JSON.stringify(nextList));

    const uid = auth.currentUser?.uid;
    if (uid && existing) {
      ensureParentsInFirestore(uid, {
        classId: existing.classId,
        studentId: existing.studentId,
      }).then(() => {
        syncTahfidzToFirestore(uid, {
          ...existing,
          tahfidzScore: data.tahfidzScore,
          tajweedScore: data.tajweedScore,
          notes: data.notes,
          testDate: data.testDate,
          totalScore: total,
          gradeLetter: letter,
        }).then(() => markSynced());
      });
    }
    if (!options?.silent) {
      showToast('Nilai tahfidz berhasil diperbarui ke database.');
    }
  };

  const deleteTahfidzGrade = (id: number, options?: { silent?: boolean }) => {
    const nextList = tahfidzGradesRef.current.filter((t) => t.id !== id);
    tahfidzGradesRef.current = nextList;
    setTahfidzGrades(nextList);
    localStorage.setItem('bw_tahfidz', JSON.stringify(nextList));
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
    setExamPackages((prev) => prev.filter((p) => p.id !== id));
    const uid = auth.currentUser?.uid;
    if (uid) {
      deleteExamPackageWithQuestions(uid, id);
    }
    showToast('Paket soal berhasil dihapus.', 'info');
  };

  const deleteQuestionFromPackage = (packageId: number, questionId: number) => {
    setExamPackages((prev) =>
      prev.map((pkg) => {
        if (pkg.id === packageId) {
          const updatedQuestions = pkg.questions.filter((q) => q.id !== questionId);
          return { ...pkg, questions: updatedQuestions };
        }
        return pkg;
      })
    );

    const uid = auth.currentUser?.uid;
    if (uid) {
      const pkgDocId = getExamPackageDocId(uid, packageId);
      const qDocId = getExamQuestionDocId(questionId);
      deleteFirestoreDoc(`exam_packages/${pkgDocId}/questions`, qDocId);
    }
    showToast('Soal berhasil dihapus.');
  };

  const resetToSampleData = () => {
    setSubjects(INITIAL_SUBJECTS);
    setClasses(INITIAL_CLASSES);
    setStudents(INITIAL_STUDENTS);
    setGrades(INITIAL_GRADES);
    setTahfidzGrades(INITIAL_TAHFIDZ);
    setExamFiles(INITIAL_EXAM_FILES);
    setExamPackages(INITIAL_EXAM_PACKAGES);
    setUsers(INITIAL_USERS);
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

    const uid = auth.currentUser?.uid;
    if (uid) {
      seedFullWorkspaceToFirestore(uid, {
        siteSettings: siteSettingsRef.current,
        themeSettings: themeSettingsRef.current,
        academicYear: '2025/2026',
        users: INITIAL_USERS,
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
    setStudentAttendance((prev) => {
      const map = new Map(prev.map((r) => [r.id, r]));
      records.forEach((r) => {
        map.set(r.id, { ...r, updatedAt: new Date().toISOString() });
      });
      const updated = Array.from(map.values());
      localStorage.setItem('bw_student_attendance', JSON.stringify(updated));
      return updated;
    });
    showToast('Presensi santri berhasil disimpan', 'success');
  };

  const saveTeacherAttendance = (record: TeacherAttendanceRecord) => {
    setTeacherAttendance((prev) => {
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
      localStorage.setItem('bw_teacher_attendance', JSON.stringify(updated));
      return updated;
    });
    showToast(`Presensi ${record.teacherName} dicatat`, 'success');
  };

  const syncAttendanceToReportCards = (classId: number, semester: 1 | 2): number => {
    const classStudents = students.filter((s) => s.id > 0 && s.classId === classId);
    if (classStudents.length === 0) return 0;

    let updatedCount = 0;
    classStudents.forEach((student) => {
      const studentRecords = studentAttendance.filter((r) => r.studentId === student.id);
      const sickCount = studentRecords.filter((r) => r.status === 'S').length;
      const permissionCount = studentRecords.filter((r) => r.status === 'I').length;
      const unexcusedCount = studentRecords.filter((r) => r.status === 'A').length;

      const reportId = `${student.id}_${semester}_${academicYear}`;
      const existing = reportCards.find((r) => r.id === reportId);
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
        const clsObj = classes.find((c) => c.id === classId);
        saveReportCard(
          {
            id: reportId,
            studentId: student.id,
            classId: classId,
            semester: semester,
            academicYear: academicYear,
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
            issuePlace: siteSettings.defaultIssuePlace || 'Bandung',
            issueDate: new Date().toLocaleDateString('id-ID'),
            headmasterName: siteSettings.headmasterName || 'Muhammad Siroj, S.Pd.I',
            headmasterNip: siteSettings.headmasterNip || '',
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
    setTeachingAssignments((prev) => {
      const idx = prev.findIndex((a) => a.id === assignment.id);
      let updated: TeachingAssignment[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...assignment, updatedAt: new Date().toISOString() };
      } else {
        updated = [...prev, { ...assignment, updatedAt: new Date().toISOString() }];
      }
      localStorage.setItem('bw_teaching_assignments', JSON.stringify(updated));
      return updated;
    });
    showToast('Jadwal pelajaran & guru pengampu berhasil disimpan', 'success');
  };

  const deleteTeachingAssignment = (id: string) => {
    setTeachingAssignments((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      localStorage.setItem('bw_teaching_assignments', JSON.stringify(updated));
      return updated;
    });
    showToast('Penugasan pelajaran dihapus', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isAuthReady,
        isCloudSynced,
        isSyncing,
        lastSyncedAt,
        connectGoogleCloudSync,
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
