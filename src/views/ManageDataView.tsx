import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Subject,
  ClassRoom,
  Student,
  User,
  ThemeColor,
  ThemeLayout,
  ThemeContentWidth,
  ThemeDensity,
  ThemeBorderRadius,
  AnnouncementItem,
  GradeThresholds,
} from '../types';
import {
  THEME_PALETTES,
  getRadiusClass,
  applyThemeCssVariables,
  getReportThemeStyles,
  compressImageFileToDataUrl,
  DEFAULT_GRADE_THRESHOLDS,
  resolveGradeThresholds,
} from '../utils/theme';
import { OfficialKopSurat } from '../components/BrandLogoIcon';
import { PdfSettingsModal, PdfSettingsTabId } from '../components/PdfSettingsModal';
import {
  PDF_FRAME_PRESETS,
  getPdfSheetBorderStyle,
  PdfPageFrameOverlay,
  PdfFrameThumbnail,
} from '../components/PdfPageFrame';
import {
  Database,
  BookOpen,
  School,
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  UserPlus,
  Settings,
  Palette,
  Building2,
  FileCheck2,
  Sliders,
  Check,
  RotateCcw,
  Upload,
  Download,
  AlertTriangle,
  Lock,
  Sparkles,
  Image,
  GraduationCap,
  Award,
  Columns,
  Layout,
  Minimize2,
  Maximize2,
  FileText,
  Type,
  Layers,
  Grid,
  Eye,
  EyeOff,
  Megaphone,
  Pin,
  Calendar,
  UserCheck,
  Moon,
  Sun,
  Zap,
} from 'lucide-react';

export const ManageDataView: React.FC = () => {
  const {
    currentUser,
    isSuperAdmin,
    manageTab,
    setManageTab,
    subjects,
    classes,
    students,
    grades,
    tahfidzGrades,
    reportCards,
    studentAttendance,
    teacherAttendance,
    teachingAssignments,
    examFiles,
    examPackages,
    users,
    addUser,
    updateUserRecord,
    deleteUser,
    resetUserPassword,
    addSubject,
    updateSubject,
    deleteSubject,
    addClass,
    updateClass,
    deleteClass,
    addStudent,
    updateStudent,
    deleteStudent,
    siteSettings,
    themeSettings,
    themeClasses,
    isDeviceDarkMode,
    toggleDeviceDarkMode,
    setDeviceDarkMode,
    academicYear,
    updateSchoolConfig,
    resetThemeSettings,
    exportDatabaseJSON,
    importDatabaseJSON,
    updateDatabaseTable,
    forceSyncAllToCloud,
    isCloudSynced,
    isSyncing,
    lastSyncedAt,
    clearAllGrades,
    resetToSampleData,
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    setPinnedAnnouncement,
    superAdminFocusSection,
    setSuperAdminFocusSection,
    showToast,
  } = useApp();

  const radius = getRadiusClass(themeSettings.borderRadius);

  // Sync active tab with context manageTab
  const activeTab = !isSuperAdmin && manageTab === 'superadmin' ? 'subjects' : manageTab;
  const setActiveTab = setManageTab;

  // Sub-filter inside Super Admin unified page ('all' shows all sections on 1 page)
  const [superAdminSection, setSuperAdminSection] = useState<
    'all' | 'announcements' | 'web_theme' | 'institution' | 'report_theme' | 'users' | 'database'
  >('all');
  const [webStyleSubTab, setWebStyleSubTab] = useState<
    'all' | '1a' | '1b' | '1c' | '1d' | '1e' | '1f' | '1g' | '1h'
  >('all');
  const [isPdfSettingsOpen, setIsPdfSettingsOpen] = useState(false);
  const [pdfSettingsInitialTab, setPdfSettingsInitialTab] =
    useState<PdfSettingsTabId>('kop_logos');

  const openPdfSettingsModal = (tab: PdfSettingsTabId = 'kop_logos') => {
    setPdfSettingsInitialTab(tab);
    setIsPdfSettingsOpen(true);
  };

  useEffect(() => {
    if (superAdminFocusSection === 'announcements') {
      setSuperAdminSection('announcements');
      setSuperAdminFocusSection(null);
    }
  }, [superAdminFocusSection, setSuperAdminFocusSection]);

  // Super Admin: Announcements Management State
  const [annSearch, setAnnSearch] = useState('');
  const [annCategoryFilter, setAnnCategoryFilter] = useState<'ALL' | AnnouncementItem['category']>('ALL');
  const [annStatusFilter, setAnnStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT'>('ALL');
  const [isAnnFormOpen, setIsAnnFormOpen] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [confirmDeleteAnnId, setConfirmDeleteAnnId] = useState<string | null>(null);
  const [annForm, setAnnForm] = useState<{
    title: string;
    content: string;
    category: AnnouncementItem['category'];
    priority: AnnouncementItem['priority'];
    author: string;
    isActive: boolean;
    isPinned: boolean;
  }>({
    title: '',
    content: '',
    category: 'Akademik',
    priority: 'important',
    author: currentUser?.fullName || 'Kepala Madrasah',
    isActive: true,
    isPinned: false,
  });

  const handleOpenNewAnnouncement = () => {
    setEditingAnnId(null);
    setAnnForm({
      title: '',
      content: '',
      category: 'Akademik',
      priority: 'important',
      author: currentUser?.fullName || 'Kepala Madrasah',
      isActive: true,
      isPinned: false,
    });
    setIsAnnFormOpen(true);
  };

  const handleOpenEditAnnouncement = (item: AnnouncementItem) => {
    setEditingAnnId(item.id);
    setAnnForm({
      title: item.title,
      content: item.content,
      category: item.category,
      priority: item.priority,
      author: item.author,
      isActive: item.isActive,
      isPinned: Boolean(item.isPinned),
    });
    setIsAnnFormOpen(true);
  };

  const handleSaveAnnouncementForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title.trim() || !annForm.content.trim()) {
      showToast('Judul dan isi pengumuman wajib diisi.', 'error');
      return;
    }
    if (editingAnnId) {
      updateAnnouncement(editingAnnId, {
        title: annForm.title.trim(),
        content: annForm.content.trim(),
        category: annForm.category,
        priority: annForm.priority,
        author: annForm.author.trim() || 'Super Admin',
        isActive: annForm.isActive,
        isPinned: annForm.isPinned,
      });
    } else {
      addAnnouncement({
        title: annForm.title.trim(),
        content: annForm.content.trim(),
        category: annForm.category,
        priority: annForm.priority,
        author: annForm.author.trim() || 'Super Admin',
        isActive: annForm.isActive,
        isPinned: annForm.isPinned,
      });
    }
    setIsAnnFormOpen(false);
    setEditingAnnId(null);
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      const matchCat = annCategoryFilter === 'ALL' ? true : item.category === annCategoryFilter;
      const matchStatus =
        annStatusFilter === 'ALL'
          ? true
          : annStatusFilter === 'ACTIVE'
          ? item.isActive
          : !item.isActive;
      const q = annSearch.trim().toLowerCase();
      const matchSearch = q
        ? item.title.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q)
        : true;
      return matchCat && matchStatus && matchSearch;
    });
  }, [announcements, annCategoryFilter, annStatusFilter, annSearch]);

  // Subjects state
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCategory, setNewSubjectCategory] = useState<Subject['category']>('Diniyah');
  const [subjectCategoryFilter, setSubjectCategoryFilter] = useState<string>('ALL');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [editingSubject, setEditingSubject] = useState<{
    id: number;
    name: string;
    category: Subject['category'];
  } | null>(null);
  const [confirmDeleteSubjectId, setConfirmDeleteSubjectId] = useState<number | null>(null);

  // Classes state
  const [newClassName, setNewClassName] = useState('');
  const [newClassTeacher, setNewClassTeacher] = useState('');
  const [editingClass, setEditingClass] = useState<{
    id: number;
    name: string;
    teacher: string;
  } | null>(null);
  const [confirmDeleteClassId, setConfirmDeleteClassId] = useState<number | null>(null);

  // Students state
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('');
  const [newStudentNis, setNewStudentNis] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClassId, setNewStudentClassId] = useState('');
  const [newStudentBirthPlace, setNewStudentBirthPlace] = useState('');
  const [newStudentBirthDate, setNewStudentBirthDate] = useState('');
  const [newStudentGuardian, setNewStudentGuardian] = useState('');

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [confirmDeleteStudentId, setConfirmDeleteStudentId] = useState<number | null>(null);

  // Super Admin: User Management & Full Database Explorer state
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('123456');
  const [newRole, setNewRole] = useState<User['role']>('guru');
  const [confirmDangerAction, setConfirmDangerAction] = useState<
    'clear_grades' | 'reset_sample' | null
  >(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilterProvider, setUserFilterProvider] = useState<'all' | 'google' | 'local'>('all');

  const [selectedDbTable, setSelectedDbTable] = useState<
    | 'students'
    | 'classes'
    | 'subjects'
    | 'grades'
    | 'tahfidz_grades'
    | 'report_cards'
    | 'student_attendance'
    | 'teacher_attendance'
    | 'teaching_assignments'
    | 'announcements'
    | 'exam_packages'
    | 'exam_files'
    | 'users'
    | 'site_and_theme_config'
  >('users');
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [dbEditorMode, setDbEditorMode] = useState<'table' | 'json'>('table');
  const [rawJsonBuffer, setRawJsonBuffer] = useState('');
  const [editingDbRecord, setEditingDbRecord] = useState<{
    index: number;
    isNew: boolean;
    jsonText: string;
  } | null>(null);
  const [confirmTruncateTable, setConfirmTruncateTable] = useState<string | null>(null);

  // Super Admin: Institution & Site Settings Form State (auto-synced)
  const [instForm, setInstForm] = useState({
    foundationName: siteSettings.foundationName || 'Yayasan Pendidikan Islam Baiturrahman',
    appName: siteSettings.appName || 'Sistem Rapor Digital',
    schoolName: siteSettings.schoolName || 'Pesantren & Madrasah Baiturrahman',
    subHeader: siteSettings.subHeader || '',
    announcement: siteSettings.announcement || '',
    schoolAddress: siteSettings.schoolAddress || '',
    schoolPhone: siteSettings.schoolPhone || '',
    schoolEmail: siteSettings.schoolEmail || '',
    schoolWebsite: siteSettings.schoolWebsite || 'www.baiturrahman.sch.id',
    schoolNsmNpsn: siteSettings.schoolNsmNpsn || '',
    headmasterName: siteSettings.headmasterName || 'Muhammad Siroj, S.Pd.I',
    headmasterNip: siteSettings.headmasterNip || '',
    defaultIssuePlace: siteSettings.defaultIssuePlace || 'Bandung',
    watermarkText: siteSettings.watermarkText || 'DOKUMEN RESMI',
    kkmDefault: siteSettings.kkmDefault ?? 70,
    defaultSemester: (siteSettings.defaultSemester === 2 ? 2 : 1) as 1 | 2,
    gradeThresholds: resolveGradeThresholds(siteSettings.gradeThresholds),
    footerText: siteSettings.footerText || 'Evaluasi Akademik, Rapor Digital & Tahfidz',
    enableTahfidz: siteSettings.enableTahfidz !== false,
    enableBankSoal: siteSettings.enableBankSoal !== false,
    academicYear: academicYear || '2025/2026',
  });

  // Sync local instForm when remote siteSettings change
  useEffect(() => {
    setInstForm({
      foundationName: siteSettings.foundationName || 'Yayasan Pendidikan Islam Baiturrahman',
      appName: siteSettings.appName || 'Sistem Rapor Digital',
      schoolName: siteSettings.schoolName || 'Pesantren & Madrasah Baiturrahman',
      subHeader: siteSettings.subHeader || '',
      announcement: siteSettings.announcement || '',
      schoolAddress: siteSettings.schoolAddress || '',
      schoolPhone: siteSettings.schoolPhone || '',
      schoolEmail: siteSettings.schoolEmail || '',
      schoolWebsite: siteSettings.schoolWebsite || 'www.baiturrahman.sch.id',
      schoolNsmNpsn: siteSettings.schoolNsmNpsn || '',
      headmasterName: siteSettings.headmasterName || 'Muhammad Siroj, S.Pd.I',
      headmasterNip: siteSettings.headmasterNip || '',
      defaultIssuePlace: siteSettings.defaultIssuePlace || 'Bandung',
      watermarkText: siteSettings.watermarkText || 'DOKUMEN RESMI',
      kkmDefault: siteSettings.kkmDefault ?? 70,
      defaultSemester: (siteSettings.defaultSemester === 2 ? 2 : 1) as 1 | 2,
      gradeThresholds: resolveGradeThresholds(siteSettings.gradeThresholds),
      footerText: siteSettings.footerText || 'Evaluasi Akademik, Rapor Digital & Tahfidz',
      enableTahfidz: siteSettings.enableTahfidz !== false,
      enableBankSoal: siteSettings.enableBankSoal !== false,
      academicYear: academicYear || '2025/2026',
    });
  }, [siteSettings, academicYear]);

  // Helper to update institution field and auto-sync to database
  const handleInstFieldChange = (patch: Partial<typeof instForm>) => {
    const next = { ...instForm, ...patch };
    setInstForm(next);
    const { academicYear: nextYear, ...sitePatch } = next;
    updateSchoolConfig(
      {
        academicYear: nextYear || '2025/2026',
        siteSettings: sitePatch,
      },
      { silent: true }
    );
  };

  const handleGradeThresholdChange = (patch: Partial<GradeThresholds>) => {
    const nextThresholds = resolveGradeThresholds({
      ...instForm.gradeThresholds,
      ...patch,
    });
    handleInstFieldChange({ gradeThresholds: nextThresholds });
  };

  // Helper to update any theme setting and auto-sync immediately to all users
  const handleThemePatch = (patch: Partial<typeof themeSettings>) => {
    const safePatch: Partial<typeof themeSettings> = { ...patch };
    if (safePatch.surfaceMode === 'dark_elevated') {
      safePatch.surfaceThemeMode = 'dark_slate';
    } else if (safePatch.surfaceMode === 'sepia_warm') {
      safePatch.surfaceThemeMode = 'soft_sepia';
    } else if (safePatch.surfaceMode) {
      safePatch.surfaceThemeMode = 'light';
    }

    const nextTheme = { ...themeSettings, ...safePatch };
    const nextDark =
      safePatch.surfaceMode !== undefined
        ? safePatch.surfaceMode === 'dark_elevated'
        : isDeviceDarkMode;
    applyThemeCssVariables(nextTheme, nextDark);
    updateSchoolConfig(
      {
        themeSettings: safePatch,
        siteSettings: {
          ...(safePatch.customLogoUrl !== undefined
            ? { customLogoUrl: safePatch.customLogoUrl }
            : {}),
          ...(safePatch.customRightLogoUrl !== undefined
            ? { customRightLogoUrl: safePatch.customRightLogoUrl }
            : {}),
        },
      },
      { silent: true }
    );
  };

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFileToDataUrl(file, 260, 0.86);
      handleThemePatch({
        customLogoUrl: dataUrl,
        logoIconType: 'image',
        reportShowLeftLogo: true,
      });
      showToast('Gambar Logo Kiri / Lembaga berhasil diperbarui & disinkronkan!', 'success');
    } catch {
      showToast('Gagal memuat gambar logo kiri.', 'error');
    }
    e.target.value = '';
  };

  const handleRightLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFileToDataUrl(file, 260, 0.86);
      handleThemePatch({
        customRightLogoUrl: dataUrl,
        reportShowRightLogo: true,
        reportHeaderStyle: 'dual_logo',
      });
      showToast('Gambar Logo Kanan Kop Surat berhasil diperbarui & disinkronkan!', 'success');
    } catch {
      showToast('Gagal memuat gambar logo kanan.', 'error');
    }
    e.target.value = '';
  };

  const handleExportDatabase = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `backup_database_rapor_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDatabaseJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newFullName.trim()) return;
    addUser(newUsername, newFullName, newEmail, newRole, newPassword);
    setNewUsername('');
    setNewFullName('');
    setNewEmail('');
    setNewPassword('123456');
  };

  // Filtered Subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter((sub) => {
      const matchCat =
        subjectCategoryFilter === 'ALL' ? true : sub.category === subjectCategoryFilter;
      const matchSearch = subjectSearch.trim()
        ? sub.name.toLowerCase().includes(subjectSearch.toLowerCase())
        : true;
      return matchCat && matchSearch;
    });
  }, [subjects, subjectCategoryFilter, subjectSearch]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = studentClassFilter
        ? s.classId === parseInt(studentClassFilter, 10)
        : true;
      const matchSearch = studentSearch.trim()
        ? s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.nis.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.guardian.toLowerCase().includes(studentSearch.toLowerCase())
        : true;
      return matchClass && matchSearch;
    });
  }, [students, studentClassFilter, studentSearch]);

  // Grouped Students by class for display
  const studentsByClass = useMemo(() => {
    const map: Record<number, { classRoom: ClassRoom; students: Student[] }> = {};

    classes.forEach((c) => {
      map[c.id] = { classRoom: c, students: [] };
    });

    filteredStudents.forEach((st) => {
      if (map[st.classId]) {
        map[st.classId].students.push(st);
      } else {
        const fallbackCls: ClassRoom = {
          id: st.classId,
          name: `Kelas #${st.classId}`,
          teacher: '-',
        };
        map[st.classId] = { classRoom: fallbackCls, students: [st] };
      }
    });

    return Object.values(map).filter((item) => item.students.length > 0 || !studentSearch);
  }, [classes, filteredStudents, studentSearch]);

  // Handle Add Subject
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    addSubject(newSubjectName.trim(), newSubjectCategory);
    setNewSubjectName('');
  };

  // Handle Add Class
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    addClass(newClassName.trim(), newClassTeacher.trim());
    setNewClassName('');
    setNewClassTeacher('');
  };

  // Handle Add Student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentClassId) return;
    addStudent({
      nis: newStudentNis.trim() || 'NIS-' + Math.floor(10000 + Math.random() * 90000),
      name: newStudentName.trim(),
      classId: parseInt(newStudentClassId, 10),
      birthPlace: newStudentBirthPlace.trim() || 'Bandung',
      birthDate: newStudentBirthDate || '2012-01-01',
      guardian: newStudentGuardian.trim() || '-',
    });

    setNewStudentNis('');
    setNewStudentName('');
    setNewStudentClassId('');
    setNewStudentBirthPlace('');
    setNewStudentBirthDate('');
    setNewStudentGuardian('');
  };

  const activePalette = THEME_PALETTES[themeSettings.colorTheme] || THEME_PALETTES.emerald;
  const activeHexDisplay =
    themeSettings.colorTheme === 'custom'
      ? themeSettings.customPrimaryHex || '#047857'
      : activePalette.hexPrimary;

  const activeReportColor =
    themeSettings.reportThemeColor || themeSettings.colorTheme || 'emerald';
  const activeReportHexDisplay =
    activeReportColor === 'classic_black'
      ? '#0f172a'
      : activeReportColor === 'custom'
      ? themeSettings.reportCustomHex || '#047857'
      : THEME_PALETTES[activeReportColor]?.hexPrimary || '#047857';

  const logoOptions: Array<{
    type: 'image' | 'book' | 'graduation' | 'award' | 'school' | 'sparkles';
    label: string;
    icon: React.ReactNode;
  }> = [
    { type: 'image', label: 'Logo Gambar / Berkas', icon: <Image className="w-4 h-4 text-current" /> },
    { type: 'book', label: "Al-Qur'an / Kitab", icon: <BookOpen className="w-4 h-4 text-current" /> },
    { type: 'graduation', label: 'Topi Akademik Wisuda', icon: <GraduationCap className="w-4 h-4 text-current" /> },
    { type: 'award', label: 'Medali Kehormatan', icon: <Award className="w-4 h-4 text-current" /> },
    { type: 'school', label: 'Gedung Madrasah', icon: <School className="w-4 h-4 text-current" /> },
    { type: 'sparkles', label: 'Bintang Prestasi', icon: <Sparkles className="w-4 h-4 text-current" /> },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Tab Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Database className={`w-5 h-5 ${themeClasses.primaryText}`} />
            <span>
              {isSuperAdmin ? 'Kelola Data & Pengaturan Super Admin' : 'Kelola Master Data'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSuperAdmin
              ? 'Pusat manajemen kurikulum, kelas, santri, serta seluruh pengaturan warna web, identitas lembaga, rapor PDF, pengguna & database.'
              : 'Manajemen kurikulum mata pelajaran, struktur kelas, dan direktori santri.'}
          </p>
        </div>

        {/* Precision Tab Switcher */}
        <div
          className={`filter-group grid ${
            isSuperAdmin ? 'grid-cols-2' : 'grid-cols-3'
          } sm:inline-flex w-full lg:w-auto self-start lg:self-auto`}
        >
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('superadmin')}
              className={`filter-btn w-full sm:w-auto ${
                activeTab === 'superadmin'
                  ? `${themeClasses.primary} text-white shadow-2xs`
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-current shrink-0" />
              <span>Super Admin</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('subjects')}
            className={`filter-btn w-full sm:w-auto ${
              activeTab === 'subjects'
                ? `${themeClasses.primary} text-white shadow-2xs`
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-current shrink-0" />
            <span>Mapel</span>
            <span
              className={`filter-badge ${
                activeTab === 'subjects'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200/80 text-slate-700'
              }`}
            >
              {subjects.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('classes')}
            className={`filter-btn w-full sm:w-auto ${
              activeTab === 'classes'
                ? `${themeClasses.primary} text-white shadow-2xs`
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="w-3.5 h-3.5 text-current shrink-0" />
            <span>Kelas</span>
            <span
              className={`filter-badge ${
                activeTab === 'classes'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200/80 text-slate-700'
              }`}
            >
              {classes.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`filter-btn w-full sm:w-auto ${
              activeTab === 'students'
                ? `${themeClasses.primary} text-white shadow-2xs`
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-current shrink-0" />
            <span>Santri</span>
            <span
              className={`filter-badge ${
                activeTab === 'students'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200/80 text-slate-700'
              }`}
            >
              {students.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: MATA PELAJARAN */}
      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Subject Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs h-fit">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Plus className={`w-4 h-4 ${themeClasses.primaryText}`} />
              <span>Tambah Mata Pelajaran Baru</span>
            </h2>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Mata Pelajaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ushul Fiqih, Matematika..."
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 ${radius.input} text-xs text-slate-800 focus:ring-2 ${themeClasses.primaryRing} focus:outline-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Mapel
                </label>
                <select
                  value={newSubjectCategory}
                  onChange={(e) => setNewSubjectCategory(e.target.value as Subject['category'])}
                  className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 ${radius.input} text-xs text-slate-800 focus:ring-2 ${themeClasses.primaryRing} focus:outline-none`}
                >
                  <option value="Diniyah">Diniyah / Agama Islam</option>
                  <option value="Umum">Umum / Sains & Sosial</option>
                  <option value="Bahasa">Bahasa (Arab, Inggris, dll)</option>
                  <option value="Keterampilan">Keterampilan / Kejuruan</option>
                </select>
              </div>

              <button
                type="submit"
                className={`w-full btn-precision ${themeClasses.primary} ${themeClasses.primaryHover} text-white shadow-xs`}
              >
                + Tambah Mapel
              </button>
            </form>
          </div>

          {/* Subjects Directory (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className={`w-4 h-4 ${themeClasses.primaryText}`} />
                <span>Daftar Kurikulum ({filteredSubjects.length} Mapel)</span>
              </h2>
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari nama mapel..."
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  className="filter-control w-full pl-8"
                />
              </div>
            </div>

            {/* Category Segmented Filter */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-2">
              <div className="filter-group grid grid-cols-2 sm:inline-flex w-full sm:w-auto">
                {(['ALL', 'Diniyah', 'Umum', 'Bahasa', 'Keterampilan'] as const).map((cat) => {
                  const active = subjectCategoryFilter === cat;
                  const count =
                    cat === 'ALL'
                      ? subjects.length
                      : subjects.filter((s) => s.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSubjectCategoryFilter(cat)}
                      className={`filter-btn w-full sm:w-auto ${
                        cat === 'ALL' ? 'col-span-2 sm:col-span-1' : ''
                      } ${
                        active
                          ? `${themeClasses.primary} text-white shadow-2xs`
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>{cat === 'ALL' ? 'Semua Kategori' : cat}</span>
                      <span
                        className={`filter-badge ${
                          active ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {(subjectCategoryFilter !== 'ALL' || subjectSearch) && (
                <button
                  type="button"
                  onClick={() => {
                    setSubjectCategoryFilter('ALL');
                    setSubjectSearch('');
                  }}
                  className="filter-reset-btn w-full sm:w-auto justify-center"
                >
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredSubjects.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-slate-300 transition-all text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <h3 className="font-bold text-slate-900 truncate">{sub.name}</h3>
                    <span className="inline-block mt-0.5 text-[10px] font-medium text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                      {sub.category || 'Diniyah'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {confirmDeleteSubjectId === sub.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            deleteSubject(sub.id);
                            setConfirmDeleteSubjectId(null);
                          }}
                          className="h-7 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer"
                        >
                          Ya, Hapus
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteSubjectId(null)}
                          className="h-7 px-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px] font-semibold whitespace-nowrap cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingSubject({
                              id: sub.id,
                              name: sub.name,
                              category: sub.category || 'Diniyah',
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit mapel"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteSubjectId(sub.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus mapel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KELAS */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Class Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs h-fit">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Plus className={`w-4 h-4 ${themeClasses.primaryText}`} />
              <span>Tambah Kelas Baru</span>
            </h2>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kelas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Aliyah 1, Mutawasith 2..."
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 ${radius.input} text-xs text-slate-800 focus:ring-2 ${themeClasses.primaryRing} focus:outline-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Wali Kelas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Abu assa, Ust. Ridwan..."
                  value={newClassTeacher}
                  onChange={(e) => setNewClassTeacher(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 ${radius.input} text-xs text-slate-800 focus:ring-2 ${themeClasses.primaryRing} focus:outline-none`}
                />
              </div>

              <button
                type="submit"
                className={`w-full btn-precision ${themeClasses.primary} ${themeClasses.primaryHover} text-white shadow-xs`}
              >
                + Tambah Kelas
              </button>
            </form>
          </div>

          {/* Classes Directory (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <School className={`w-4 h-4 ${themeClasses.primaryText}`} />
                <span>Daftar Kelas & Wali Kelas ({classes.length} Kelas)</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {classes.map((cls) => {
                const studentCount = students.filter((s) => s.classId === cls.id).length;
                return (
                  <div
                    key={cls.id}
                    className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-slate-300 transition-all flex items-start justify-between"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Kelas {cls.name}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Wali Kelas:{' '}
                        <span className="font-semibold text-slate-700">
                          {cls.teacher || 'Belum Ditentukan'}
                        </span>
                      </p>
                      <span
                        className={`inline-block mt-2 text-[10px] ${themeClasses.badge} border px-2 py-0.5 rounded-md font-medium`}
                      >
                        {studentCount} santri terdaftar
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {confirmDeleteClassId === cls.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              deleteClass(cls.id);
                              setConfirmDeleteClassId(null);
                            }}
                            className="h-7 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer"
                          >
                            Ya, Hapus
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteClassId(null)}
                            className="h-7 px-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px] font-semibold whitespace-nowrap cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingClass({ id: cls.id, name: cls.name, teacher: cls.teacher })
                            }
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit kelas"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteClassId(cls.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus kelas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SANTRI */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Add Student Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <UserPlus className={`w-4 h-4 ${themeClasses.primaryText}`} />
              <span>Tambah Data Santri Baru</span>
            </h2>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. Induk Santri (NIS)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 201102"
                    value={newStudentNis}
                    onChange={(e) => setNewStudentNis(e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 ${radius.input} text-xs text-slate-800 focus:ring-2 ${themeClasses.primaryRing} focus:outline-none`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap Santri <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap santri"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 ${radius.input} text-xs text-slate-800 focus:ring-2 ${themeClasses.primaryRing} focus:outline-none`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pilih Kelas <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newStudentClassId}
                    onChange={(e) => setNewStudentClassId(e.target.value)}
                    required
                    className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 ${radius.input} text-xs text-slate-800 focus:ring-2 ${themeClasses.primaryRing} focus:outline-none`}
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        Kelas {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Bandung"
                    value={newStudentBirthPlace}
                    onChange={(e) => setNewStudentBirthPlace(e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 ${radius.input} text-xs text-slate-800 focus:ring-2 ${themeClasses.primaryRing} focus:outline-none`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={newStudentBirthDate}
                    onChange={(e) => setNewStudentBirthDate(e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 ${radius.input} text-xs text-slate-800 focus:ring-2 ${themeClasses.primaryRing} focus:outline-none`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    placeholder="Nama orang tua/wali"
                    value={newStudentGuardian}
                    onChange={(e) => setNewStudentGuardian(e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 ${radius.input} text-xs text-slate-800 focus:ring-2 ${themeClasses.primaryRing} focus:outline-none`}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className={`w-full sm:w-auto btn-precision ${themeClasses.primary} ${themeClasses.primaryHover} text-white shadow-xs`}
                >
                  + Tambah Santri
                </button>
              </div>
            </form>
          </div>

          {/* Students Directory Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className={`w-4 h-4 ${themeClasses.primaryText}`} />
              <h2 className="text-xs font-bold text-slate-900">
                Direktori Santri ({filteredStudents.length} Santri)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 max-w-lg w-full sm:w-auto">
              <select
                value={studentClassFilter}
                onChange={(e) => setStudentClassFilter(e.target.value)}
                className="filter-control w-full sm:w-auto"
              >
                <option value="">Semua Kelas ({classes.length})</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    Kelas {cls.name}
                  </option>
                ))}
              </select>

              <div className="relative flex-1 sm:min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari nama / NIS / wali..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="filter-control w-full pl-8"
                />
              </div>

              {(studentClassFilter || studentSearch) && (
                <button
                  type="button"
                  onClick={() => {
                    setStudentClassFilter('');
                    setStudentSearch('');
                  }}
                  className="filter-reset-btn w-full sm:w-auto justify-center"
                >
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Student Cards Grouped by Class */}
          <div className="space-y-6">
            {studentsByClass.map((group) => (
              <div
                key={group.classRoom.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
              >
                <div
                  className={`bg-gradient-to-r ${themeClasses.gradientHeader} text-white px-5 py-3 flex items-center justify-between`}
                >
                  <h3 className="text-xs font-bold">
                    Kelas {group.classRoom.name} · {group.students.length} Santri
                  </h3>
                  <span className="text-[11px] text-white/80 font-medium">
                    Wali Kelas: {group.classRoom.teacher || '-'}
                  </span>
                </div>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {group.students.map((st) => (
                    <div
                      key={st.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-slate-900">{st.name}</h4>
                          <span
                            className={`text-[10px] font-semibold ${themeClasses.badge} border px-1.5 py-0.5 rounded`}
                          >
                            NIS: {st.nis}
                          </span>
                        </div>
                        <div className="mt-2 space-y-0.5 text-[11px] text-slate-500">
                          <p>
                            TTL: {st.birthPlace}, {st.birthDate}
                          </p>
                          <p>Wali: {st.guardian}</p>
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t border-slate-100 flex justify-end gap-1">
                        {confirmDeleteStudentId === st.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                deleteStudent(st.id);
                                setConfirmDeleteStudentId(null);
                              }}
                              className="h-7 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer"
                            >
                              Ya, Hapus Santri
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteStudentId(null)}
                              className="h-7 px-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px] font-semibold whitespace-nowrap cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditingStudent(st)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                              title="Edit Santri"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteStudentId(st.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Hapus Santri"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================== */}
      {/* TAB 4: SEMUA PENGATURAN SUPER ADMIN DALAM SATU HALAMAN DI HALAMAN KELOLA */}
      {/* ========================================================================== */}
      {isSuperAdmin && activeTab === 'superadmin' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Banner & Section Filter */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div
              className={`bg-gradient-to-r ${themeClasses.gradientHeader} text-white p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 ring-1 ring-white/25 flex items-center justify-center shrink-0">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-white">
                      Pusat Pengaturan Terpadu Super Admin
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/20 text-white ring-1 ring-white/25">
                      {activePalette.shortName} · {activeHexDisplay.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-white/85 mt-0.5">
                    Seluruh pengaturan palet warna web, tampilan antarmuka, identitas lembaga, format rapor PDF, akun pengguna, dan database tersinkron otomatis ke semua user.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={resetThemeSettings}
                  className="btn-precision w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                  <span>Reset Tema</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      'Seluruh pengaturan Super Admin telah aktif & tersinkron ke semua user!',
                      'success'
                    )
                  }
                  className="btn-precision w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Tersinkron</span>
                </button>
              </div>
            </div>

            {/* Sub-navigation filter bar (Default: Semua Pengaturan on 1 page) */}
            <div className="px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="filter-group bg-white grid grid-cols-2 sm:inline-flex w-full lg:w-auto">
                {[
                  { id: 'all', label: 'Semua', icon: Layers },
                  { id: 'web_theme', label: '1. Tampilan Web', icon: Palette },
                  { id: 'announcements', label: `Pengumuman (${announcements.length})`, icon: Megaphone },
                  { id: 'institution', label: '2. Lembaga', icon: Building2 },
                  { id: 'report_theme', label: '3. Rapor PDF', icon: FileCheck2 },
                  { id: 'users', label: `4. Pengguna (${users.length})`, icon: Users },
                  { id: 'database', label: '5. Database', icon: Database },
                ].map((sec) => {
                  const Icon = sec.icon;
                  const active = superAdminSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setSuperAdminSection(sec.id as any)}
                      className={`filter-btn w-full sm:w-auto ${
                        sec.id === 'all' ? 'col-span-2 sm:col-span-1' : ''
                      } ${
                        active
                          ? `${themeClasses.primary} text-white shadow-2xs`
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-current shrink-0" />
                      <span>{sec.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* SECTION 1: PENGATURAN TAMPILAN, GAYA VISUAL & ANTARMUKA WEB LENGKAP   */}
          {/* ===================================================================== */}
          {(superAdminSection === 'all' || superAdminSection === 'web_theme') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Palette className={`w-4 h-4 ${themeClasses.primaryText}`} />
                    <span>
                      1. Pengaturan Tampilan, Gaya Visual & Antarmuka Web Lengkap ( Bagian 1A – 1H )
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pusat kustomisasi menyeluruh: 24 palet warna + Hex kustom, mode permukaan, tekstur latar, gaya kartu, tabel, tombol, input, navigasi, banner sambutan, tipografi, animasi, hingga saklar interaksi UI.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    <span
                      className="w-3 h-3 rounded-full ring-1 ring-slate-300"
                      style={{ backgroundColor: activeHexDisplay }}
                    />
                    <span>Aktif: {activePalette.name}</span>
                  </span>
                </div>
              </div>

              {/* Sub-Tab Navigator for 1A - 1H */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="filter-group bg-white grid grid-cols-3 sm:inline-flex w-full sm:w-auto">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: '1a', label: '1A. Warna' },
                    { id: '1b', label: '1B. Latar' },
                    { id: '1c', label: '1C. Kartu' },
                    { id: '1d', label: '1D. Komponen' },
                    { id: '1e', label: '1E. Navigasi' },
                    { id: '1f', label: '1F. Hero' },
                    { id: '1g', label: '1G. Tipografi' },
                    { id: '1h', label: '1H. Animasi' },
                  ].map((tab) => {
                    const active = webStyleSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setWebStyleSubTab(tab.id as any)}
                        className={`filter-btn w-full sm:w-auto px-1.5 sm:px-3 ${
                          active
                            ? `${themeClasses.primary} text-white shadow-2xs`
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* =============================================================== */}
              {/* 1A. PALET WARNA UTAMA WEB (24 PALET + CUSTOM HEX PICKER)        */}
              {/* =============================================================== */}
              {(webStyleSubTab === 'all' || webStyleSubTab === '1a') && (
                <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <Palette className={`w-4 h-4 ${themeClasses.primaryText}`} />
                      <span>1A. Palet Warna Utama Web (24 Pilihan Institusi + Kustom Hex)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pilih palet warna utama atau tentukan kode warna Hex spesifik untuk tombol, aksen, dan gradasi.
                    </p>
                  </div>

                  {/* 25 Color Palettes Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                    {(Object.keys(THEME_PALETTES) as ThemeColor[]).map((key) => {
                      const item = THEME_PALETTES[key];
                      const isSelected = themeSettings.colorTheme === key;
                      const swatchHex =
                        key === 'custom'
                          ? themeSettings.customPrimaryHex || '#047857'
                          : item.hexPrimary;
                      const secondarySwatchHex =
                        key === 'custom'
                          ? themeSettings.customSecondaryHex || '#0f172a'
                          : item.hexSecondary;

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            handleThemePatch({
                              colorTheme: key,
                              ...(key !== 'custom'
                                ? {
                                    customPrimaryHex: item.hexPrimary,
                                    customSecondaryHex: item.hexSecondary,
                                  }
                                : {}),
                            })
                          }
                          className={`group rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'border-brand-custom ring-2 ring-slate-900/15 bg-white shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div
                            className="h-6 w-full flex items-center justify-between px-2.5"
                            style={{
                              background: `linear-gradient(135deg, ${swatchHex} 0%, ${secondarySwatchHex} 100%)`,
                            }}
                          >
                            <span className="text-[9px] font-mono font-bold text-white/90 uppercase">
                              {swatchHex}
                            </span>
                            {isSelected && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white text-slate-900 text-[8px] font-extrabold uppercase">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                Aktif
                              </span>
                            )}
                          </div>

                          <div className="p-2.5">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span
                                className="w-3 h-3 rounded-full shrink-0 border border-white shadow-2xs"
                                style={{ backgroundColor: swatchHex }}
                              />
                              <span className="font-bold text-slate-900 text-[11px] truncate">
                                {item.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 block leading-snug line-clamp-2">
                              {item.description}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Hex Color Pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        Warna Aksen Utama (Primary Hex)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeSettings.customPrimaryHex || '#047857'}
                          onChange={(e) =>
                            handleThemePatch({
                              colorTheme: 'custom',
                              customPrimaryHex: e.target.value,
                            })
                          }
                          className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white shrink-0"
                        />
                        <input
                          type="text"
                          value={themeSettings.customPrimaryHex || '#047857'}
                          onChange={(e) =>
                            handleThemePatch({
                              colorTheme: 'custom',
                              customPrimaryHex: e.target.value,
                            })
                          }
                          className="w-full h-9 px-2.5 border border-slate-200 rounded-lg text-xs font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        Warna Gradasi / Sekunder (Secondary Hex)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeSettings.customSecondaryHex || '#0f172a'}
                          onChange={(e) =>
                            handleThemePatch({
                              colorTheme: 'custom',
                              customSecondaryHex: e.target.value,
                            })
                          }
                          className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white shrink-0"
                        />
                        <input
                          type="text"
                          value={themeSettings.customSecondaryHex || '#0f172a'}
                          onChange={(e) =>
                            handleThemePatch({
                              colorTheme: 'custom',
                              customSecondaryHex: e.target.value,
                            })
                          }
                          className="w-full h-9 px-2.5 border border-slate-200 rounded-lg text-xs font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        Warna Latar Web Kustom (Opsional)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeSettings.customPageBgHex || '#f8fafc'}
                          onChange={(e) =>
                            handleThemePatch({ customPageBgHex: e.target.value })
                          }
                          className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white shrink-0"
                        />
                        <input
                          type="text"
                          value={themeSettings.customPageBgHex || ''}
                          onChange={(e) =>
                            handleThemePatch({ customPageBgHex: e.target.value })
                          }
                          placeholder="Default sesuai gaya latar"
                          className="w-full h-9 px-2.5 border border-slate-200 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* 1B. MODE PERMUKAAN, LATAR HALAMAN, TEKSTUR & SCROLLBAR          */}
              {/* =============================================================== */}
              {(webStyleSubTab === 'all' || webStyleSubTab === '1b') && (
                <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <Layers className={`w-4 h-4 ${themeClasses.primaryText}`} />
                      <span>1B. Mode Permukaan, Gaya Latar Halaman, Tekstur & Scrollbar</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Atur suasana warna permukaan (*Light, Soft Tinted, Sepia, Slate Dim, Dark Elevated*), pola tekstur halaman, dan gaya scrollbar.
                    </p>
                  </div>

                  {/* Per-Device Dark Mode Switch (Khusus Perangkat Ini) */}
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        {isDeviceDarkMode ? (
                          <Moon className="w-5 h-5 text-amber-300" />
                        ) : (
                          <Sun className="w-5 h-5 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white block">
                            Mode Malam (Khusus Perangkat Ini)
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/25 text-emerald-300 border border-emerald-400/30">
                            Lokal Perangkat
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-300 block mt-0.5">
                          Hanya berlaku untuk browser/perangkat yang Anda gunakan saat ini. Tidak memengaruhi perangkat guru/pengguna lain.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleDeviceDarkMode()}
                      className={`btn-precision shrink-0 ${
                        isDeviceDarkMode
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm'
                          : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                      }`}
                    >
                      {isDeviceDarkMode ? (
                        <>
                          <Sun className="w-4 h-4 text-slate-950" />
                          <span>Mode Malam: Aktif</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4 text-amber-300" />
                          <span>Mode Malam: Nonaktif</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Surface Mode (Tersinkronisasi ke Seluruh Pengguna) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 block">
                        Suasana Permukaan Bersama (Surface Atmosphere)
                      </label>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        ✓ Tersinkronisasi Otomatis ke Seluruh Pengguna
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {[
                        { id: 'light', label: 'Terang Standar', desc: 'Putih bersih proporsional' },
                        { id: 'soft_tinted', label: 'Nuansa Lembut', desc: 'Sentuhan halus warna tema' },
                        { id: 'high_contrast', label: 'Kontras Tinggi', desc: 'Garis border & teks tajam' },
                        { id: 'sepia_warm', label: 'Kertas Hangat', desc: 'Krem klasik ramah baca' },
                        { id: 'slate_dim', label: 'Redup Sejuk', desc: 'Abu lembut nyaman santai' },
                        { id: 'dark_elevated', label: 'Gelap Elegan', desc: 'Mode malam semua user' },
                      ].map((m) => {
                        const currentSurface = themeSettings.surfaceMode || 'light';
                        const active = currentSurface === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() =>
                              handleThemePatch({
                                surfaceMode: m.id as any,
                                surfaceThemeMode:
                                  m.id === 'dark_elevated'
                                    ? 'dark_slate'
                                    : m.id === 'sepia_warm'
                                    ? 'soft_sepia'
                                    : 'light',
                              })
                            }
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              active
                                ? 'border-brand-custom bg-white ring-2 ring-slate-900/10 font-bold'
                                : 'border-slate-200 bg-white/70 hover:bg-white'
                            }`}
                          >
                            <span className="text-xs text-slate-900 block">{m.label}</span>
                            <span className="text-[10px] text-slate-500 font-normal block">
                              {m.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Page Background Style */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      Gaya Latar Belakang Halaman Web (7 Pilihan)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                      {[
                        { id: 'clean', label: 'Abu Sejuk', hex: '#f8fafc' },
                        { id: 'warm', label: 'Krem Hangat', hex: '#fafaf9' },
                        { id: 'paper', label: 'Kertas Akademik', hex: '#fefdf8' },
                        { id: 'cool_slate', label: 'Slate Dingin', hex: '#f1f5f9' },
                        { id: 'mint_breeze', label: 'Sejuk Pesantren', hex: '#f2fbf7' },
                        { id: 'tinted', label: 'Nuansa Tema', hex: '#ecfdf5' },
                        { id: 'mesh', label: 'Gradasi Halus', hex: '#eef2ff' },
                      ].map((bg) => {
                        const active =
                          (themeSettings.pageBgStyle || 'clean') === bg.id &&
                          !themeSettings.customPageBgHex;
                        return (
                          <button
                            key={bg.id}
                            type="button"
                            onClick={() =>
                              handleThemePatch({
                                pageBgStyle: bg.id as any,
                                customPageBgHex: '',
                              })
                            }
                            className={`h-9 px-2.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              active
                                ? 'border-slate-900 bg-white text-slate-900 shadow-2xs ring-1 ring-slate-900/10'
                                : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                              style={{ backgroundColor: bg.hex }}
                            />
                            <span className="truncate">{bg.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pattern & Scrollbar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-2">
                        Pola Tekstur Dekoratif Latar Halaman (6 Pilihan)
                      </label>
                      <select
                        value={themeSettings.bgPattern || themeSettings.pagePattern || 'none'}
                        onChange={(e) =>
                          handleThemePatch({
                            bgPattern: e.target.value as any,
                            pagePattern: e.target.value as any,
                          })
                        }
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="none">Polos Bersih (Tanpa Pola)</option>
                        <option value="dots">Titik Halus Presisi (Subtle Dots)</option>
                        <option value="grid">Garis Kisi Akademik (Academic Grid)</option>
                        <option value="islamic_geo">Ornamen Geometris Islami Halus</option>
                        <option value="diagonal">Garis Diagonal Arsitektural</option>
                        <option value="crosshatch">Anyaman Tekstur Halus (Crosshatch)</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-2">
                        Gaya Scrollbar Halaman Web
                      </label>
                      <select
                        value={themeSettings.scrollbarStyle || 'default'}
                        onChange={(e) =>
                          handleThemePatch({ scrollbarStyle: e.target.value as any })
                        }
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="default">Standar Sistem</option>
                        <option value="thin">Ramping Modern (Thin)</option>
                        <option value="accent">Berwarna Mengikuti Aksen Tema</option>
                        <option value="minimal">Sangat Minimalis</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* 1C. GAYA KARTU, AKSEN GARIS, BAYANGAN, KETEBALAN & SUDUT        */}
              {/* =============================================================== */}
              {(webStyleSubTab === 'all' || webStyleSubTab === '1c') && (
                <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <Sliders className={`w-4 h-4 ${themeClasses.primaryText}`} />
                      <span>1C. Gaya Kartu, Aksen Garis, Efek Hover, Bayangan & Sudut</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Sesuaikan bentuk visual seluruh kartu panel, garis aksen atas/samping, kedalaman bayangan, ketebalan border, dan kelengkungan sudut.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Gaya Permukaan Kartu & Panel (6 Pilihan)
                      </label>
                      <select
                        value={themeSettings.cardStyle || themeSettings.cardSurfaceStyle || 'bordered'}
                        onChange={(e) =>
                          handleThemePatch({
                            cardStyle: e.target.value as any,
                            cardSurfaceStyle: e.target.value as any,
                          })
                        }
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="bordered">Garis Tepi Presisi (Bordered)</option>
                        <option value="elevated">Bayangan Lembut 3D (Elevated)</option>
                        <option value="flat">Minimalis Datar (Flat)</option>
                        <option value="glass">Kaca Transparan (Glassmorphism)</option>
                        <option value="soft_accent">Nuansa Aksen Tema (Soft Accent)</option>
                        <option value="neo_brutal">Tegas Kontras (Neo-Brutalist)</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Aksen Garis Dekoratif Kartu
                      </label>
                      <select
                        value={themeSettings.cardAccentBar || 'none'}
                        onChange={(e) =>
                          handleThemePatch({ cardAccentBar: e.target.value as any })
                        }
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="none">Tanpa Garis Aksen</option>
                        <option value="top_line">Garis Aksen Atas (Top Bar)</option>
                        <option value="left_line">Garis Aksen Samping Kiri (Left Bar)</option>
                        <option value="gradient_top">Pita Gradasi Atas (Gradient Top)</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Efek Interaksi Hover Kartu
                      </label>
                      <select
                        value={themeSettings.cardHoverEffect || 'lift'}
                        onChange={(e) =>
                          handleThemePatch({ cardHoverEffect: e.target.value as any })
                        }
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="lift">Terangkat Halus (Hover Lift)</option>
                        <option value="glow">Pendaran Cahaya Tema (Hover Glow)</option>
                        <option value="border_highlight">Sorotan Garis Tepi Aksen</option>
                        <option value="scale_subtle">Perbesaran Halus (Subtle Scale)</option>
                        <option value="none">Statis (Tanpa Efek Hover)</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Intensitas Bayangan Kartu (Shadow)
                      </label>
                      <select
                        value={themeSettings.shadowIntensity || 'subtle'}
                        onChange={(e) =>
                          handleThemePatch({ shadowIntensity: e.target.value as any })
                        }
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="none">Tanpa Bayangan (Flat)</option>
                        <option value="subtle">Bayangan Halus (Subtle)</option>
                        <option value="medium">Bayangan Menengah (Medium)</option>
                        <option value="deep">Bayangan Dalam & Tegas (Deep)</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Ketebalan & Ketajaman Garis Tepi (Border)
                      </label>
                      <select
                        value={themeSettings.borderWidth || 'normal'}
                        onChange={(e) =>
                          handleThemePatch({
                            borderWidth: e.target.value as any,
                            borderContrast:
                              e.target.value === 'thick'
                                ? 'high'
                                : e.target.value === 'thin'
                                ? 'subtle'
                                : 'normal',
                          })
                        }
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="thin">Tipis & Lembut (1px Halus)</option>
                        <option value="normal">Standar Presisi (1px Normal)</option>
                        <option value="thick">Tebal & Kontras Tinggi (1.5px Tegas)</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Kelengkungan Sudut Elemen (Border Radius - 5 Pilihan)
                      </label>
                      <select
                        value={themeSettings.borderRadius || 'modern'}
                        onChange={(e) =>
                          handleThemePatch({
                            borderRadius: e.target.value as ThemeBorderRadius,
                          })
                        }
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="sharp">Siku Tegas Arsitektural (Sharp 4px)</option>
                        <option value="subtle">Sedikit Melengkung (Subtle 8px)</option>
                        <option value="modern">Modern Proporsional (Modern 14px)</option>
                        <option value="rounded">Membulat Lembut (Rounded 20px)</option>
                        <option value="pill">Kapsul Penuh (Extra Rounded 26px)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* 1D. GAYA TABEL DATA, TOMBOL, KOLOM INPUT, LENCANA & MODAL       */}
              {/* =============================================================== */}
              {(webStyleSubTab === 'all' || webStyleSubTab === '1d') && (
                <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <Grid className={`w-4 h-4 ${themeClasses.primaryText}`} />
                      <span>1D. Gaya Tabel Data, Tombol Aksi, Kolom Input, Lencana & Modal</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Kustomisasi tampilan komponen interaktif di seluruh halaman aplikasi web.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Gaya Tabel Data Web
                      </label>
                      <select
                        value={themeSettings.tableStyle || themeSettings.webTableStyle || 'clean'}
                        onChange={(e) =>
                          handleThemePatch({
                            tableStyle: e.target.value as any,
                            webTableStyle: e.target.value as any,
                          })
                        }
                        className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="clean">Bersih Minimalis (Clean)</option>
                        <option value="striped">Selang-Seling (Zebra Striped)</option>
                        <option value="bordered">Garis Kisi Penuh (Grid Border)</option>
                        <option value="compact_grid">Tabel Rapat & Padat</option>
                        <option value="modern_card">Baris Kartu Modern</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Gaya Visual Tombol Utama
                      </label>
                      <select
                        value={themeSettings.buttonStyle || 'solid'}
                        onChange={(e) =>
                          handleThemePatch({ buttonStyle: e.target.value as any })
                        }
                        className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="solid">Warna Solid Standar</option>
                        <option value="gradient">Gradasi Dinamis (Gradient)</option>
                        <option value="glossy">Kilau Halus (Glossy Shine)</option>
                        <option value="elevated_3d">Timbul 3D Presisi</option>
                        <option value="soft_outline">Garis Tepi Tegas</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Gaya Kolom Input & Form
                      </label>
                      <select
                        value={themeSettings.inputStyle || 'outlined'}
                        onChange={(e) =>
                          handleThemePatch({ inputStyle: e.target.value as any })
                        }
                        className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="outlined">Garis Tepi Standar (Outlined)</option>
                        <option value="filled">Latar Terisi Lembut (Filled)</option>
                        <option value="underlined">Garis Bawah Modern (Underlined)</option>
                        <option value="soft_ring">Sorotan Cincin Aksen (Soft Ring)</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Gaya Lencana & Label (Badge)
                      </label>
                      <select
                        value={themeSettings.badgeStyle || 'soft'}
                        onChange={(e) =>
                          handleThemePatch({ badgeStyle: e.target.value as any })
                        }
                        className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="soft">Warna Pastel Lembut (Soft)</option>
                        <option value="solid">Warna Kontras Penuh (Solid)</option>
                        <option value="outline">Garis Tepi Presisi (Outline)</option>
                        <option value="pill_dot">Kapsul Modern (Pill)</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Gaya Latar Dialog Modal
                      </label>
                      <select
                        value={themeSettings.modalBackdropStyle || 'blur_dark'}
                        onChange={(e) =>
                          handleThemePatch({ modalBackdropStyle: e.target.value as any })
                        }
                        className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="blur_dark">Gelap Buram (Dark Frosted Blur)</option>
                        <option value="blur_light">Terang Buram (Light Frosted)</option>
                        <option value="solid_dark">Gelap Pekat Klasik</option>
                        <option value="glass_tint">Kaca Berwarna Tema</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* 1E. TATA LETAK NAVIGASI, HEADER, SIDEBAR & LEBAR KONTEN         */}
              {/* =============================================================== */}
              {(webStyleSubTab === 'all' || webStyleSubTab === '1e') && (
                <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <Layout className={`w-4 h-4 ${themeClasses.primaryText}`} />
                      <span>1E. Tata Letak Navigasi, Gaya Header, Sidebar & Lebar Konten</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Atur posisi menu utama (*Topbar / Sidebar*), gaya warna header & sidebar, indikator tab aktif, lebar halaman, dan kerapatan elemen.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-2.5">
                        Gaya & Warna Header Atas (6 Pilihan)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'light', title: 'Putih Bersih', desc: 'Terang minimalis' },
                          { id: 'dark', title: 'Hitam Elegan', desc: 'Slate gelap kontras' },
                          { id: 'colored', title: 'Warna Tema', desc: 'Aksen warna utama' },
                          { id: 'gradient', title: 'Gradasi Tema', desc: 'Gradasi dua warna' },
                          { id: 'glass', title: 'Kaca Transparan', desc: 'Frosted blur modern' },
                          { id: 'minimal_border', title: 'Garis Aksen Bawah', desc: 'Putih + pita tema' },
                        ].map((style) => {
                          const currentHeader =
                            themeSettings.headerStyle === 'brand'
                              ? 'colored'
                              : themeSettings.headerStyle || 'light';
                          return (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => handleThemePatch({ headerStyle: style.id as any })}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                currentHeader === style.id
                                  ? 'border-slate-900 ring-2 ring-slate-900/10 bg-slate-50 font-bold'
                                  : 'border-slate-200 bg-white hover:bg-slate-50/70'
                              }`}
                            >
                              <span className="text-xs text-slate-900 block">{style.title}</span>
                              <span className="text-[10px] text-slate-500 font-normal block">
                                {style.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-2.5">
                        Gaya & Warna Sidebar Samping (5 Pilihan)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'light', title: 'Putih Bersih', desc: 'Terang & rapi' },
                          { id: 'dark', title: 'Hitam Pekat', desc: 'Slate gelap elegan' },
                          { id: 'tinted', title: 'Warna Institusi', desc: 'Mengikuti warna tema' },
                          { id: 'gradient', title: 'Gradasi Tema', desc: 'Gradasi vertikal' },
                          { id: 'bordered_clean', title: 'Garis Tegas', desc: 'Putih garis aksen' },
                        ].map((s) => {
                          const currentSidebar =
                            themeSettings.sidebarStyle === 'brand' ||
                            themeSettings.sidebarStyle === 'colored'
                              ? 'tinted'
                              : themeSettings.sidebarStyle || 'light';
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleThemePatch({ sidebarStyle: s.id as any })}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                currentSidebar === s.id
                                  ? 'border-slate-900 ring-2 ring-slate-900/10 bg-slate-50 font-bold'
                                  : 'border-slate-200 bg-white hover:bg-slate-50/70'
                              }`}
                            >
                              <span className="text-xs text-slate-900 block">{s.title}</span>
                              <span className="text-[10px] text-slate-500 font-normal block">
                                {s.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Posisi Navigasi Utama
                      </label>
                      <select
                        value={themeSettings.layout || 'topbar'}
                        onChange={(e) =>
                          handleThemePatch({ layout: e.target.value as ThemeLayout })
                        }
                        className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="topbar">Navigasi Atas (Topbar)</option>
                        <option value="sidebar">Menu Samping (Sidebar)</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Indikator Tab & Menu Aktif
                      </label>
                      <select
                        value={themeSettings.activeTabIndicator || 'pill'}
                        onChange={(e) =>
                          handleThemePatch({ activeTabIndicator: e.target.value as any })
                        }
                        className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="pill">Kapsul Penuh (Pill Button)</option>
                        <option value="underline">Garis Bawah Tegas (Underline)</option>
                        <option value="soft_box">Kotak Berbingkai Halus</option>
                        <option value="left_bar">Garis Samping Kiri</option>
                        <option value="gradient_glow">Gradasi Bercahaya (Glow)</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Lebar Kontainer Halaman
                      </label>
                      <select
                        value={themeSettings.contentWidth || 'contained'}
                        onChange={(e) =>
                          handleThemePatch({ contentWidth: e.target.value as ThemeContentWidth })
                        }
                        className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="contained">Standar Terpusat (1280px)</option>
                        <option value="wide">Lebar Ekstra (1480px)</option>
                        <option value="full">Layar Penuh (100% Full Width)</option>
                        <option value="compact">Ramping Fokus (1024px)</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Kerapatan Elemen (Density)
                      </label>
                      <select
                        value={themeSettings.density || 'comfortable'}
                        onChange={(e) =>
                          handleThemePatch({ density: e.target.value as ThemeDensity })
                        }
                        className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="compact">Padat & Ringkas (Compact)</option>
                        <option value="comfortable">Nyaman Standar (Comfortable)</option>
                        <option value="spacious">Lega & Lapang (Spacious)</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Jarak Antar Bagian (Spacing)
                      </label>
                      <select
                        value={themeSettings.sectionSpacing || 'normal'}
                        onChange={(e) =>
                          handleThemePatch({ sectionSpacing: e.target.value as any })
                        }
                        className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="tight">Rapat (Tight)</option>
                        <option value="normal">Proporsional (Normal)</option>
                        <option value="relaxed">Lega (Relaxed)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* 1F. GAYA BANNER SAMBUTAN (HERO) & STATISTIK DASHBOARD           */}
              {/* =============================================================== */}
              {(webStyleSubTab === 'all' || webStyleSubTab === '1f') && (
                <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <Sparkles className={`w-4 h-4 ${themeClasses.primaryText}`} />
                      <span>1F. Gaya Visual Banner Sambutan (Hero) & Statistik Dashboard (20 Hero + 16 Metrik)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pilihan desain terlengkap: 20 gaya visual hero banner (Islami, Eksklusif, Kaca, Modern, Futuristik, Kaligrafi, Galaksi) dan 16 gaya kartu statistik metrik dashboard.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {/* Hero Banner Style Selector (20 Choices) */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5 flex items-center justify-between">
                        <span>Desain Visual Hero Banner</span>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          20 Pilihan
                        </span>
                      </label>
                      <select
                        value={themeSettings.heroBannerStyle || 'gradient_brand'}
                        onChange={(e) =>
                          handleThemePatch({ heroBannerStyle: e.target.value as any })
                        }
                        className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="gradient_brand">Gradasi Warna Tema (Standar Default)</option>
                        <option value="royal_emerald">Zamrud Eksklusif Berornamen Emas (Mewah & Khidmat)</option>
                        <option value="islamic_calligraphy">Kaligrafi Arabesque Pesantren (Nilai Tradisi Luhur)</option>
                        <option value="islamic_arch">Kubah Mihrab Islami Geometris</option>
                        <option value="dark_elegant">Gelap Elegan Eksklusif (Slate Premium)</option>
                        <option value="light_clean">Terang Bersih Minimalis</option>
                        <option value="glass_modern">Kaca Modern (Glass Panel Transparan)</option>
                        <option value="split_accent">Putih Garis Aksen Samping (Clean Border)</option>
                        <option value="pastel_mint">Mint Sejuk Pesantren (Adem & Lembut)</option>
                        <option value="cosmic_galaxy">Galaksi Midnight Violet (Spektakuler)</option>
                        <option value="aurora_mesh">Aurora Cahaya Spektrum Multi-Warna</option>
                        <option value="geometric_mosaic">Mosaik Geometri Emas & Slate</option>
                        <option value="vintage_parchment">Naskah Kuno Pergamena Emas (Klasik Serif)</option>
                        <option value="ocean_breeze">Gradasi Laut Teduh Azure & Tosika</option>
                        <option value="crimson_luxury">Marun Beludru & Mawar Emas (Karismatik)</option>
                        <option value="cyber_academic">Neon High-Tech Cyber Academic</option>
                        <option value="editorial_card">Gaya Kartu Editorial Serif Presisi</option>
                        <option value="compact_ribbon">Pita Horisontal Ringkas & Rapi</option>
                        <option value="sunset_warmth">Hangat Lembayung Sore Oranye-Cokelat</option>
                        <option value="modern_stacked">Dua Nada Diagonal Modern Bertingkat</option>
                      </select>
                    </div>

                    {/* Stats Card Style Selector (16 Choices) */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5 flex items-center justify-between">
                        <span>Gaya Kartu Statistik Metrik</span>
                        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          16 Pilihan
                        </span>
                      </label>
                      <select
                        value={themeSettings.statsCardStyle || 'modern_elevated'}
                        onChange={(e) =>
                          handleThemePatch({ statsCardStyle: e.target.value as any })
                        }
                        className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="modern_elevated">Modern Elevated (Kartu Bersih Bayangan Halus)</option>
                        <option value="floating_card_3d">3D Floating Card (Mengambang Mewah Pita Atas)</option>
                        <option value="glass_glow">Kaca Transparan Glow (Blur Halus Garis Atas)</option>
                        <option value="split_metric">Split Duotone Header (Kepala Berwarna + Nilai)</option>
                        <option value="dark_oled_glow">Dark OLED Neon Glow (Hitam Pekat Lampu Neon)</option>
                        <option value="minimal_bordered">Minimal Bordered (Garis Tepi Bersih Aksen Kiri)</option>
                        <option value="kpi_target_gauge">KPI Target & Gauge (Meteran Progres & Persen)</option>
                        <option value="bento_compact">Bento Box Grid (Desain Grid Kompak Modern)</option>
                        <option value="neo_brutalist">Neo-Brutalist 3D (Border Tebal & Bayangan Retro)</option>
                        <option value="gradient_accent">Soft Gradient Accent (Gradasi Warna Tema Lembut)</option>
                        <option value="soft_neumorphic">Soft Neumorphic (Embossed Masuk/Keluar Halus)</option>
                        <option value="ribbon_badge">Ribbon Corner Badge (Pita Badge Sudut Menyilang)</option>
                        <option value="accent_bottom_wave">Accent Bottom Bar (Garis Aksen Bawah Berwarna)</option>
                        <option value="pill_duotone">Pill Duotone Capsule (Kapsul Melengkung Dua Warna)</option>
                        <option value="compact_bar">Compact Bar Line (Baris Horisontal Hemat Ruang)</option>
                        <option value="circular_badge">Circular Badge Accent (Ikon Melingkar Besar)</option>
                      </select>
                    </div>

                    {/* Banner Height */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Ukuran Tinggi Hero Banner
                      </label>
                      <select
                        value={themeSettings.heroBannerHeight || 'standard'}
                        onChange={(e) =>
                          handleThemePatch({ heroBannerHeight: e.target.value as any })
                        }
                        className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="compact">Ringkas & Ramping (Compact)</option>
                        <option value="standard">Standar Proporsional</option>
                        <option value="spacious">Besar & Megah (Spacious)</option>
                      </select>
                    </div>
                  </div>

                  {/* Toggle Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <label className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">
                          Tampilkan Hero Banner
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Banner sambutan utama di atas Dashboard
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={themeSettings.showHeroBanner !== false}
                        onChange={(e) =>
                          handleThemePatch({ showHeroBanner: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                      />
                    </label>

                    <label className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">
                          Kotak Ringkasan di Hero
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Info Tahun Ajaran, Kelas & Status KKM
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={themeSettings.showHeroStats !== false}
                        onChange={(e) =>
                          handleThemePatch({ showHeroStats: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                      />
                    </label>

                    <label className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">
                          Badge Tren di Kartu Statistik
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Pill info tambahan di samping angka metrik
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={themeSettings.showStatTrends !== false}
                        onChange={(e) =>
                          handleThemePatch({ showStatTrends: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* 1G. TIPOGRAFI, FONT JUDUL, SKALA TEKS & SPASI BARIS             */}
              {/* =============================================================== */}
              {(webStyleSubTab === 'all' || webStyleSubTab === '1g') && (
                <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <Type className={`w-4 h-4 ${themeClasses.primaryText}`} />
                      <span>1G. Tipografi Web, Font Judul, Skala Ukuran Teks & Spasi Baris</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Atur jenis huruf utama, jenis huruf judul, skala ukuran teks, ketebalan judul, kerapatan huruf, dan tinggi baris.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Jenis Huruf Utama Web (6 Pilihan)
                      </label>
                      <select
                        value={themeSettings.fontFamily || themeSettings.webFontFamily || 'jakarta'}
                        onChange={(e) =>
                          handleThemePatch({
                            fontFamily: e.target.value as any,
                            webFontFamily: e.target.value as any,
                          })
                        }
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="jakarta">Plus Jakarta Sans (Modern Standar)</option>
                        <option value="inter">Inter UI (Lugas & Bersih)</option>
                        <option value="poppins">Poppins / Geometric Sans</option>
                        <option value="nunito">Nunito / Humanist Rounded</option>
                        <option value="serif">Amiri / Georgia (Klasik Akademik)</option>
                        <option value="mono">JetBrains / Monospace Teknis</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Jenis Huruf Khusus Judul (Heading Font)
                      </label>
                      <select
                        value={themeSettings.headingFontFamily || 'inherit'}
                        onChange={(e) =>
                          handleThemePatch({ headingFontFamily: e.target.value as any })
                        }
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="inherit">Mengikuti Huruf Utama Web</option>
                        <option value="jakarta">Plus Jakarta Sans Display</option>
                        <option value="inter">Inter Tight Display</option>
                        <option value="serif">Klasik Serif (Amiri / Georgia)</option>
                        <option value="poppins">Geometric Sans</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Skala Ukuran Teks Web (4 Pilihan)
                      </label>
                      <select
                        value={themeSettings.fontScale || 'normal'}
                        onChange={(e) =>
                          handleThemePatch({ fontScale: e.target.value as any })
                        }
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="small">Ramping & Padat (95%)</option>
                        <option value="normal">Standar Proporsional (100%)</option>
                        <option value="large">Besar & Jelas (105%)</option>
                        <option value="xlarge">Ekstra Besar (110%)</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Ketebalan Huruf Judul (Heading Weight)
                      </label>
                      <select
                        value={themeSettings.headingWeight || 'bold'}
                        onChange={(e) =>
                          handleThemePatch({ headingWeight: e.target.value as any })
                        }
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="semibold">Semi-Tebal Halus (600)</option>
                        <option value="bold">Tebal Standar (700)</option>
                        <option value="extrabold">Ekstra Tebal Tegas (800)</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Kerapatan Huruf Judul (Letter Spacing)
                      </label>
                      <select
                        value={themeSettings.headingLetterSpacing || 'tight'}
                        onChange={(e) =>
                          handleThemePatch({ headingLetterSpacing: e.target.value as any })
                        }
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="tight">Rapat Modern (Tight)</option>
                        <option value="normal">Standar Normal</option>
                        <option value="wide">Lebar Elegan (Wide)</option>
                      </select>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-900 text-xs block mb-1.5">
                        Spasi Tinggi Baris Teks (Line Height)
                      </label>
                      <select
                        value={themeSettings.lineHeight || 'normal'}
                        onChange={(e) =>
                          handleThemePatch({ lineHeight: e.target.value as any })
                        }
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="tight">Rapat (1.35)</option>
                        <option value="normal">Standar Nyaman (1.5)</option>
                        <option value="relaxed">Lega & Mudah Dibaca (1.68)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* 1H. ANIMASI TRANSISI, KECEPATAN RUNNING PENGUMUMAN & SAKLAR UI  */}
              {/* =============================================================== */}
              {(webStyleSubTab === 'all' || webStyleSubTab === '1h') && (
                <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                        <Eye className={`w-4 h-4 ${themeClasses.primaryText}`} />
                        <span>1H. Gaya Animasi, Kecepatan Running Pengumuman & Saklar UI</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Atur kecepatan teks berjalan (running pengumuman), efek transisi halaman, kaca buram (*glassmorphism*), hingga saklar antarmuka.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={themeSettings.announcementSpeed || 'normal'}
                        onChange={(e) =>
                          handleThemePatch({ announcementSpeed: e.target.value as any })
                        }
                        className="filter-control bg-white"
                        title="Kecepatan Running Teks Pengumuman"
                      >
                        <option value="very_slow">Running: Sangat Lambat (0.5x)</option>
                        <option value="slow">Running: Lambat (0.75x)</option>
                        <option value="normal">Running: Normal (1x)</option>
                        <option value="fast">Running: Cepat (1.5x)</option>
                        <option value="very_fast">Running: Sangat Cepat (2x)</option>
                      </select>

                      <select
                        value={themeSettings.animationStyle || 'fade'}
                        onChange={(e) =>
                          handleThemePatch({ animationStyle: e.target.value as any })
                        }
                        className="filter-control bg-white"
                      >
                        <option value="fade">Animasi Halus (Smooth Fade)</option>
                        <option value="slide_up">Meluncur ke Atas (Slide Up)</option>
                        <option value="zoom_subtle">Zoom Halus (Subtle Scale)</option>
                        <option value="none">Instan Tanpa Animasi</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {[
                      {
                        key: 'stickyHeader',
                        label: 'Header Mengambang (Sticky Navbar)',
                        desc: 'Navigasi atas tetap terlihat saat halaman digulir',
                        defaultVal: true,
                      },
                      {
                        key: 'showAnnouncement',
                        label: 'Baris Info Akademik Atas',
                        desc: 'Tampilkan pita pengumuman tersemat di atas halaman',
                        defaultVal: true,
                      },
                      {
                        key: 'showFooter',
                        label: 'Footer Informasi Lembaga',
                        desc: 'Tampilkan kaki halaman informasi madrasah di bawah',
                        defaultVal: true,
                      },
                      {
                        key: 'tableRowHoverHighlight',
                        label: 'Sorotan Hover Baris Tabel',
                        desc: 'Beri warna lembut saat kursor menunjuk baris tabel',
                        defaultVal: true,
                      },
                      {
                        key: 'enableGlassmorphism',
                        label: 'Efek Kaca Buram (Glassmorphism)',
                        desc: 'Aktifkan efek backdrop-blur pada panel transparan',
                        defaultVal: true,
                      },
                      {
                        key: 'enableAnimatedGradients',
                        label: 'Aksen Gradasi Dinamis',
                        desc: 'Percantik banner dengan transisi gradasi hidup',
                        defaultVal: false,
                      },
                      {
                        key: 'highContrastText',
                        label: 'Mode Teks Kontras Tinggi',
                        desc: 'Pertajam warna teks agar lebih jelas dibaca',
                        defaultVal: false,
                      },
                      {
                        key: 'compactMobileNav',
                        label: 'Navigasi Mobile Ringkas',
                        desc: 'Perkecil tinggi bilah menu pada layar ponsel',
                        defaultVal: false,
                      },
                      {
                        key: 'showStatTrends',
                        label: 'Indikator Lencana Statistik',
                        desc: 'Tampilkan lencana indikator pada kartu ringkasan',
                        defaultVal: true,
                      },
                    ].map((sw) => {
                      const rawVal = (themeSettings as any)[sw.key];
                      const isChecked =
                        rawVal === undefined ? sw.defaultVal : Boolean(rawVal);
                      return (
                        <label
                          key={sw.key}
                          className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              handleThemePatch({ [sw.key]: e.target.checked } as any)
                            }
                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900 shrink-0"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block leading-snug">
                              {sw.label}
                            </span>
                            <span className="text-[10px] text-slate-500 block leading-snug">
                              {sw.desc}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* SECTION 0: MANAJEMEN PENGUMUMAN & PAPAN INFORMASI RESMI (SUPER ADMIN) */}
          {/* ===================================================================== */}
          {(superAdminSection === 'all' || superAdminSection === 'announcements') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
              {/* Header Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Megaphone className={`w-4 h-4 ${themeClasses.primaryText}`} />
                      <span>Manajemen Pengumuman & Running Teks</span>
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {announcements.filter((a) => a.isActive).length} Aktif
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Buat, sunting, sematkan ke banner atas, dan atur kecepatan running pengumuman secara real-time.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 shrink-0 w-full lg:w-auto">
                  {/* Running Announcement Speed Selector */}
                  <div
                    className="filter-group bg-slate-100 grid grid-cols-5 sm:inline-flex w-full sm:w-auto"
                    title="Kecepatan Running Pengumuman"
                  >
                    {[
                      { id: 'very_slow', label: '0.5x' },
                      { id: 'slow', label: '0.75x' },
                      { id: 'normal', label: '1x' },
                      { id: 'fast', label: '1.5x' },
                      { id: 'very_fast', label: '2x' },
                    ].map((spd) => {
                      const active = (themeSettings.announcementSpeed || 'normal') === spd.id;
                      return (
                        <button
                          key={spd.id}
                          type="button"
                          onClick={() => handleThemePatch({ announcementSpeed: spd.id as any })}
                          className={`filter-btn w-full sm:w-auto px-1.5 sm:px-3 ${
                            active
                              ? `${themeClasses.primary} text-white shadow-2xs`
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span>{spd.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() =>
                        handleThemePatch({
                          showAnnouncement: !(themeSettings.showAnnouncement !== false),
                        })
                      }
                      className={`btn-precision w-full sm:w-auto border ${
                        themeSettings.showAnnouncement !== false
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {themeSettings.showAnnouncement !== false ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Banner: Aktif</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>Banner: Nonaktif</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (isAnnFormOpen && !editingAnnId) {
                          setIsAnnFormOpen(false);
                        } else {
                          handleOpenNewAnnouncement();
                        }
                      }}
                      className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white shadow-2xs`}
                    >
                      <Plus className="w-3.5 h-3.5 shrink-0" />
                      <span>Buat Pengumuman</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Create / Edit Announcement Form */}
              {isAnnFormOpen && (
                <form
                  onSubmit={handleSaveAnnouncementForm}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-4 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Megaphone className={`w-3.5 h-3.5 ${themeClasses.primaryText}`} />
                      <span>
                        {editingAnnId ? 'Sunting Pengumuman Resmi' : 'Formulir Pengumuman Baru'}
                      </span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAnnFormOpen(false);
                        setEditingAnnId(null);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Judul Pengumuman <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Jadwal Pengisian Nilai Rapor Semester Genap..."
                        value={annForm.title}
                        onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                        className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Kategori Informasi
                      </label>
                      <select
                        value={annForm.category}
                        onChange={(e) =>
                          setAnnForm({
                            ...annForm,
                            category: e.target.value as AnnouncementItem['category'],
                          })
                        }
                        className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="Akademik">Akademik & Kurikulum</option>
                        <option value="Rapor">Rapor Digital</option>
                        <option value="Tahfidz">Tahfidz Al-Qur&apos;an</option>
                        <option value="Ujian">Ujian & Bank Soal</option>
                        <option value="Penting">Instruksi Penting</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Tingkat Prioritas
                      </label>
                      <select
                        value={annForm.priority}
                        onChange={(e) =>
                          setAnnForm({
                            ...annForm,
                            priority: e.target.value as AnnouncementItem['priority'],
                          })
                        }
                        className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="normal">Informasi Standar</option>
                        <option value="important">Penting (Sorotan Kuning)</option>
                        <option value="urgent">Mendesak / Segera (Sorotan Merah)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
                    <div className="lg:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Isi Detail Pengumuman <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Tuliskan isi pengumuman secara jelas untuk ditampilkan di papan informasi dashboard dan banner..."
                        value={annForm.content}
                        onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div className="space-y-2.5 flex flex-col justify-between">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Diterbitkan Oleh (Penulis / Jabatan)
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Kepala Madrasah / Bagian Kurikulum"
                          value={annForm.author}
                          onChange={(e) => setAnnForm({ ...annForm, author: e.target.value })}
                          className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                        <label className="flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={annForm.isActive}
                            onChange={(e) =>
                              setAnnForm({ ...annForm, isActive: e.target.checked })
                            }
                            className="rounded border-slate-300 text-slate-900"
                          />
                          <span className="text-[11px] font-semibold text-slate-700">
                            Tampilkan Aktif di Dashboard
                          </span>
                        </label>

                        <label className="flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={annForm.isPinned}
                            onChange={(e) =>
                              setAnnForm({ ...annForm, isPinned: e.target.checked })
                            }
                            className="rounded border-slate-300 text-slate-900"
                          />
                          <span className="text-[11px] font-semibold text-slate-700">
                            Sematkan ke Banner Atas Web
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAnnFormOpen(false);
                        setEditingAnnId(null);
                      }}
                      className="btn-precision w-full sm:w-auto border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white shadow-2xs`}
                    >
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Simpan</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Precision Filter Toolbar for Announcements */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
                <div className="filter-group bg-white grid grid-cols-3 sm:inline-flex w-full lg:w-auto">
                  {(['ALL', 'Akademik', 'Rapor', 'Tahfidz', 'Ujian', 'Penting'] as const).map(
                    (cat) => {
                      const active = annCategoryFilter === cat;
                      const count =
                        cat === 'ALL'
                          ? announcements.length
                          : announcements.filter((a) => a.category === cat).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setAnnCategoryFilter(cat)}
                          className={`filter-btn w-full sm:w-auto px-1.5 sm:px-3 ${
                            active
                              ? `${themeClasses.primary} text-white shadow-2xs`
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span>{cat === 'ALL' ? 'Semua' : cat}</span>
                          <span
                            className={`filter-badge ${
                              active ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>

                <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
                  <select
                    value={annStatusFilter}
                    onChange={(e) => setAnnStatusFilter(e.target.value as any)}
                    className="filter-control bg-white w-full sm:w-auto"
                  >
                    <option value="ALL">Semua Status ({announcements.length})</option>
                    <option value="ACTIVE">
                      Tayang Aktif ({announcements.filter((a) => a.isActive).length})
                    </option>
                    <option value="DRAFT">
                      Disembunyikan ({announcements.filter((a) => !a.isActive).length})
                    </option>
                  </select>

                  <div className="relative flex-1 sm:w-56 sm:min-w-[180px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Cari pengumuman..."
                      value={annSearch}
                      onChange={(e) => setAnnSearch(e.target.value)}
                      className="filter-control bg-white w-full pl-8"
                    />
                  </div>

                  {(annCategoryFilter !== 'ALL' || annStatusFilter !== 'ALL' || annSearch) && (
                    <button
                      type="button"
                      onClick={() => {
                        setAnnCategoryFilter('ALL');
                        setAnnStatusFilter('ALL');
                        setAnnSearch('');
                      }}
                      className="filter-reset-btn w-full sm:w-auto justify-center"
                    >
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Announcements List */}
              {filteredAnnouncements.length === 0 ? (
                <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <Megaphone className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">
                    Tidak ada pengumuman yang sesuai dengan filter pencarian.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAnnouncements.map((item) => {
                    const priorityBadge =
                      item.priority === 'urgent'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : item.priority === 'important'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200';
                    const priorityLabel =
                      item.priority === 'urgent'
                        ? 'Mendesak'
                        : item.priority === 'important'
                        ? 'Penting'
                        : 'Standar';

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                          item.isPinned
                            ? 'bg-emerald-50/30 border-emerald-300/80 shadow-2xs'
                            : item.isActive
                            ? 'bg-white border-slate-200 hover:border-slate-300'
                            : 'bg-slate-50/60 border-slate-200/70 opacity-75'
                        }`}
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${themeClasses.primaryLightBg} ${themeClasses.primaryText} ${themeClasses.primaryBorder}`}
                            >
                              {item.category}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${priorityBadge}`}
                            >
                              {priorityLabel}
                            </span>
                            {item.isPinned && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 text-white">
                                <Pin className="w-2.5 h-2.5" />
                                <span>Banner Utama</span>
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                item.isActive
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              {item.isActive ? 'Tayang Aktif' : 'Disembunyikan'}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{item.content}</p>

                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                            <span className="inline-flex items-center gap-1 font-medium text-slate-500">
                              <UserCheck className="w-3 h-3" />
                              {item.author}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {item.date}
                            </span>
                          </div>
                        </div>

                        {/* Precision Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 w-full lg:w-auto">
                          {confirmDeleteAnnId === item.id ? (
                            <div className="grid grid-cols-2 sm:flex items-center gap-1.5 w-full lg:w-auto">
                              <button
                                type="button"
                                onClick={() => {
                                  deleteAnnouncement(item.id);
                                  setConfirmDeleteAnnId(null);
                                }}
                                className="btn-precision w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white"
                              >
                                Hapus
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteAnnId(null)}
                                className="btn-precision w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-700"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setPinnedAnnouncement(item.id)}
                                className={`btn-precision flex-1 lg:flex-none px-2 sm:px-3.5 border ${
                                  item.isPinned
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                                title="Jadikan teks pengumuman utama di Banner Atas Web"
                              >
                                <Pin className="w-3 h-3 shrink-0" />
                                <span>{item.isPinned ? 'Tersemat' : 'Pin'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  updateAnnouncement(item.id, { isActive: !item.isActive })
                                }
                                className="btn-precision flex-1 lg:flex-none px-2 sm:px-3.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                                title={item.isActive ? 'Sembunyikan' : 'Tampilkan'}
                              >
                                {item.isActive ? (
                                  <>
                                    <EyeOff className="w-3 h-3 text-slate-500 shrink-0" />
                                    <span>Sembunyikan</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span>Tampilkan</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditAnnouncement(item)}
                                className="btn-precision flex-1 lg:flex-none px-2 sm:px-3.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                                title="Edit Pengumuman"
                              >
                                <Edit2 className="w-3 h-3 shrink-0" />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setConfirmDeleteAnnId(item.id)}
                                className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 inline-flex items-center justify-center transition-colors cursor-pointer"
                                title="Hapus Pengumuman"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* SECTION 2: IDENTITAS LEMBAGA, LOGO & KOP SURAT RAPOR                  */}
          {/* ===================================================================== */}
          {(superAdminSection === 'all' || superAdminSection === 'institution') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className={`w-4 h-4 ${themeClasses.primaryText}`} />
                  <span>2. Identitas Lembaga, Logo & Kop Rapor Digital</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atur logo lembaga, nama yayasan, nama madrasah/pesantren, kepala madrasah, KKM, dan modul aktif.
                </p>
              </div>

              {/* Logo & Icon Picker */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="font-bold text-slate-900 text-xs block">
                      Logo & Ikon Identitas Lembaga
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Ditampilkan di pojok kiri atas aplikasi, halaman login, dan Kop Surat Rapor Digital.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                    <label className="btn-precision w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white cursor-pointer">
                      <Upload className="w-3.5 h-3.5 shrink-0" />
                      <span>Unggah Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        handleThemePatch({
                          customLogoUrl:
                            '/src/assets/images/logo_baiturrahman_1791464090153.jpg',
                          logoIconType: 'image',
                        })
                      }
                      className="btn-precision w-full sm:w-auto border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                    >
                      Reset Logo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {logoOptions.map((opt) => {
                    const isSelected = (themeSettings.logoIconType || 'image') === opt.type;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => handleThemePatch({ logoIconType: opt.type })}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-center text-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'border-slate-900 bg-white text-slate-900 ring-2 ring-slate-900/10 font-bold'
                            : 'border-slate-200 bg-white/60 text-slate-600 hover:bg-white'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? `${themeClasses.primary} text-white`
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {opt.icon}
                        </div>
                        <span className="text-[11px] leading-tight">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                {(themeSettings.logoIconType || 'image') === 'image' && (
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center shrink-0">
                      <img
                        src={
                          themeSettings.customLogoUrl ||
                          siteSettings.customLogoUrl ||
                          '/src/assets/images/logo_baiturrahman_1791464090153.jpg'
                        }
                        alt="Logo"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <input
                      type="text"
                      value={
                        themeSettings.customLogoUrl ||
                        siteSettings.customLogoUrl ||
                        '/src/assets/images/logo_baiturrahman_1791464090153.jpg'
                      }
                      onChange={(e) => handleThemePatch({ customLogoUrl: e.target.value })}
                      placeholder="URL gambar logo atau Base64 hasil unggahan..."
                      className="flex-1 h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Institution Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Yayasan / Penyelenggara (Baris Atas Kop)
                  </label>
                  <input
                    type="text"
                    value={instForm.foundationName}
                    onChange={(e) =>
                      handleInstFieldChange({ foundationName: e.target.value })
                    }
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lembaga / Pesantren / Madrasah
                  </label>
                  <input
                    type="text"
                    value={instForm.schoolName}
                    onChange={(e) => handleInstFieldChange({ schoolName: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Aplikasi Web
                  </label>
                  <input
                    type="text"
                    value={instForm.appName}
                    onChange={(e) => handleInstFieldChange({ appName: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sub-Judul / Slogan Aplikasi
                  </label>
                  <input
                    type="text"
                    value={instForm.subHeader}
                    onChange={(e) => handleInstFieldChange({ subHeader: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alamat Lengkap Lembaga (Tampil di Kop Rapor)
                  </label>
                  <input
                    type="text"
                    value={instForm.schoolAddress}
                    onChange={(e) =>
                      handleInstFieldChange({ schoolAddress: e.target.value })
                    }
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Telepon Lembaga
                  </label>
                  <input
                    type="text"
                    value={instForm.schoolPhone}
                    onChange={(e) => handleInstFieldChange({ schoolPhone: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Resmi & Website
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={instForm.schoolEmail}
                      onChange={(e) =>
                        handleInstFieldChange({ schoolEmail: e.target.value })
                      }
                      placeholder="Email"
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg font-medium"
                    />
                    <input
                      type="text"
                      value={instForm.schoolWebsite}
                      onChange={(e) =>
                        handleInstFieldChange({ schoolWebsite: e.target.value })
                      }
                      placeholder="Website"
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Identitas Statistik (NSM / NPSN / Akreditasi)
                  </label>
                  <input
                    type="text"
                    value={instForm.schoolNsmNpsn}
                    onChange={(e) =>
                      handleInstFieldChange({ schoolNsmNpsn: e.target.value })
                    }
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tahun Ajaran Aktif, Semester Default & KKM Standar
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={instForm.academicYear}
                      onChange={(e) =>
                        handleInstFieldChange({ academicYear: e.target.value })
                      }
                      placeholder="2025/2026"
                      title="Tahun Ajaran Aktif"
                      className="w-full h-9 px-2.5 border border-slate-200 rounded-lg font-medium"
                    />
                    <select
                      value={instForm.defaultSemester}
                      onChange={(e) => {
                        const sem: 1 | 2 = Number(e.target.value) === 2 ? 2 : 1;
                        handleInstFieldChange({ defaultSemester: sem });
                        showToast(
                          `Semester default aktif diatur ke Semester ${sem} (${sem === 1 ? 'Ganjil' : 'Genap'})`,
                          'success'
                        );
                      }}
                      title="Semester Default Aktif"
                      className="w-full h-9 px-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                    >
                      <option value={1}>Semester 1 (Ganjil)</option>
                      <option value={2}>Semester 2 (Genap)</option>
                    </select>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={instForm.kkmDefault}
                        onChange={(e) =>
                          handleInstFieldChange({ kkmDefault: Number(e.target.value) || 70 })
                        }
                        title="KKM Standar"
                        className="w-full h-9 pl-2 pr-8 border border-slate-200 rounded-lg font-bold text-center"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 pointer-events-none">
                        KKM
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Kepala Madrasah / Pimpinan
                  </label>
                  <input
                    type="text"
                    value={instForm.headmasterName}
                    onChange={(e) =>
                      handleInstFieldChange({ headmasterName: e.target.value })
                    }
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIP / NIY Kepala & Kota Titimangsa Rapor
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={instForm.headmasterNip}
                      onChange={(e) =>
                        handleInstFieldChange({ headmasterNip: e.target.value })
                      }
                      placeholder="NIP / NIY"
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg font-medium"
                    />
                    <input
                      type="text"
                      value={instForm.defaultIssuePlace}
                      onChange={(e) =>
                        handleInstFieldChange({ defaultIssuePlace: e.target.value })
                      }
                      placeholder="Kota (mis: Bandung)"
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg font-medium"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Teks Pengumuman Akademik
                  </label>
                  <input
                    type="text"
                    value={instForm.announcement}
                    onChange={(e) =>
                      handleInstFieldChange({ announcement: e.target.value })
                    }
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Teks Footer Aplikasi
                  </label>
                  <input
                    type="text"
                    value={instForm.footerText}
                    onChange={(e) => handleInstFieldChange({ footerText: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Modul Fitur Aktif
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={instForm.enableTahfidz}
                        onChange={(e) =>
                          handleInstFieldChange({ enableTahfidz: e.target.checked })
                        }
                        className="rounded border-slate-300 text-slate-900"
                      />
                      <span className="font-semibold text-slate-700">Modul Tahfidz</span>
                    </label>
                    <label className="flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={instForm.enableBankSoal}
                        onChange={(e) =>
                          handleInstFieldChange({ enableBankSoal: e.target.checked })
                        }
                        className="rounded border-slate-300 text-slate-900"
                      />
                      <span className="font-semibold text-slate-700">Bank Soal</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Pengaturan Semester Default & Skala Predikat Grade (A, B, C, D, E) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/75 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Award className={`w-4 h-4 ${themeClasses.primaryText}`} />
                      <span>Pengaturan Semester Default &amp; Konversi Grade Nilai (A, B, C, D)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Atur semester aktif default dan batas nilai minimal untuk penentuan otomatis Grade A, B, C, D (serta E di bawah batas D) pada Halaman Nilai, Tahfidz, dan Rapor PDF.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        handleGradeThresholdChange({
                          minA: 86,
                          minB: 81,
                          minC: 71,
                          minD: 60,
                        });
                        showToast('Skala Grade diatur ke Standar Pesantren (86/81/71/60)', 'info');
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Standar Pesantren (86/81/71/60)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleGradeThresholdChange({
                          minA: 90,
                          minB: 80,
                          minC: 70,
                          minD: 60,
                        });
                        showToast('Skala Grade diatur ke Standar Nasional (90/80/70/60)', 'info');
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Standar Nasional (90/80/70/60)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleInstFieldChange({
                          defaultSemester: 1,
                          gradeThresholds: DEFAULT_GRADE_THRESHOLDS,
                        });
                        showToast('Pengaturan Grade & Semester di-reset ke default', 'info');
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 cursor-pointer inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Default</span>
                    </button>
                  </div>
                </div>

                {/* Default Semester Active Selector Banner */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Semester Default Aktif (Seluruh Halaman)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Menentukan pilihan semester awal saat guru membuka Input Nilai, Tahfidz, Absensi, dan Rapor Digital.
                    </span>
                  </div>
                  <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 shrink-0">
                    {[
                      { val: 1 as 1 | 2, label: 'Semester 1 (Ganjil)' },
                      { val: 2 as 1 | 2, label: 'Semester 2 (Genap)' },
                    ].map((semOpt) => {
                      const isActive = instForm.defaultSemester === semOpt.val;
                      return (
                        <button
                          key={semOpt.val}
                          type="button"
                          onClick={() => {
                            handleInstFieldChange({ defaultSemester: semOpt.val });
                            showToast(
                              `Semester default diubah ke ${semOpt.label}`,
                              'success'
                            );
                          }}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? `${themeClasses.primary} text-white shadow-2xs`
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {semOpt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grade A, B, C, D, E Configuration Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                  {/* GRADE A */}
                  <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-xs">
                        GRADE A
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 tabular-nums">
                        {instForm.gradeThresholds.minA} – 90
                      </span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Nilai Minimal Grade A (&ge;)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={instForm.gradeThresholds.minA}
                        onChange={(e) =>
                          handleGradeThresholdChange({
                            minA: Math.max(0, Math.min(90, Number(e.target.value) || 0)),
                          })
                        }
                        className="w-full h-8 px-2.5 bg-emerald-50/40 border border-emerald-200 rounded-lg font-extrabold text-center text-emerald-900 tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Label Predikat A
                      </label>
                      <input
                        type="text"
                        value={instForm.gradeThresholds.labelA}
                        onChange={(e) =>
                          handleGradeThresholdChange({ labelA: e.target.value })
                        }
                        placeholder="Mumtaz (Istimewa)"
                        className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* GRADE B */}
                  <div className="p-3 rounded-xl bg-white border border-sky-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-black text-xs">
                        GRADE B
                      </span>
                      <span className="text-[11px] font-bold text-sky-700 tabular-nums">
                        {instForm.gradeThresholds.minB} – {Math.max(instForm.gradeThresholds.minB, instForm.gradeThresholds.minA - 1)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Nilai Minimal Grade B (&ge;)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={89}
                        value={instForm.gradeThresholds.minB}
                        onChange={(e) =>
                          handleGradeThresholdChange({
                            minB: Math.max(0, Math.min(89, Number(e.target.value) || 0)),
                          })
                        }
                        className="w-full h-8 px-2.5 bg-sky-50/40 border border-sky-200 rounded-lg font-extrabold text-center text-sky-900 tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Label Predikat B
                      </label>
                      <input
                        type="text"
                        value={instForm.gradeThresholds.labelB}
                        onChange={(e) =>
                          handleGradeThresholdChange({ labelB: e.target.value })
                        }
                        placeholder="Jayyid Jiddan (Sangat Baik)"
                        className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* GRADE C */}
                  <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-black text-xs">
                        GRADE C
                      </span>
                      <span className="text-[11px] font-bold text-amber-700 tabular-nums">
                        {instForm.gradeThresholds.minC} – {Math.max(instForm.gradeThresholds.minC, instForm.gradeThresholds.minB - 1)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Nilai Minimal Grade C (&ge;)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={98}
                        value={instForm.gradeThresholds.minC}
                        onChange={(e) =>
                          handleGradeThresholdChange({
                            minC: Math.max(0, Math.min(98, Number(e.target.value) || 0)),
                          })
                        }
                        className="w-full h-8 px-2.5 bg-amber-50/40 border border-amber-200 rounded-lg font-extrabold text-center text-amber-900 tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Label Predikat C
                      </label>
                      <input
                        type="text"
                        value={instForm.gradeThresholds.labelC}
                        onChange={(e) =>
                          handleGradeThresholdChange({ labelC: e.target.value })
                        }
                        placeholder="Jayyid (Baik)"
                        className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* GRADE D */}
                  <div className="p-3 rounded-xl bg-white border border-orange-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 font-black text-xs">
                        GRADE D
                      </span>
                      <span className="text-[11px] font-bold text-orange-700 tabular-nums">
                        {instForm.gradeThresholds.minD} – {Math.max(instForm.gradeThresholds.minD, instForm.gradeThresholds.minC - 1)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Nilai Minimal Grade D (&ge;)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={97}
                        value={instForm.gradeThresholds.minD}
                        onChange={(e) =>
                          handleGradeThresholdChange({
                            minD: Math.max(0, Math.min(97, Number(e.target.value) || 0)),
                          })
                        }
                        className="w-full h-8 px-2.5 bg-orange-50/40 border border-orange-200 rounded-lg font-extrabold text-center text-orange-900 tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Label Predikat D
                      </label>
                      <input
                        type="text"
                        value={instForm.gradeThresholds.labelD}
                        onChange={(e) =>
                          handleGradeThresholdChange({ labelD: e.target.value })
                        }
                        placeholder="Maqbul (Cukup)"
                        className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* GRADE E (Auto < minD) */}
                  <div className="p-3 rounded-xl bg-white border border-rose-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-black text-xs">
                        GRADE E
                      </span>
                      <span className="text-[11px] font-bold text-rose-700 tabular-nums">
                        &lt; {instForm.gradeThresholds.minD}
                      </span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Rentang Nilai (&lt; D)
                      </label>
                      <div className="w-full h-8 px-2.5 bg-rose-50/50 border border-rose-200 rounded-lg font-bold text-center text-rose-800 flex items-center justify-center tabular-nums">
                        0 – {Math.max(0, instForm.gradeThresholds.minD - 1)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Label Predikat E
                      </label>
                      <input
                        type="text"
                        value={instForm.gradeThresholds.labelE}
                        onChange={(e) =>
                          handleGradeThresholdChange({ labelE: e.target.value })
                        }
                        placeholder="Rasib (Kurang)"
                        className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* SECTION 3: TEMA & FORMAT RAPOR PDF + DUA GAMBAR KOP (KIRI & KANAN)    */}
          {/* ===================================================================== */}
          {(superAdminSection === 'all' || superAdminSection === 'report_theme') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck2 className={`w-4 h-4 ${themeClasses.primaryText}`} />
                    <span>3. Pengaturan Tema, Kop 2 Gambar (Kiri-Kanan) & Format Rapor PDF</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Atur dua gambar logo di kop surat (sebelah kiri & sebelah kanan), ukuran kertas (A4/F4/Letter/Legal), orientasi, margin, warna kop, gaya tabel, dan tanda tangan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPdfSettingsOpen(true)}
                  className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white shadow-2xs shrink-0`}
                >
                  <Sliders className="w-3.5 h-3.5 shrink-0" />
                  <span>Studio PDF & Kop 2 Gambar</span>
                </button>
              </div>

              {/* Dual Left & Right Kop Logo Uploader Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LEFT KOP LOGO */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-md ${themeClasses.primary} text-white text-[11px] font-extrabold flex items-center justify-center`}
                      >
                        1
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        Gambar Kop Sebelah Kiri
                      </span>
                    </div>
                    <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={themeSettings.reportShowLeftLogo !== false}
                        onChange={(e) =>
                          handleThemePatch({ reportShowLeftLogo: e.target.checked })
                        }
                        className="rounded border-slate-300"
                      />
                      <span>Tampilkan Kiri</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={
                          themeSettings.customLogoUrl ||
                          siteSettings.customLogoUrl ||
                          '/src/assets/images/logo_baiturrahman_1791464090153.jpg'
                        }
                        alt="Logo Kop Kiri"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <label
                          className={`btn-precision ${themeClasses.primary} ${themeClasses.primaryHover} text-white cursor-pointer`}
                        >
                          <Upload className="w-3.5 h-3.5 shrink-0" />
                          <span>Upload Gambar Kiri</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={
                          themeSettings.customLogoUrl ||
                          siteSettings.customLogoUrl ||
                          '/src/assets/images/logo_baiturrahman_1791464090153.jpg'
                        }
                        onChange={(e) =>
                          handleThemePatch({
                            customLogoUrl: e.target.value,
                            logoIconType: 'image',
                          })
                        }
                        placeholder="URL / Data-URI Gambar Kiri..."
                        className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-[11px] font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT KOP LOGO */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-md ${themeClasses.primary} text-white text-[11px] font-extrabold flex items-center justify-center`}
                      >
                        2
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        Gambar Kop Sebelah Kanan
                      </span>
                    </div>
                    <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={themeSettings.reportShowRightLogo !== false}
                        onChange={(e) =>
                          handleThemePatch({
                            reportShowRightLogo: e.target.checked,
                            ...(e.target.checked ? { reportHeaderStyle: 'dual_logo' } : {}),
                          })
                        }
                        className="rounded border-slate-300"
                      />
                      <span>Tampilkan Kanan</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={
                          themeSettings.customRightLogoUrl ||
                          siteSettings.customRightLogoUrl ||
                          themeSettings.customLogoUrl ||
                          siteSettings.customLogoUrl ||
                          '/src/assets/images/logo_baiturrahman_1791464090153.jpg'
                        }
                        alt="Logo Kop Kanan"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <label
                          className={`btn-precision ${themeClasses.primary} ${themeClasses.primaryHover} text-white cursor-pointer`}
                        >
                          <Upload className="w-3.5 h-3.5 shrink-0" />
                          <span>Upload Gambar Kanan</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleRightLogoFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={
                          themeSettings.customRightLogoUrl ||
                          siteSettings.customRightLogoUrl ||
                          ''
                        }
                        onChange={(e) =>
                          handleThemePatch({
                            customRightLogoUrl: e.target.value,
                            reportShowRightLogo: true,
                            reportHeaderStyle: 'dual_logo',
                          })
                        }
                        placeholder="URL / Data-URI Gambar Kanan (Kosong = sama dgn Kiri)..."
                        className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-[11px] font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Color Theme */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-900 text-xs">
                    Warna Aksen Kop & Tabel Rapor
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">Warna Kustom Rapor:</span>
                    <input
                      type="color"
                      value={themeSettings.reportCustomHex || '#047857'}
                      onChange={(e) =>
                        handleThemePatch({
                          reportThemeColor: 'custom',
                          reportCustomHex: e.target.value,
                        })
                      }
                      className="w-6 h-6 rounded border border-slate-300 cursor-pointer p-0 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                  {[
                    { id: 'emerald', label: 'Hijau Madrasah', hex: '#047857' },
                    { id: 'forest', label: 'Hijau Nabawi', hex: '#15803d' },
                    { id: 'teal', label: 'Toska Resmi', hex: '#0f766e' },
                    { id: 'blue', label: 'Biru Akademik', hex: '#1d4ed8' },
                    { id: 'navy', label: 'Biru Dongker', hex: '#1e3a8a' },
                    { id: 'indigo', label: 'Indigo Royal', hex: '#4338ca' },
                    { id: 'amber', label: 'Emas Pesantren', hex: '#b45309' },
                    { id: 'classic_black', label: 'Hitam Formal', hex: '#0f172a' },
                  ].map((rc) => {
                    const isSelected = activeReportColor === rc.id;
                    return (
                      <button
                        key={rc.id}
                        type="button"
                        onClick={() =>
                          handleThemePatch({ reportThemeColor: rc.id as any })
                        }
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-slate-900 bg-slate-50 font-bold ring-2 ring-slate-900/10'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: rc.hex }}
                        />
                        <span className="text-[11px] text-slate-800 truncate">{rc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Border, Header, Typography, Table & Paper Size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-900 mb-1.5">
                    Tata Letak Kop Surat
                  </label>
                  <select
                    value={themeSettings.reportHeaderStyle || 'dual_logo'}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      handleThemePatch({
                        reportHeaderStyle: val,
                        ...(val === 'dual_logo'
                          ? { reportShowLeftLogo: true, reportShowRightLogo: true }
                          : val === 'left_logo'
                          ? { reportShowLeftLogo: true, reportShowRightLogo: false }
                          : {}),
                      });
                    }}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                  >
                    <option value="dual_logo">2 Gambar Kiri & Kanan (Dual Kop Resmi)</option>
                    <option value="left_logo">1 Gambar Kiri (Standar)</option>
                    <option value="centered">Simetris Terpusat (Logo di Atas)</option>
                    <option value="split">Modern Split 2 Kolom</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1.5">
                    Ukuran & Bentuk Gambar Kop
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={themeSettings.reportLogoSize || 'md'}
                      onChange={(e) =>
                        handleThemePatch({ reportLogoSize: e.target.value as any })
                      }
                      className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                    >
                      <option value="sm">Kecil (52px)</option>
                      <option value="md">Standar (68px)</option>
                      <option value="lg">Besar (84px)</option>
                    </select>
                    <select
                      value={themeSettings.reportLogoShape || 'rounded'}
                      onChange={(e) =>
                        handleThemePatch({ reportLogoShape: e.target.value as any })
                      }
                      className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                    >
                      <option value="clean">Tanpa Bingkai</option>
                      <option value="rounded">Sudut Halus</option>
                      <option value="circle">Lingkaran</option>
                      <option value="bordered">Kotak Bingkai</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-900">
                      Gaya Bingkai Halaman PDF (17 Gaya)
                    </label>
                    <button
                      type="button"
                      onClick={() => openPdfSettingsModal('frames_studio')}
                      className={`text-[11px] font-bold underline cursor-pointer ${themeClasses.primaryText}`}
                    >
                      + Buat Bingkai Sendiri
                    </button>
                  </div>
                  <select
                    value={themeSettings.reportBorderStyle || 'double'}
                    onChange={(e) =>
                      handleThemePatch({ reportBorderStyle: e.target.value as any })
                    }
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                  >
                    {PDF_FRAME_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1.5">
                    Ukuran Kertas & Orientasi PDF
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={themeSettings.reportPaperSize || 'A4'}
                      onChange={(e) =>
                        handleThemePatch({ reportPaperSize: e.target.value as any })
                      }
                      className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                    >
                      <option value="A4">A4 (210×297)</option>
                      <option value="F4">F4 / Folio</option>
                      <option value="Letter">Letter</option>
                      <option value="Legal">Legal</option>
                    </select>
                    <select
                      value={themeSettings.reportOrientation || 'portrait'}
                      onChange={(e) =>
                        handleThemePatch({ reportOrientation: e.target.value as any })
                      }
                      className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                    >
                      <option value="portrait">Portrait (Tegak)</option>
                      <option value="landscape">Landscape (Mendatar)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1.5">
                    Margin Kertas & Kualitas PDF
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={themeSettings.reportMarginSize || 'normal'}
                      onChange={(e) =>
                        handleThemePatch({ reportMarginSize: e.target.value as any })
                      }
                      className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                    >
                      <option value="narrow">Margin Sempit</option>
                      <option value="normal">Margin Standar</option>
                      <option value="wide">Margin Lebar</option>
                      <option value="none">Tanpa Margin</option>
                    </select>
                    <select
                      value={themeSettings.reportPdfQuality || 'high'}
                      onChange={(e) =>
                        handleThemePatch({ reportPdfQuality: e.target.value as any })
                      }
                      className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                    >
                      <option value="standard">Standar Cepat</option>
                      <option value="high">Tajam HD (2.2x)</option>
                      <option value="ultra">Ultra Cetak (3x)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1.5">
                    Jenis Huruf & Ukuran Font Tabel
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={themeSettings.reportFontStyle || 'sans'}
                      onChange={(e) =>
                        handleThemePatch({ reportFontStyle: e.target.value as any })
                      }
                      className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                    >
                      <option value="sans">Sans Modern</option>
                      <option value="serif">Serif Klasik</option>
                      <option value="modern">Poppins</option>
                      <option value="classic">Times Formal</option>
                    </select>
                    <select
                      value={themeSettings.reportFontSize || 'md'}
                      onChange={(e) =>
                        handleThemePatch({ reportFontSize: e.target.value as any })
                      }
                      className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                    >
                      <option value="sm">Font Kecil</option>
                      <option value="md">Font Standar</option>
                      <option value="lg">Font Besar</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1.5">
                    Gaya Tabel & Kerapatan Baris
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={themeSettings.reportTableStyle || 'tinted'}
                      onChange={(e) =>
                        handleThemePatch({ reportTableStyle: e.target.value as any })
                      }
                      className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                    >
                      <option value="tinted">Header Tema</option>
                      <option value="striped">Zebra (Striped)</option>
                      <option value="clean">Putih Bersih</option>
                      <option value="bordered_bold">Garis Tegas</option>
                    </select>
                    <select
                      value={themeSettings.reportRowDensity || 'normal'}
                      onChange={(e) =>
                        handleThemePatch({ reportRowDensity: e.target.value as any })
                      }
                      className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                    >
                      <option value="compact">Rapat (Compact)</option>
                      <option value="normal">Normal</option>
                      <option value="relaxed">Longgar</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1.5">
                    Judul Dokumen Rapor Kustom
                  </label>
                  <input
                    type="text"
                    value={
                      themeSettings.reportCustomTitle ||
                      siteSettings.reportCustomTitle ||
                      'LAPORAN HASIL BELAJAR SANTRI (RAPOR AKADEMIK & TAHFIDZ)'
                    }
                    onChange={(e) =>
                      handleThemePatch({ reportCustomTitle: e.target.value })
                    }
                    placeholder="LAPORAN HASIL BELAJAR SANTRI..."
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1.5">
                    Teks Watermark Latar Rapor
                  </label>
                  <input
                    type="text"
                    value={instForm.watermarkText}
                    onChange={(e) =>
                      handleInstFieldChange({ watermarkText: e.target.value })
                    }
                    placeholder="DOKUMEN RESMI"
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Section Visibility Toggles */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <label className="block font-bold text-slate-900 text-xs mb-2.5">
                  Komponen Bagian & Pengesahan Rapor yang Ditampilkan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {[
                    {
                      label: 'Kalimat Basmalah Arab',
                      checked: themeSettings.reportShowBismillah !== false,
                      onChange: (v: boolean) => handleThemePatch({ reportShowBismillah: v }),
                    },
                    {
                      label: 'Watermark Latar Rapor',
                      checked: themeSettings.reportShowWatermark !== false,
                      onChange: (v: boolean) => handleThemePatch({ reportShowWatermark: v }),
                    },
                    {
                      label: 'Peringkat Kelas Santri',
                      checked: themeSettings.reportShowRank !== false,
                      onChange: (v: boolean) => handleThemePatch({ reportShowRank: v }),
                    },
                    {
                      label: 'Nilai Tahfidz di Agama',
                      checked: themeSettings.reportShowTahfidz !== false,
                      onChange: (v: boolean) => handleThemePatch({ reportShowTahfidz: v }),
                    },
                    {
                      label: 'Kotak Foto 3x4 Santri',
                      checked: themeSettings.reportShowStudentPhoto === true,
                      onChange: (v: boolean) => handleThemePatch({ reportShowStudentPhoto: v }),
                    },
                    {
                      label: 'Tabel Sikap & Akhlak',
                      checked: themeSettings.reportShowAttitudeSection !== false,
                      onChange: (v: boolean) => handleThemePatch({ reportShowAttitudeSection: v }),
                    },
                    {
                      label: 'Rekap Ketidakhadiran',
                      checked: themeSettings.reportShowAttendanceBox !== false,
                      onChange: (v: boolean) =>
                        handleThemePatch({
                          reportShowAttendance: v,
                          reportShowAttendanceBox: v,
                        }),
                    },
                    {
                      label: 'Stempel & Cap Digital',
                      checked: themeSettings.reportShowSeal !== false,
                      onChange: (v: boolean) => handleThemePatch({ reportShowSeal: v }),
                    },
                  ].map((item, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => item.onChange(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900"
                      />
                      <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Interactive Visual PDF Frame Gallery & Custom Frame Builder Trigger */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      Galeri Visual Gaya Bingkai Halaman PDF ({PDF_FRAME_PRESETS.length} Gaya + Buat Sendiri)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Pilih bingkai siap pakai di bawah ini atau buka Studio Pembuat Bingkai untuk merakit garis, ornamen sudut, & warna sendiri.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openPdfSettingsModal('frames_studio')}
                    className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white shrink-0`}
                  >
                    <Sliders className="w-3.5 h-3.5 shrink-0" />
                    <span>Buat Bingkai Sendiri</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {PDF_FRAME_PRESETS.map((preset) => {
                    const active =
                      (themeSettings.reportBorderStyle || 'double') === preset.id;
                    const repStylesForThumb = getReportThemeStyles(themeSettings);
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          handleThemePatch({ reportBorderStyle: preset.id });
                          if (preset.id === 'custom') {
                            openPdfSettingsModal('frames_studio');
                          }
                        }}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          active
                            ? `${themeClasses.primaryLightBg} ${themeClasses.primaryBorder} ring-2 ring-slate-900/10`
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <PdfFrameThumbnail
                          borderStyle={preset.id}
                          primaryHex={repStylesForThumb.primaryHex}
                          borderHex={repStylesForThumb.borderHex}
                          customConfig={
                            preset.id === 'custom'
                              ? themeSettings.customFrameConfig
                              : preset.config
                          }
                        />
                        <div className="flex items-center justify-between gap-1 mt-1.5">
                          <span className="text-[10px] font-bold text-slate-800 truncate">
                            {preset.shortLabel}
                          </span>
                          {active && (
                            <Check
                              className={`w-3 h-3 shrink-0 ${themeClasses.primaryText}`}
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Dual-Logo Kop Surat & Mini Report Card Preview */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-100/70">
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>
                      Pratinjau Langsung Bingkai, Kop 2 Gambar & Tabel Rapor ({themeSettings.reportPaperSize || 'A4'} ·{' '}
                      {themeSettings.reportOrientation === 'landscape' ? 'Landscape' : 'Portrait'})
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Bisa digeser (scroll) di tampilan mobile
                  </span>
                </div>
                <div className="overflow-x-auto overflow-y-auto max-h-72 sm:max-h-none rounded-lg">
                  <div
                    className={`relative overflow-hidden bg-white p-4 sm:p-5 rounded-lg shadow-xs min-w-[520px] sm:min-w-0 ${
                      themeSettings.reportFontStyle === 'serif' ||
                      themeSettings.reportFontStyle === 'classic'
                        ? 'font-serif-report'
                        : 'font-sans'
                    }`}
                    style={getPdfSheetBorderStyle(getReportThemeStyles(themeSettings))}
                  >
                    <PdfPageFrameOverlay
                      reportStyles={getReportThemeStyles(themeSettings)}
                      compact
                    />
                    <div className="relative z-10">
                      <OfficialKopSurat reportStyles={getReportThemeStyles(themeSettings)} />
                      <div
                        className="text-[10px] font-bold px-2.5 py-1.5 rounded-xs flex justify-between"
                        style={{
                          backgroundColor:
                            themeSettings.reportTableStyle === 'clean'
                              ? '#f1f5f9'
                              : `${activeReportHexDisplay}18`,
                          color: activeReportHexDisplay,
                        }}
                      >
                        <span>A. KELOMPOK PELAJARAN AGAMA & TAHFIDZ</span>
                        <span>KKM: {instForm.kkmDefault}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* SECTION 4: MANAJEMEN AKUN PENGGUNA & PENDIDIK                         */}
          {/* ===================================================================== */}
          {(superAdminSection === 'all' || superAdminSection === 'users') && (() => {
            const isGoogleUser = (u: User) =>
              u.authProvider === 'google' ||
              Boolean(u.googleUid) ||
              Boolean(
                u.email &&
                  u.email.includes('@') &&
                  !u.email.toLowerCase().endsWith('@baiturrahman.sch.id')
              );

            const googleUsersCount = users.filter((u) => isGoogleUser(u)).length;
            const localUsersCount = users.filter((u) => !isGoogleUser(u)).length;

            const filteredUsers = users.filter((u) => {
              const google = isGoogleUser(u);
              if (userFilterProvider === 'google' && !google) return false;
              if (userFilterProvider === 'local' && google) return false;
              if (!userSearchQuery.trim()) return true;
              const q = userSearchQuery.trim().toLowerCase();
              return (
                u.fullName.toLowerCase().includes(q) ||
                u.username.toLowerCase().includes(q) ||
                (u.email || '').toLowerCase().includes(q) ||
                u.role.toLowerCase().includes(q)
              );
            });

            return (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Users className={`w-4 h-4 ${themeClasses.primaryText}`} />
                      <span>
                        4. Manajemen Akun Pengguna & Tenaga Pendidik ({users.length} Akun Terdaftar)
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Seluruh akun pendidik, wali kelas, administrator, maupun pengguna yang login/daftar menggunakan <strong>Akun Google</strong> terbaca & tersinkron otomatis secara real-time di Database Cloud Firestore.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span className="h-8 px-2.5 inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                      {users.length} Total ({googleUsersCount} Google · {localUsersCount} Lokal)
                    </span>
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={() => forceSyncAllToCloud()}
                      className={`btn-precision ${themeClasses.primary} ${themeClasses.primaryHover} text-white cursor-pointer disabled:opacity-60`}
                    >
                      <RotateCcw className={`w-3.5 h-3.5 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Sinkron...' : 'Sinkronkan Semua Akun'}</span>
                    </button>
                  </div>
                </div>

                <form
                  onSubmit={handleAddUser}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
                >
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Plus className={`w-3.5 h-3.5 ${themeClasses.primaryText}`} />
                    <span>Tambah Akun Pendidik / Staf Baru ke Database</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Username (cth: ahmad_fauzi)"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Nama Lengkap & Gelar"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="email"
                      placeholder="Email / Gmail (Opsional)"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Password Awal (Min 6 kar)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    >
                      <option value="guru">Guru / Pendidik</option>
                      <option value="wali_kelas">Wali Kelas</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-slate-500">
                      Catatan: Pengguna yang masuk/daftar dengan <strong>Akun Google</strong> akan langsung tampil otomatis di daftar bawah ini. Hak akses <strong>Super Admin</strong> dikunci khusus untuk akun utama <code className="font-mono font-bold">@superadmin</code>.
                    </span>
                    <button
                      type="submit"
                      className={`w-full sm:w-auto btn-precision ${themeClasses.primary} ${themeClasses.primaryHover} text-white shadow-xs`}
                    >
                      + Tambah & Simpan ke DB
                    </button>
                  </div>
                </form>

                {/* Filter & Search Bar for Registered Accounts */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setUserFilterProvider('all')}
                      className={`h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        userFilterProvider === 'all'
                          ? `${themeClasses.primary} text-white shadow-2xs`
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Semua Akun ({users.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserFilterProvider('google')}
                      className={`h-8 px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                        userFilterProvider === 'google'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      <span>Akun Google ({googleUsersCount})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserFilterProvider('local')}
                      className={`h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        userFilterProvider === 'local'
                          ? 'bg-slate-800 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Akun Lokal ({localUsersCount})
                    </button>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari nama, @username, atau email..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full h-8 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[28rem] overflow-y-auto pr-1">
                  {filteredUsers.map((u) => {
                    const isSuper =
                      u.username.toLowerCase() === 'superadmin' && u.role === 'superadmin';
                    const google = isGoogleUser(u);
                    return (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={
                              u.avatarUrl ||
                              '/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg'
                            }
                            alt={u.fullName}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                '/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg';
                            }}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-bold text-slate-900 truncate">
                                {u.fullName}
                              </span>
                              {google ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700">
                                  <svg className="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24">
                                    <path
                                      fill="#4285F4"
                                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                      fill="#34A853"
                                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                      fill="#FBBC05"
                                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                      fill="#EA4335"
                                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                  </svg>
                                  <span>Akun Google</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-200/70 text-[10px] font-semibold text-slate-600">
                                  Akun Lokal
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                              @{u.username} · {u.email || 'tanpa email'} · Sejak {u.joinedDate || '-'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSuper ? (
                            <span
                              className={`text-[10px] font-bold ${themeClasses.badge} border px-2 py-0.5 rounded-md`}
                            >
                              superadmin (Utama)
                            </span>
                          ) : (
                            <select
                              value={u.role === 'superadmin' ? 'guru' : u.role}
                              onChange={(e) =>
                                updateUserRecord(u.id, {
                                  role: e.target.value as User['role'],
                                })
                              }
                              className="h-7 px-2 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-slate-700"
                              title="Ubah Peran / Hak Akses Pengguna"
                            >
                              <option value="guru">guru</option>
                              <option value="wali_kelas">wali_kelas</option>
                              <option value="admin">admin</option>
                            </select>
                          )}

                          {!isSuper && (
                            <>
                              <button
                                type="button"
                                onClick={() => resetUserPassword(u.id, '123456')}
                                className="h-7 px-2 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                                title="Reset Password ke 123456"
                              >
                                <Lock className="w-3 h-3 shrink-0" />
                                <span>Reset</span>
                              </button>

                              {confirmDeleteUserId === u.id ? (
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteUser(u.id);
                                      setConfirmDeleteUserId(null);
                                    }}
                                    className="h-7 px-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                                  >
                                    Hapus
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteUserId(null)}
                                    className="h-7 px-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-semibold rounded-lg cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteUserId(u.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-md cursor-pointer"
                                  title="Hapus Pengguna"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-current" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ===================================================================== */}
          {/* SECTION 5: KONSOL AKSES PENUH DATABASE, EKSPLORASI TABEL & BACKUP     */}
          {/* ===================================================================== */}
          {(superAdminSection === 'all' || superAdminSection === 'database') && (() => {
            const dbTablesMeta = [
              { key: 'users', label: 'Akun Pengguna', count: users.length, data: users },
              { key: 'students', label: 'Data Santri', count: students.length, data: students },
              { key: 'classes', label: 'Data Kelas', count: classes.length, data: classes },
              { key: 'subjects', label: 'Mata Pelajaran', count: subjects.length, data: subjects },
              { key: 'grades', label: 'Nilai Akademik', count: grades.length, data: grades },
              { key: 'tahfidz_grades', label: 'Nilai Tahfidz', count: tahfidzGrades.length, data: tahfidzGrades },
              { key: 'report_cards', label: 'Rapor Digital', count: reportCards.length, data: reportCards },
              { key: 'student_attendance', label: 'Absensi Santri', count: studentAttendance.length, data: studentAttendance },
              { key: 'teacher_attendance', label: 'Absensi Guru', count: teacherAttendance.length, data: teacherAttendance },
              { key: 'teaching_assignments', label: 'Jadwal & Pengampu', count: teachingAssignments.length, data: teachingAssignments },
              { key: 'announcements', label: 'Pengumuman', count: announcements.length, data: announcements },
              { key: 'exam_packages', label: 'Paket Soal', count: examPackages.length, data: examPackages },
              { key: 'exam_files', label: 'Berkas Ujian', count: examFiles.length, data: examFiles },
              {
                key: 'site_and_theme_config',
                label: 'Konfigurasi Web',
                count: 1,
                data: [{ academicYear, siteSettings, themeSettings }],
              },
            ] as const;

            const activeTableMeta =
              dbTablesMeta.find((t) => t.key === selectedDbTable) || dbTablesMeta[0];
            const activeRows: any[] = Array.isArray(activeTableMeta.data)
              ? activeTableMeta.data
              : [];

            const filteredRows = activeRows.filter((row) => {
              if (!dbSearchQuery.trim()) return true;
              return JSON.stringify(row)
                .toLowerCase()
                .includes(dbSearchQuery.trim().toLowerCase());
            });

            const sampleRow = activeRows[0] || {};
            const tableColumns = Object.keys(sampleRow).slice(0, 7);

            const handleSelectDbTable = (key: typeof selectedDbTable) => {
              setSelectedDbTable(key);
              const found = dbTablesMeta.find((t) => t.key === key);
              if (found) {
                const payload =
                  key === 'site_and_theme_config'
                    ? { academicYear, siteSettings, themeSettings }
                    : found.data;
                setRawJsonBuffer(JSON.stringify(payload, null, 2));
              }
            };

            const handleOpenNewDbRecord = () => {
              const template =
                selectedDbTable === 'users'
                  ? {
                      id: 'usr-' + Date.now(),
                      username: 'guru_baru',
                      fullName: 'Nama Pendidik Baru',
                      email: 'guru.baru@baiturrahman.sch.id',
                      avatarUrl: '/src/assets/images/avatar_ahmad_fauzi_1791464104000.jpg',
                      role: 'guru',
                      joinedDate: new Date().toLocaleDateString('id-ID'),
                    }
                  : selectedDbTable === 'students'
                  ? {
                      id: Math.max(0, ...students.map((s) => s.id)) + 1,
                      nis: 'NIS-' + Math.floor(10000 + Math.random() * 90000),
                      name: 'Santri Baru',
                      classId: classes[0]?.id || 1,
                      birthPlace: 'Bandung',
                      birthDate: '2012-01-01',
                      guardian: 'Wali Santri',
                    }
                  : selectedDbTable === 'classes'
                  ? {
                      id: Math.max(0, ...classes.map((c) => c.id)) + 1,
                      name: 'Kelas Baru',
                      teacher: 'Wali Kelas',
                    }
                  : selectedDbTable === 'subjects'
                  ? {
                      id: Math.max(0, ...subjects.map((s) => s.id)) + 1,
                      name: 'Mata Pelajaran Baru',
                      category: 'Diniyah',
                    }
                  : selectedDbTable === 'grades'
                  ? {
                      id: Math.max(0, ...grades.map((g) => g.id)) + 1,
                      studentId: students[0]?.id || 1,
                      subjectId: subjects[0]?.id || 1,
                      classId: classes[0]?.id || 1,
                      semester: 1,
                      score: 85,
                      testDate: new Date().toISOString().split('T')[0],
                      type: 'regular',
                    }
                  : selectedDbTable === 'tahfidz_grades'
                  ? {
                      id: Math.max(0, ...tahfidzGrades.map((t) => t.id)) + 1,
                      studentId: students[0]?.id || 1,
                      classId: classes[0]?.id || 1,
                      semester: 1,
                      tahfidzScore: 88,
                      tajweedScore: 86,
                      totalScore: 87,
                      gradeLetter: 'A',
                      notes: 'Juz 30',
                      testDate: new Date().toISOString().split('T')[0],
                    }
                  : activeRows[0]
                  ? { ...activeRows[0], id: Date.now() }
                  : { id: Date.now() };

              setEditingDbRecord({
                index: -1,
                isNew: true,
                jsonText: JSON.stringify(template, null, 2),
              });
            };

            const handleSaveDbRecordModal = () => {
              if (!editingDbRecord) return;
              try {
                const parsed = JSON.parse(editingDbRecord.jsonText);
                if (selectedDbTable === 'site_and_theme_config') {
                  updateDatabaseTable('site_and_theme_config', parsed);
                } else {
                  const nextArray = [...activeRows];
                  if (editingDbRecord.isNew) {
                    nextArray.unshift(parsed);
                  } else if (editingDbRecord.index >= 0) {
                    nextArray[editingDbRecord.index] = parsed;
                  }
                  updateDatabaseTable(selectedDbTable, nextArray);
                }
                setEditingDbRecord(null);
              } catch (err: any) {
                showToast('Format JSON tidak valid: ' + (err?.message || ''), 'error');
              }
            };

            const handleDeleteDbRow = (rowIndexInActive: number) => {
              if (selectedDbTable === 'site_and_theme_config') return;
              const nextArray = activeRows.filter((_, idx) => idx !== rowIndexInActive);
              updateDatabaseTable(selectedDbTable, nextArray);
            };

            const handleExportSingleTable = (format: 'json' | 'csv') => {
              if (format === 'json') {
                const payload =
                  selectedDbTable === 'site_and_theme_config'
                    ? { academicYear, siteSettings, themeSettings }
                    : activeRows;
                const blob = new Blob([JSON.stringify(payload, null, 2)], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `tabel_${selectedDbTable}_${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              } else {
                if (!activeRows.length) return;
                const headers = Object.keys(activeRows[0]);
                const csvLines = [
                  headers.join(','),
                  ...activeRows.map((r) =>
                    headers
                      .map((h) => {
                        const val = r[h];
                        const str =
                          typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
                        return `"${str.replace(/"/g, '""')}"`;
                      })
                      .join(',')
                  ),
                ];
                const blob = new Blob([csvLines.join('\n')], {
                  type: 'text/csv;charset=utf-8;',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `tabel_${selectedDbTable}_${Date.now()}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }
            };

            return (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Database className={`w-4 h-4 ${themeClasses.primaryText}`} />
                      <span>
                        5. Konsol Akses Penuh Database (11 Tabel, Live CRUD, JSON Editor & Backup)
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Super Admin memiliki kendali penuh untuk melihat, mencari, menambah, menyunting, menghapus, dan mengekspor seluruh tabel database.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0 w-full sm:w-auto">
                    <span className="h-9 px-2.5 inline-flex items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                      {isCloudSynced ? 'Cloud Firestore Aktif' : 'Database Lokal & Cloud Siap'}
                      {lastSyncedAt ? ` · ${lastSyncedAt}` : ''}
                    </span>
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={() => forceSyncAllToCloud()}
                      className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white cursor-pointer disabled:opacity-60`}
                    >
                      <RotateCcw className={`w-3.5 h-3.5 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Sinkron...' : 'Sinkron Cloud'}</span>
                    </button>
                  </div>
                </div>

                {/* 11 Interactive Table Selector Cards */}
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-2">
                    Pilih Tabel Database untuk Diakses & Disunting Langsung ({dbTablesMeta.length} Tabel):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                    {dbTablesMeta.map((tbl) => {
                      const isSelected = selectedDbTable === tbl.key;
                      return (
                        <button
                          key={tbl.key}
                          type="button"
                          onClick={() => handleSelectDbTable(tbl.key)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? `${themeClasses.primaryLightBg} ${themeClasses.primaryBorder} ring-2 ring-slate-900/10`
                              : 'bg-slate-50/80 border-slate-200 hover:bg-white'
                          }`}
                        >
                          <span className="text-[11px] font-bold text-slate-900 block truncate">
                            {tbl.label}
                          </span>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] font-mono text-slate-500 truncate">
                              {tbl.key}
                            </span>
                            <span
                              className={`text-xs font-extrabold tabular-nums ${
                                isSelected ? themeClasses.primaryText : 'text-slate-800'
                              }`}
                            >
                              {tbl.count}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Full Database Explorer Toolbar */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">
                        Tabel Aktif: {activeTableMeta.label} ({filteredRows.length} Record)
                      </span>
                      <div className="filter-group bg-slate-200/80 grid grid-cols-2 sm:inline-flex w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setDbEditorMode('table')}
                          className={`filter-btn w-full sm:w-auto ${
                            dbEditorMode === 'table'
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Tabel Interaktif
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const payload =
                              selectedDbTable === 'site_and_theme_config'
                                ? { academicYear, siteSettings, themeSettings }
                                : activeRows;
                            setRawJsonBuffer(JSON.stringify(payload, null, 2));
                            setDbEditorMode('json');
                          }}
                          className={`filter-btn w-full sm:w-auto ${
                            dbEditorMode === 'json'
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Editor JSON
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full lg:w-auto">
                      <div className="relative flex-1 sm:w-56">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={dbSearchQuery}
                          onChange={(e) => setDbSearchQuery(e.target.value)}
                          placeholder={`Cari di ${activeTableMeta.label}...`}
                          className="filter-control w-full !pl-8 !pr-3 bg-white border border-slate-200"
                        />
                      </div>

                      <div
                        className={`grid ${
                          selectedDbTable !== 'site_and_theme_config'
                            ? 'grid-cols-3'
                            : 'grid-cols-1'
                        } sm:flex items-center gap-2 w-full sm:w-auto`}
                      >
                        {selectedDbTable !== 'site_and_theme_config' && (
                          <button
                            type="button"
                            onClick={handleOpenNewDbRecord}
                            className={`btn-precision w-full sm:w-auto px-2 sm:px-3.5 ${themeClasses.primary} ${themeClasses.primaryHover} text-white cursor-pointer`}
                          >
                            <Plus className="w-3.5 h-3.5 shrink-0" />
                            <span>+ Record</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleExportSingleTable('json')}
                          className="btn-precision w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer"
                        >
                          JSON
                        </button>

                        {selectedDbTable !== 'site_and_theme_config' && (
                          <button
                            type="button"
                            onClick={() => handleExportSingleTable('csv')}
                            className="btn-precision w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer"
                          >
                            CSV
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Data Grid Mode */}
                  {dbEditorMode === 'table' ? (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                              <th className="py-2 px-3 font-bold w-12 text-center">#</th>
                              {tableColumns.map((col) => (
                                <th key={col} className="py-2 px-3 font-bold whitespace-nowrap">
                                  {col}
                                </th>
                              ))}
                              <th className="py-2 px-3 font-bold text-right whitespace-nowrap">
                                Aksi Record
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredRows.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={tableColumns.length + 2}
                                  className="py-8 text-center text-slate-400 italic"
                                >
                                  Tidak ada record yang ditemukan pada tabel ini.
                                </td>
                              </tr>
                            ) : (
                              filteredRows.map((row, idx) => {
                                const originalIndex = activeRows.indexOf(row);
                                return (
                                  <tr key={idx} className="hover:bg-slate-50/90">
                                    <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-400">
                                      {idx + 1}
                                    </td>
                                    {tableColumns.map((col) => {
                                      const val = row[col];
                                      const displayVal =
                                        val === null || val === undefined
                                          ? '-'
                                          : typeof val === 'object'
                                          ? JSON.stringify(val)
                                          : String(val);
                                      return (
                                        <td
                                          key={col}
                                          className="py-2 px-3 max-w-[200px] truncate text-slate-700 font-medium"
                                          title={displayVal}
                                        >
                                          {displayVal}
                                        </td>
                                      );
                                    })}
                                    <td className="py-2 px-3 text-right whitespace-nowrap">
                                      <div className="inline-flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setEditingDbRecord({
                                              index: originalIndex,
                                              isNew: false,
                                              jsonText: JSON.stringify(row, null, 2),
                                            })
                                          }
                                          className="h-7 px-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                          <span>Edit</span>
                                        </button>
                                        {selectedDbTable !== 'site_and_theme_config' && (
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteDbRow(originalIndex)}
                                            className="h-7 px-2 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                            <span>Hapus</span>
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>

                      {selectedDbTable !== 'site_and_theme_config' && activeRows.length > 0 && (
                        <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">
                            Menampilkan {filteredRows.length} dari {activeRows.length} total record di tabel{' '}
                            <strong className="font-mono">{selectedDbTable}</strong>
                          </span>
                          {confirmTruncateTable === selectedDbTable ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-rose-700 font-bold">
                                Kosongkan seluruh isi tabel {activeTableMeta.label}?
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  updateDatabaseTable(selectedDbTable, []);
                                  setConfirmTruncateTable(null);
                                }}
                                className="h-6 px-2 rounded bg-rose-600 text-white font-bold cursor-pointer"
                              >
                                Ya, Kosongkan
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmTruncateTable(null)}
                                className="h-6 px-2 rounded bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmTruncateTable(selectedDbTable)}
                              className="text-rose-600 hover:underline font-semibold cursor-pointer"
                            >
                              Kosongkan Tabel Ini
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Raw JSON Live Editor Mode */
                    <div className="space-y-2.5">
                      <textarea
                        rows={14}
                        value={rawJsonBuffer}
                        onChange={(e) => setRawJsonBuffer(e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs leading-relaxed border border-slate-800 focus:outline-none"
                        spellCheck={false}
                      />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500">
                          Sunting struktur JSON secara langsung lalu klik Simpan untuk menerapkan ke database lokal & Cloud Firestore.
                        </span>
                        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                const parsed = JSON.parse(rawJsonBuffer);
                                setRawJsonBuffer(JSON.stringify(parsed, null, 2));
                              } catch {
                                showToast('Format JSON belum valid.', 'error');
                              }
                            }}
                            className="btn-precision w-full sm:w-auto bg-white border border-slate-200 text-slate-700 cursor-pointer"
                          >
                            Rapikan JSON
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                const parsed = JSON.parse(rawJsonBuffer);
                                updateDatabaseTable(selectedDbTable, parsed);
                              } catch (err: any) {
                                showToast(
                                  'Gagal menyimpan: Format JSON tidak valid (' +
                                    (err?.message || '') +
                                    ')',
                                  'error'
                                );
                              }
                            }}
                            className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white cursor-pointer`}
                          >
                            Simpan Tabel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal for Editing/Adding a Single Record in Any Database Table */}
                {editingDbRecord && (
                  <div
                    onClick={() => setEditingDbRecord(null)}
                    className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
                  >
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h4 className="text-sm font-bold text-slate-900">
                          {editingDbRecord.isNew
                            ? `Tambah Record Baru ke Tabel ${activeTableMeta.label}`
                            : `Sunting Record Database (${activeTableMeta.label})`}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingDbRecord(null)}
                          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        rows={12}
                        value={editingDbRecord.jsonText}
                        onChange={(e) =>
                          setEditingDbRecord({ ...editingDbRecord, jsonText: e.target.value })
                        }
                        className="w-full p-3 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs leading-relaxed border border-slate-800 focus:outline-none"
                        spellCheck={false}
                      />
                      <div className="grid grid-cols-2 sm:flex sm:justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setEditingDbRecord(null)}
                          className="btn-precision w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveDbRecordModal}
                          className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white`}
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                        <Download className={`w-4 h-4 ${themeClasses.primaryText}`} />
                        <span>Unduh Cadangan Penuh (Full Database Backup JSON)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mb-3">
                        Mengunduh berkas JSON berisi seluruh 11 tabel database (santri, kelas, mapel, nilai, tahfidz, rapor, pengumuman, bank soal, user, dan konfigurasi web).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportDatabase}
                      className={`btn-precision w-full ${themeClasses.primary} ${themeClasses.primaryHover} text-white transition-colors shadow-2xs cursor-pointer`}
                    >
                      <Download className="w-3.5 h-3.5 text-current shrink-0" />
                      <span>Unduh Backup JSON</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                        <Upload className={`w-4 h-4 ${themeClasses.primaryText}`} />
                        <span>Pulihkan Database Penuh (Restore JSON)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mb-3">
                        Pilih berkas JSON cadangan yang sudah pernah diunduh untuk memulihkan seluruh isi database secara utuh.
                      </p>
                    </div>
                    <label className="btn-precision w-full bg-slate-800 hover:bg-slate-700 text-white transition-colors shadow-2xs cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-current shrink-0" />
                      <span>Pulihkan JSON</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportDatabase}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3">
                  <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-700" />
                    <span>Tindakan Khusus & Reset Database</span>
                  </h4>

                  {confirmDangerAction ? (
                    <div className="p-3 rounded-xl bg-white border border-rose-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-rose-900">
                        {confirmDangerAction === 'clear_grades'
                          ? 'Yakin ingin mengosongkan seluruh nilai akademik & tahfidz?'
                          : 'Yakin ingin mereset database ke data sampel bawaan awal?'}
                      </span>
                      <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setConfirmDangerAction(null)}
                          className="btn-precision w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirmDangerAction === 'clear_grades') {
                              clearAllGrades();
                            } else {
                              resetToSampleData();
                            }
                            setConfirmDangerAction(null);
                          }}
                          className="btn-precision w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                        >
                          Ya, Lanjutkan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setConfirmDangerAction('clear_grades')}
                        className="btn-precision w-full sm:w-auto bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 transition-colors cursor-pointer"
                      >
                        Kosongkan Nilai
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDangerAction('reset_sample')}
                        className="btn-precision w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-2xs cursor-pointer"
                      >
                        Reset Data Awal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* EDIT SUBJECT MODAL (Closes on outside click) */}
      {editingSubject && (
        <div
          onClick={() => setEditingSubject(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95"
          >
            <h3 className="text-sm font-bold text-slate-900 mb-3">Edit Mata Pelajaran</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Mapel
                </label>
                <input
                  type="text"
                  value={editingSubject.name}
                  onChange={(e) =>
                    setEditingSubject((prev) => (prev ? { ...prev, name: e.target.value } : null))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Mapel
                </label>
                <select
                  value={editingSubject.category}
                  onChange={(e) =>
                    setEditingSubject((prev) =>
                      prev ? { ...prev, category: e.target.value as Subject['category'] } : null
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="Diniyah">Diniyah / Agama Islam</option>
                  <option value="Umum">Umum / Sains & Sosial</option>
                  <option value="Bahasa">Bahasa (Arab, Inggris, dll)</option>
                  <option value="Keterampilan">Keterampilan / Kejuruan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 sm:flex sm:justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setEditingSubject(null)}
                  className="btn-precision w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    if (editingSubject.name.trim()) {
                      updateSubject(
                        editingSubject.id,
                        editingSubject.name.trim(),
                        editingSubject.category
                      );
                      setEditingSubject(null);
                    }
                  }}
                  className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white`}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CLASS MODAL (Closes on outside click) */}
      {editingClass && (
        <div
          onClick={() => setEditingClass(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95"
          >
            <h3 className="text-sm font-bold text-slate-900 mb-3">Edit Data Kelas</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kelas
                </label>
                <input
                  type="text"
                  value={editingClass.name}
                  onChange={(e) =>
                    setEditingClass((prev) => (prev ? { ...prev, name: e.target.value } : null))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wali Kelas
                </label>
                <input
                  type="text"
                  value={editingClass.teacher}
                  onChange={(e) =>
                    setEditingClass((prev) => (prev ? { ...prev, teacher: e.target.value } : null))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:flex sm:justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setEditingClass(null)}
                  className="btn-precision w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    if (editingClass.name.trim()) {
                      updateClass(
                        editingClass.id,
                        editingClass.name.trim(),
                        editingClass.teacher.trim()
                      );
                      setEditingClass(null);
                    }
                  }}
                  className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white`}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL (Closes on outside click) */}
      {editingStudent && (
        <div
          onClick={() => setEditingStudent(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95"
          >
            <h3 className="text-sm font-bold text-slate-900 mb-4">Edit Data Santri</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateStudent(editingStudent.id, {
                  nis: editingStudent.nis,
                  name: editingStudent.name,
                  classId: editingStudent.classId,
                  birthPlace: editingStudent.birthPlace,
                  birthDate: editingStudent.birthDate,
                  guardian: editingStudent.guardian,
                });
                setEditingStudent(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NIS</label>
                <input
                  type="text"
                  value={editingStudent.nis}
                  onChange={(e) =>
                    setEditingStudent((prev) => (prev ? { ...prev, nis: e.target.value } : null))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) =>
                    setEditingStudent((prev) => (prev ? { ...prev, name: e.target.value } : null))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas</label>
                <select
                  value={editingStudent.classId}
                  onChange={(e) =>
                    setEditingStudent((prev) =>
                      prev ? { ...prev, classId: parseInt(e.target.value, 10) } : null
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      Kelas {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    value={editingStudent.birthPlace}
                    onChange={(e) =>
                      setEditingStudent((prev) =>
                        prev ? { ...prev, birthPlace: e.target.value } : null
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={editingStudent.birthDate}
                    onChange={(e) =>
                      setEditingStudent((prev) =>
                        prev ? { ...prev, birthDate: e.target.value } : null
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Orang Tua / Wali
                </label>
                <input
                  type="text"
                  value={editingStudent.guardian}
                  onChange={(e) =>
                    setEditingStudent((prev) =>
                      prev ? { ...prev, guardian: e.target.value } : null
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:flex sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="btn-precision w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white`}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Studio PDF & Kop Surat 2 Gambar */}
      <PdfSettingsModal
        isOpen={isPdfSettingsOpen}
        onClose={() => setIsPdfSettingsOpen(false)}
        initialTab={pdfSettingsInitialTab}
      />
    </div>
  );
};
