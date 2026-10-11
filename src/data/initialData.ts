import {
  User,
  Subject,
  ClassRoom,
  Student,
  Grade,
  TahfidzGrade,
  ExamFile,
  ExamQuestionsPackage,
  SiteSettings,
  ThemeSettings,
  ReportCardRecord,
  AnnouncementItem,
  StudentAttendanceRecord,
  TeacherAttendanceRecord,
  TeachingAssignment,
} from '../types';

export const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Jadwal Pengisian Nilai Rapor & Tahfidz Semester Aktif',
    content:
      'Seluruh ustadz/ustadzah pengampu mata pelajaran dan wali kelas diharapkan menuntaskan pengisian nilai akademik serta capaian hafalan tahfidz santri sebelum batas waktu cetak rapor.',
    category: 'Rapor',
    priority: 'urgent',
    date: '2025-12-10',
    author: 'Bagian Kurikulum & Evaluasi',
    isActive: true,
    isPinned: true,
  },
  {
    id: 'ann-2',
    title: 'Pelaksanaan Tasmi & Ujian Tahfidz Al-Qur\'an',
    content:
      'Pengujian kelancaran hafalan (tahfidz) dan kaidah tajwid santri dilaksanakan secara terpadu. Pastikan catatan juz/surah yang diujikan tertulis lengkap pada modul penilaian.',
    category: 'Tahfidz',
    priority: 'important',
    date: '2025-12-12',
    author: 'Koordinator Tahfidz',
    isActive: true,
    isPinned: false,
  },
  {
    id: 'ann-3',
    title: 'Pengumpulan Naskah Bank Soal Ujian Madrasah',
    content:
      'Para pengajar dapat mengunggah berkas soal atau menyusun paket soal pilihan ganda dan uraian langsung melalui menu Bank Soal untuk dicetak dalam format PDF resmi.',
    category: 'Ujian',
    priority: 'normal',
    date: '2025-12-05',
    author: 'Panitia Ujian Madrasah',
    isActive: true,
    isPinned: false,
  },
  {
    id: 'ann-4',
    title: 'Rapat Pleno Evaluasi & Pembagian Rapor Santri',
    content:
      'Rapat pleno dewan asatidz akan digelar menjelang pembagian rapor semester. Wali kelas dimohon memeriksa kelengkapan presensi, catatan wali kelas, dan ekstrakurikuler.',
    category: 'Akademik',
    priority: 'important',
    date: '2025-12-18',
    author: 'Kepala Madrasah',
    isActive: true,
    isPinned: false,
  },
];

export const INITIAL_THEME_SETTINGS: ThemeSettings = {
  colorTheme: 'emerald',
  customPrimaryHex: '#047857',
  customSecondaryHex: '#0f172a',
  customPageBgHex: '',
  pageBgStyle: 'tinted',
  layout: 'sidebar',
  contentWidth: 'contained',
  density: 'comfortable',
  borderRadius: 'modern',
  showAnnouncement: true,
  announcementSpeed: 'normal',
  accentSaturation: 'vibrant',
  headerStyle: 'glass',
  sidebarStyle: 'light',
  logoIconType: 'image',
  customLogoUrl: '/src/assets/images/logo_baiturrahman_1791464090153.jpg',
  webFontFamily: 'jakarta',
  fontScale: 'normal',
  cardSurfaceStyle: 'bordered',
  webTableStyle: 'default',
  pagePattern: 'none',
  borderContrast: 'normal',
  heroBannerStyle: 'gradient_brand',
  heroBannerHeight: 'standard',
  statsCardStyle: 'modern_elevated',
  showHeroBanner: true,
  showFooter: true,
  stickyHeader: true,
  customRightLogoUrl: '/src/assets/images/logo_baiturrahman_1791464090153.jpg',
  reportShowLeftLogo: true,
  reportShowRightLogo: true,
  reportLogoSize: 'md',
  reportLogoShape: 'rounded',
  reportKopDividerStyle: 'double',
  reportCustomTitle: 'LAPORAN HASIL EVALUASI BELAJAR SANTRI (RAPOR DIGITAL)',
  reportThemeColor: 'emerald',
  reportCustomHex: '#047857',
  reportBorderStyle: 'double',
  reportHeaderStyle: 'dual_logo',
  reportFontStyle: 'sans',
  reportFontSize: 'md',
  reportTableStyle: 'tinted',
  reportRowDensity: 'compact',
  reportPaperSize: 'A4',
  reportOrientation: 'portrait',
  reportMarginSize: 'narrow',
  reportPdfQuality: 'high',
  reportSinglePageFit: true,
  reportWatermarkOpacity: 'subtle',
  reportShowWatermark: true,
  reportShowBismillah: true,
  reportShowRank: true,
  reportShowTahfidz: true,
  reportShowAttitude: true,
  reportShowEkskul: true,
  reportShowAttendance: true,
  reportShowKkm: true,
  reportShowPredicate: true,
  reportShowTerbilang: true,
  reportShowTeacherNotes: true,
  reportShowParentSignature: true,
  reportShowClassTeacherSignature: true,
  reportShowHeadmasterSignature: true,
  reportShowSeal: true,
  reportSignatureHeight: 'normal',
  reportShowFooterMeta: true,
};

export const INITIAL_REPORT_CARDS: ReportCardRecord[] = [
  {
    id: '1_1_2025/2026',
    studentId: 1, // Aura
    classId: 1, // Aliyah
    semester: 1,
    academicYear: '2025/2026',
    status: 'ready',
    attendance: { sick: 1, permission: 0, unexcused: 0 },
    teacherNotes:
      'Ananda Aura menunjukkan kesungguhan dan keteladanan akhlak yang sangat baik. Tingkatkan lagi pemahaman pada mata pelajaran eksak.',
    tahfidzNotes: 'Telah menyelesaikan setoran Juz 30 dengan predikat Jayyid Jiddan.',
    spiritualAttitude: 'A',
    spiritualDescription: 'Sangat taat dalam menjalankan ibadah shalat berjamaah dan adab majelis.',
    socialAttitude: 'A',
    socialDescription: 'Santun, mudah bergaul, dan memiliki kepedulian sosial tinggi terhadap sesama santriwati.',
    extracurriculars: [
      { name: 'Khitabah & Pidato 3 Bahasa', predicate: 'A', description: 'Aktif sebagai pembicara muhadharah mingguan.' },
      { name: 'Kepanduan Hizbul Wathan / Pramuka', predicate: 'B', description: 'Disiplin dan bertanggung jawab dalam regu.' },
    ],
    issuePlace: 'Bandung',
    issueDate: '2025-12-20',
    headmasterName: 'Muhammad Siroj, S.Pd.I',
    headmasterNip: '19830715 200801 1 004',
    classTeacherName: 'Abu Assa',
    updatedAt: '2025-12-20T10:00:00Z',
  },
  {
    id: '4_1_2025/2026',
    studentId: 4, // Adilah Dzakiyy
    classId: 4, // Aliyah 2
    semester: 1,
    academicYear: '2025/2026',
    status: 'published',
    attendance: { sick: 0, permission: 1, unexcused: 0 },
    teacherNotes:
      'Prestasi akademik dan hafalan Adilah sangat membanggakan. Terus pertahankan ketekunan muraja\'ah dan semangat belajar.',
    tahfidzNotes: 'Mutqin Juz 1 & 2 dengan tajwid sangat baik.',
    spiritualAttitude: 'A',
    spiritualDescription: 'Selalu istiqamah mengamalkan sunnah harian dan menjaga hafalan Al-Qur\'an.',
    socialAttitude: 'A',
    socialDescription: 'Menunjukkan jiwa kepemimpinan positif dan gemar membantu teman sekelas.',
    extracurriculars: [
      { name: 'Kajian Kitab Kuning', predicate: 'A', description: 'Kemampuan mutholaah teks arab gundul sangat baik.' },
      { name: 'Jurnalistik & Media Kampus', predicate: 'A', description: 'Aktif mengelola buletin dinding madrasah.' },
    ],
    issuePlace: 'Bandung',
    issueDate: '2025-12-20',
    headmasterName: 'Muhammad Siroj, S.Pd.I',
    headmasterNip: '19830715 200801 1 004',
    classTeacherName: 'Ust. Hilal',
    updatedAt: '2025-12-20T11:00:00Z',
  },
];

export const SUPERADMIN_USER: User = {
  id: 'usr-superadmin',
  username: 'superadmin',
  fullName: 'Super Administrator',
  email: 'admin.baiturrahman@gmail.com',
  avatarUrl: '/src/assets/images/logo_baiturrahman_1791464090153.jpg',
  role: 'superadmin',
  joinedDate: '01/01/2024',
};

export const INITIAL_USER: User = {
  id: 'usr-1',
  username: 'abuza',
  fullName: 'Muhammad Siroj',
  email: 'mediabaiturrahman01@gmail.com',
  avatarUrl: '/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg',
  role: 'guru',
  joinedDate: '14/07/2025',
};

export const INITIAL_USERS: User[] = [
  SUPERADMIN_USER,
  INITIAL_USER,
  {
    id: 'usr-2',
    username: 'ridwan',
    fullName: 'Ust. Saeful Ridwan',
    email: 'ridwan@baiturrahman.sch.id',
    avatarUrl: '/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg',
    role: 'guru',
    joinedDate: '10/08/2024',
  },
  {
    id: 'usr-3',
    username: 'hilal',
    fullName: 'Ust. Ahmad Hilal',
    email: 'hilal@baiturrahman.sch.id',
    avatarUrl: '/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg',
    role: 'wali_kelas',
    joinedDate: '12/01/2025',
  },
];

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  foundationName: 'Yayasan Pendidikan Islam Baiturrahman',
  appName: 'Sistem Rapor Digital',
  schoolName: 'Pesantren & Madrasah Baiturrahman',
  subHeader: 'Portal Evaluasi Akademik, Rapor & Bank Soal',
  announcement: 'Jadwal Pengisian Nilai Rapor & Tahfidz Semester Aktif — Seluruh ustadz/ustadzah pengampu mata pelajaran dan wali kelas diharapkan menuntaskan pengisian nilai akademik serta capaian hafalan tahfidz santri sebelum batas waktu cetak rapor.',
  announcements: INITIAL_ANNOUNCEMENTS,
  enableTahfidz: true,
  enableBankSoal: true,
  themeAccent: 'emerald',
  schoolAddress: 'Jl. Raya Cikancung No. 45, Cikancung, Kabupaten Bandung, Jawa Barat 40396',
  schoolPhone: '(022) 595-8821',
  schoolEmail: 'admin@baiturrahman.sch.id',
  schoolNsmNpsn: 'NSM: 131232040089 | NPSN: 69982341',
  schoolWebsite: 'www.baiturrahman.sch.id',
  headmasterName: 'Muhammad Siroj, S.Pd.I',
  headmasterNip: '19830715 200801 1 004',
  defaultIssuePlace: 'Bandung',
  watermarkText: 'DOKUMEN RESMI',
  kkmDefault: 70,
  footerText: 'Evaluasi Akademik, Rapor Digital & Tahfidz',
  customLogoUrl: '/src/assets/images/logo_baiturrahman_1791464090153.jpg',
  customRightLogoUrl: '/src/assets/images/logo_baiturrahman_1791464090153.jpg',
  reportCustomTitle: 'LAPORAN HASIL EVALUASI BELAJAR SANTRI (RAPOR DIGITAL)',
};

export const INITIAL_CLASSES: ClassRoom[] = [
  { id: 1, name: 'Aliyah', teacher: 'Abu assa' },
  { id: 3, name: 'Aliyah 1', teacher: 'Ust. Ridwan' },
  { id: 4, name: 'Aliyah 2', teacher: 'Ust. Hilal' },
  { id: 7, name: 'Ibtidaiyah 1', teacher: 'Ustz. Maryam' },
  { id: 8, name: 'Ibtidaiyah 2', teacher: 'Ust. Sanusi' },
  { id: 9, name: 'Ibtidaiyah 3', teacher: 'Ust. Suherman' },
  { id: 10, name: 'Ibtidaiyah 4', teacher: 'Ust. Saeful' },
  { id: 5, name: 'Mutawasith 1', teacher: 'Ust. Shodiqin' },
  { id: 6, name: 'Mutawasith 2', teacher: 'Ust. Cahdiyat' },
  { id: 2, name: 'Mutawasith 2 (B)', teacher: 'Abu assa' },
  { id: 11, name: 'Tarbiyatul Aulad', teacher: 'Ustz. Salwa' },
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 41, name: 'Adab', category: 'Diniyah' },
  { id: 33, name: 'Bahasa Arab', category: 'Bahasa' },
  { id: 28, name: 'Bahasa Inggris', category: 'Bahasa' },
  { id: 18, name: 'Bahasa Jepang', category: 'Bahasa' },
  { id: 2, name: 'Bahasa Sunda', category: 'Bahasa' },
  { id: 20, name: 'Bimbingan Konseling', category: 'Umum' },
  { id: 6, name: 'Biologi', category: 'Umum' },
  { id: 9, name: 'Ekonomi', category: 'Umum' },
  { id: 22, name: 'Fiqih', category: 'Diniyah' },
  { id: 4, name: 'Fisika', category: 'Umum' },
  { id: 8, name: 'Geografi', category: 'Umum' },
  { id: 39, name: 'Hadist', category: 'Diniyah' },
  { id: 31, name: 'Hafdo', category: 'Diniyah' },
  { id: 19, name: 'Kewirausahaan', category: 'Keterampilan' },
  { id: 5, name: 'Kimia', category: 'Umum' },
  { id: 34, name: 'Komputer', category: 'Keterampilan' },
  { id: 42, name: 'Listrik', category: 'Keterampilan' },
  { id: 1, name: 'Matematika', category: 'Umum' },
  { id: 30, name: 'Mustholah', category: 'Diniyah' },
  { id: 13, name: 'Pendidikan Jasmani', category: 'Umum' },
  { id: 14, name: 'Prakarya', category: 'Keterampilan' },
  { id: 36, name: 'Tajwid', category: 'Diniyah' },
  { id: 29, name: 'Tarikh', category: 'Diniyah' },
  { id: 35, name: 'Tashrif', category: 'Diniyah' },
  { id: 21, name: 'Tauhid', category: 'Diniyah' },
  { id: 32, name: 'Tematik 1', category: 'Umum' },
  { id: 37, name: 'Tematik 2', category: 'Umum' },
  { id: 40, name: 'Thibun Nabawi', category: 'Diniyah' },
  { id: 38, name: 'TTB', category: 'Diniyah' },
  { id: 23, name: 'Ushul Fiqih', category: 'Diniyah' },
];

export const INITIAL_STUDENTS: Student[] = [
  // Aliyah
  { id: 1, nis: '201102', name: 'Aura', classId: 1, birthPlace: 'Bandung', birthDate: '2008-03-17', guardian: 'Nur' },
  
  // Aliyah 2
  { id: 4, nis: '19009', name: 'Adilah Dzakiyy', classId: 4, birthPlace: 'Bandung', birthDate: '2007-11-05', guardian: 'Shodiqin' },
  { id: 5, nis: '19013', name: 'Ghina Mawadah Mutmainnah', classId: 4, birthPlace: 'Bandung', birthDate: '2008-06-05', guardian: 'Aa Permana' },
  { id: 6, nis: '19014', name: 'Hamidah Lailah Syabani', classId: 4, birthPlace: 'Cikampek', birthDate: '2007-09-02', guardian: 'Ibnu Maulana' },
  { id: 7, nis: '19018', name: 'Muhammad Rafi Fauzan', classId: 4, birthPlace: 'Cimahi', birthDate: '2009-04-15', guardian: 'Nurbuwono Langgeng' },

  // Ibtidaiyah 2
  { id: 45, nis: '25119', name: 'Abiyan Syaifurrahman', classId: 8, birthPlace: 'Karawang', birthDate: '2016-08-26', guardian: 'Subur Sanusi' },
  { id: 43, nis: '20046', name: 'Abyan Muhammad Umar Faqiha', classId: 8, birthPlace: 'Bandung', birthDate: '2015-12-06', guardian: 'Saeful Ridwan' },
  { id: 46, nis: '24111', name: 'Asma Adiba', classId: 8, birthPlace: 'Sukabumi', birthDate: '2015-05-15', guardian: 'Acep Acun Mansur' },
  { id: 41, nis: '23092', name: 'Attaqi Habibi Inghimasy', classId: 8, birthPlace: 'Purwakarta', birthDate: '2016-04-21', guardian: 'Hendra Arifin' },
  { id: 42, nis: '24105', name: 'Muhammad Faqih Al-Jihad', classId: 8, birthPlace: 'Subang', birthDate: '2015-06-05', guardian: 'Husni Mubarok' },
  { id: 44, nis: '24103', name: 'Ulwan Ghozi', classId: 8, birthPlace: 'Bekasi', birthDate: '2015-07-23', guardian: 'Dedi Alamsyah' },
  { id: 47, nis: '23093', name: 'Zahra Aulia Nafisyah', classId: 8, birthPlace: 'Bandung', birthDate: '2016-02-23', guardian: 'Deni Rahmat Dipraja' },

  // Ibtidaiyah 3
  { id: 35, nis: '23082', name: 'Ahmad Imron Abdulloh', classId: 9, birthPlace: 'Karawang', birthDate: '2013-08-11', guardian: 'Ahmad Suherman' },
  { id: 39, nis: '20060', name: 'Gisya Hamidah Fajriah', classId: 9, birthPlace: 'Bandung Barat', birthDate: '2014-09-20', guardian: 'Aa Permana' },
  { id: 40, nis: '23083', name: 'Muhammad Hamzah Assadulloh', classId: 9, birthPlace: 'Tangerang Selatan', birthDate: '2014-07-15', guardian: 'Imam Syarif Hidayatulloh' },
  { id: 37, nis: '22068', name: 'Utsman Kahfi', classId: 9, birthPlace: 'Bekasi', birthDate: '2014-03-17', guardian: 'Dedi Alamsyah' },
  { id: 38, nis: '20051', name: 'Wafi Taqilah Kautsar', classId: 9, birthPlace: 'Bandung', birthDate: '2014-10-25', guardian: 'Eka Alkasah' },
  { id: 36, nis: '22069', name: 'Zaid Rojulun Makis', classId: 9, birthPlace: 'Karawang', birthDate: '2013-10-09', guardian: 'Aep Saepudin' },

  // Ibtidaiyah 4
  { id: 27, nis: '20045', name: 'Abneera Husna Askariyan', classId: 10, birthPlace: 'Bandung', birthDate: '2012-11-06', guardian: 'Saeful Ridwan' },
  { id: 32, nis: '24106', name: 'Hanan Nabila', classId: 10, birthPlace: 'Sukabumi', birthDate: '2013-01-09', guardian: 'Acep Acun Mansur' },
  { id: 28, nis: '20058', name: 'Kaisyah Yasarah', classId: 10, birthPlace: 'Karawang', birthDate: '2013-04-24', guardian: 'Masna' },
  { id: 31, nis: '22072', name: 'Muhamad Syafiq', classId: 10, birthPlace: 'Karawang', birthDate: '2012-01-16', guardian: 'Ibnu Maulana' },
  { id: 29, nis: '22066', name: 'Muhammad Azzam Faiz Al-faruq', classId: 10, birthPlace: 'Karawang', birthDate: '2012-12-10', guardian: 'Aep Saepudin' },
  { id: 33, nis: '25120', name: 'Qonita Zaida Zahra', classId: 10, birthPlace: 'Bandung', birthDate: '2013-01-28', guardian: 'Heru Sulaiman' },
  { id: 34, nis: '25123', name: 'Rania Nabilah Muhsinat', classId: 10, birthPlace: 'Bandung', birthDate: '2012-09-01', guardian: 'Mulyawansyah' },
  { id: 30, nis: '22067', name: 'Ukasyah Al Fadani', classId: 10, birthPlace: 'Bekasi', birthDate: '2012-09-30', guardian: 'Dedi Alamsyah' },

  // Mutawasith 1
  { id: 15, nis: '19028', name: 'Ali Faiz Mubarak', classId: 5, birthPlace: 'Cimahi', birthDate: '2011-04-15', guardian: 'Shodiqin' },
  { id: 23, nis: '24107', name: 'Aydin Fakhri Ali', classId: 5, birthPlace: 'Bandung', birthDate: '2011-10-28', guardian: 'Suhendar' },
  { id: 19, nis: '20039', name: 'Ikrima Rabbaniya', classId: 5, birthPlace: 'Bandung', birthDate: '2011-03-07', guardian: 'Sholeh Abdurrahman' },
  { id: 22, nis: '23081', name: 'Muhammad Abdul Azmi Rifaat', classId: 5, birthPlace: 'Karawang', birthDate: '2011-10-21', guardian: 'Masna' },
  { id: 20, nis: '20040', name: 'Muhammad Farhan', classId: 5, birthPlace: 'Bandung', birthDate: '2012-01-07', guardian: 'Ahmad Hilal' },
  { id: 16, nis: '19033', name: 'Nadzira Zakiya', classId: 5, birthPlace: 'Bandung', birthDate: '2011-03-07', guardian: 'Sholeh Abdurrahman' },
  { id: 21, nis: '20042', name: 'Nisa Amelia', classId: 5, birthPlace: 'Bandung', birthDate: '2009-05-09', guardian: 'Firmansyah' },
  { id: 17, nis: '19035', name: 'Raisya Rabbani Shodiqin', classId: 5, birthPlace: 'Bandung', birthDate: '2011-09-28', guardian: 'Jajang Iqin Shodiqin' },
  { id: 25, nis: '24109', name: 'Sabila Mustaqima', classId: 5, birthPlace: 'Bandung', birthDate: '2011-07-09', guardian: 'Gugun Wiguna' },
  { id: 18, nis: '22064', name: 'Samudra Al Hafidz', classId: 5, birthPlace: 'Waringin Sari', birthDate: '2011-06-16', guardian: 'M. Imron' },
  { id: 24, nis: '24108', name: 'Siti Nuraeni', classId: 5, birthPlace: 'Bandung Barat', birthDate: '2012-02-23', guardian: 'Dedih Jukarwan' },

  // Mutawasith 2
  { id: 13, nis: '23080', name: 'Abza Al Ghifari Putra', classId: 6, birthPlace: 'Tasikmalaya', birthDate: '2009-12-19', guardian: 'Hendra Gunawan' },
  { id: 12, nis: '22063', name: 'Jundullah Al Hafidz', classId: 6, birthPlace: 'Waringin Sari', birthDate: '2007-10-16', guardian: 'M. Imron' },
  { id: 8, nis: '19023', name: 'Khofifah Az-Zahra', classId: 6, birthPlace: 'Bandung', birthDate: '2009-02-27', guardian: 'Ahmad Hilal' },
  { id: 9, nis: '19024', name: 'Muhammad Ibadurrohman', classId: 6, birthPlace: 'Bandung', birthDate: '2009-11-02', guardian: 'Yayat Cahdiyat' },
  { id: 14, nis: '23096', name: 'Mutiara Wafi Tazkiah', classId: 6, birthPlace: 'Lampung', birthDate: '2007-03-11', guardian: 'Supriyanto' },
  { id: 10, nis: '19025', name: 'Nada Lubna Mumtaz', classId: 6, birthPlace: 'Serang Banten', birthDate: '2008-09-09', guardian: 'Fiki Hartono' },
  { id: 11, nis: '19026', name: 'Salwa Zahra Annisa', classId: 6, birthPlace: 'Bandung', birthDate: '2008-10-10', guardian: 'Abdul Muhyi' },
  { id: 26, nis: '24110', name: 'Urwah Abdurrahman', classId: 6, birthPlace: 'Magelang', birthDate: '2010-03-07', guardian: 'Sutrisno' },

  // Tarbiyatul Aulad
  { id: 49, nis: '24099', name: 'Arbaniyan Muhammad Bassam Khuluqy', classId: 11, birthPlace: 'Bandung', birthDate: '2018-12-09', guardian: 'Saeful Ridwan' },
  { id: 48, nis: '25116', name: 'Ibrahim', classId: 11, birthPlace: 'Bandung', birthDate: '2017-04-11', guardian: 'Muhammad Irfan Muttaqin' },
  { id: 50, nis: '25117', name: 'Maryam Sulha Adiba', classId: 11, birthPlace: 'Bandung Barat', birthDate: '2020-01-04', guardian: 'Asral' },
  { id: 51, nis: '25121', name: 'Muhammad Fadhilah Kahfi', classId: 11, birthPlace: 'Purwakarta', birthDate: '2018-11-09', guardian: 'Hendra Arifin' },
  { id: 52, nis: '25118', name: 'Risya Naifa Salimi', classId: 11, birthPlace: 'Bandung Barat', birthDate: '2020-06-04', guardian: 'Eka Alkasah' },
  { id: 53, nis: '25122', name: 'Ruby', classId: 11, birthPlace: 'Bandung', birthDate: '2019-05-14', guardian: 'Masna' },
];

export const INITIAL_GRADES: Grade[] = [
  // Grades for Aura (Kelas Aliyah)
  { id: 101, studentId: 1, subjectId: 14, classId: 1, semester: 1, score: 80, testDate: '2025-10-12', type: 'regular' },
  { id: 102, studentId: 1, subjectId: 13, classId: 1, semester: 1, score: 70, testDate: '2025-10-14', type: 'regular' },
  
  // Grades for Adilah Dzakiyy (Kelas Aliyah 2)
  { id: 103, studentId: 4, subjectId: 1, classId: 4, semester: 1, score: 85, testDate: '2025-10-15', type: 'regular' },
  { id: 104, studentId: 4, subjectId: 4, classId: 4, semester: 1, score: 82, testDate: '2025-10-16', type: 'regular' },
  { id: 105, studentId: 4, subjectId: 28, classId: 4, semester: 1, score: 88, testDate: '2025-10-17', type: 'regular' },
  
  // Grades for Ghina Mawadah (Kelas Aliyah 2)
  { id: 106, studentId: 5, subjectId: 1, classId: 4, semester: 1, score: 83, testDate: '2025-10-15', type: 'regular' },
  { id: 107, studentId: 5, subjectId: 28, classId: 4, semester: 1, score: 89, testDate: '2025-10-17', type: 'regular' },

  // Grades for Ali Faiz (Mutawasith 1)
  { id: 108, studentId: 15, subjectId: 33, classId: 5, semester: 1, score: 86, testDate: '2025-10-18', type: 'regular' },
  { id: 109, studentId: 15, subjectId: 22, classId: 5, semester: 1, score: 84, testDate: '2025-10-19', type: 'regular' },
  
  // Grades for Salwa Zahra (Mutawasith 2)
  { id: 110, studentId: 11, subjectId: 9, classId: 6, semester: 1, score: 87, testDate: '2025-10-20', type: 'regular' },
  { id: 111, studentId: 11, subjectId: 33, classId: 6, semester: 1, score: 85, testDate: '2025-10-21', type: 'regular' },
];

export const INITIAL_TAHFIDZ: TahfidzGrade[] = [
  {
    id: 201,
    studentId: 1,
    classId: 1,
    semester: 1,
    tahfidzScore: 84,
    tajweedScore: 86,
    totalScore: 85,
    gradeLetter: 'B',
    notes: 'Juz 30 (An-Naba s.d An-Nas) lancar mutqin',
    testDate: '2025-10-15'
  },
  {
    id: 202,
    studentId: 4,
    classId: 4,
    semester: 1,
    tahfidzScore: 88,
    tajweedScore: 88,
    totalScore: 88,
    gradeLetter: 'A',
    notes: 'Juz 1-2 (Al-Baqarah 1 s.d 286)',
    testDate: '2025-10-16'
  },
  {
    id: 203,
    studentId: 15,
    classId: 5,
    semester: 1,
    tahfidzScore: 82,
    tajweedScore: 80,
    totalScore: 81,
    gradeLetter: 'B',
    notes: 'Juz 29 (Al-Mulk s.d Al-Mursalat)',
    testDate: '2025-10-18'
  },
  {
    id: 204,
    studentId: 11,
    classId: 6,
    semester: 1,
    tahfidzScore: 89,
    tajweedScore: 87,
    totalScore: 88,
    gradeLetter: 'A',
    notes: 'Juz 1 s.d 3 (Al-Baqarah s.d Ali Imran 91)',
    testDate: '2025-10-20'
  },
  {
    id: 205,
    studentId: 45,
    classId: 8,
    semester: 1,
    tahfidzScore: 78,
    tajweedScore: 76,
    totalScore: 77,
    gradeLetter: 'C',
    notes: 'Surat Ad-Duha s.d An-Nas',
    testDate: '2025-10-22'
  }
];

export const INITIAL_EXAM_FILES: ExamFile[] = [
  {
    id: 73,
    subjectId: 28, // Bahasa Inggris
    classId: 1,    // Aliyah
    title: 'Soal UTS Bahasa Inggris Semester 1',
    fileName: 'MTS 1 - B ARAB.docx',
    fileSize: '48.5 KB',
    uploadDate: '2025-10-08'
  },
  {
    id: 74,
    subjectId: 33, // Bahasa Arab
    classId: 5,    // Mutawasith 1
    title: 'Bank Soal Ujian Bahasa Arab Semester Ganjil',
    fileName: 'Ujian_B_Arab_Mutawasith1.pdf',
    fileSize: '184.2 KB',
    uploadDate: '2025-10-09'
  }
];

export const INITIAL_EXAM_PACKAGES: ExamQuestionsPackage[] = [
  {
    id: 65,
    subjectId: 18, // Bahasa Jepang
    classId: 1,    // Aliyah
    type: 'essay',
    createdAt: '2025-10-10',
    questions: [
      {
        id: 1,
        text: 'Tuliskan dan jelaskan perbedaan penggunaan partikel は (wa) dan が (ga) dalam struktur kalimat dasar bahasa Jepang beserta 2 contohnya!'
      }
    ]
  },
  {
    id: 89,
    subjectId: 6,  // Biologi
    classId: 1,    // Aliyah
    type: 'essay',
    createdAt: '2025-10-12',
    questions: [
      {
        id: 1,
        text: 'Jelaskan tahapan proses fotosintesis pada reaksi terang dan reaksi gelap, serta sebutkan produk akhir masing-masing tahapan!'
      },
      {
        id: 2,
        text: 'Bagaimana peran membran sel dalam proses transpor pasif dan transpor aktif zat melintasi sel?'
      },
      {
        id: 3,
        text: 'Sebutkan perbedaan mendasar antara sel tumbuhan dan sel hewan beserta fungsi organel khas masing-masing!'
      }
    ]
  },
  {
    id: 90,
    subjectId: 1,  // Matematika
    classId: 1,    // Aliyah
    type: 'multiple_choice',
    createdAt: '2025-10-13',
    questions: [
      {
        id: 1,
        text: 'Jika f(x) = 2x + 5 dan g(x) = x^2 - 1, maka nilai dari (g o f)(1) adalah...',
        optionA: '48',
        optionB: '49',
        optionC: '50',
        optionD: '47',
        correctAnswer: 'A'
      },
      {
        id: 2,
        text: 'Diketahui deret aritmatika dengan suku pertama a = 3 dan beda b = 4. Suku ke-10 deret tersebut adalah...',
        optionA: '36',
        optionB: '39',
        optionC: '43',
        optionD: '40',
        correctAnswer: 'B'
      },
      {
        id: 3,
        text: 'Himpunan penyelesaian dari pertidaksamaan 3x - 7 < 8 untuk x bilangan bulat positif adalah...',
        optionA: '{1, 2, 3, 4}',
        optionB: '{1, 2, 3, 4, 5}',
        optionC: '{0, 1, 2, 3, 4}',
        optionD: '{1, 2, 3}',
        correctAnswer: 'A'
      }
    ]
  },
  {
    id: 91,
    subjectId: 4,  // Fisika
    classId: 1,    // Aliyah
    type: 'essay',
    createdAt: '2025-10-14',
    questions: [
      {
        id: 1,
        text: 'Sebuah mobil bermassa 1.000 kg bergerak dengan kecepatan 20 m/s. Hitunglah energi kinetik yang dimiliki mobil tersebut!'
      },
      {
        id: 2,
        text: 'Jelaskan Hukum Newton I, II, dan III disertai masing-masing rumus matematis dan contoh penerapannya dalam kehidupan sehari-hari!'
      },
      {
        id: 3,
        text: 'Sebuah benda dijatuhkan bebas dari ketinggian 45 meter di atas tanah (g = 10 m/s²). Berapakah waktu yang dibutuhkan benda untuk sampai di tanah?'
      }
    ]
  },
  {
    id: 84,
    subjectId: 9,  // Ekonomi
    classId: 6,    // Mutawasith 2
    type: 'multiple_choice',
    createdAt: '2025-10-15',
    questions: [
      {
        id: 1,
        text: 'Faktor produksi yang menghasilkan balas jasa berupa upah atau gaji adalah...',
        optionA: 'Tanah dan Alam',
        optionB: 'Tenaga Kerja',
        optionC: 'Modal',
        optionD: 'Kewirausahaan',
        correctAnswer: 'B'
      },
      {
        id: 2,
        text: 'Kegiatan ekonomi yang bertujuan untuk mengurangi atau menghabiskan nilai guna suatu barang dan jasa dinamakan...',
        optionA: 'Produksi',
        optionB: 'Distribusi',
        optionC: 'Konsumsi',
        optionD: 'Investasi',
        correctAnswer: 'C'
      }
    ]
  }
];

export const INITIAL_STUDENT_ATTENDANCE: StudentAttendanceRecord[] = [
  // Presensi Santri Aliyah 2
  { id: 'att_4_2025-12-10', studentId: 4, studentName: 'Adilah Dzakiyy', classId: 4, date: '2025-12-10', status: 'H', recordedBy: 'Ust. Hilal' },
  { id: 'att_5_2025-12-10', studentId: 5, studentName: 'Ghina Mawadah Mutmainnah', classId: 4, date: '2025-12-10', status: 'H', recordedBy: 'Ust. Hilal' },
  { id: 'att_6_2025-12-10', studentId: 6, studentName: 'Hamidah Lailah Syabani', classId: 4, date: '2025-12-10', status: 'I', notes: 'Izin urusan keluarga', recordedBy: 'Ust. Hilal' },
  { id: 'att_7_2025-12-10', studentId: 7, studentName: 'Muhammad Rafi Fauzan', classId: 4, date: '2025-12-10', status: 'H', recordedBy: 'Ust. Hilal' },

  // Presensi Santri Aliyah (Kelas 1)
  { id: 'att_1_2025-12-10', studentId: 1, studentName: 'Aura', classId: 1, date: '2025-12-10', status: 'H', recordedBy: 'Abu Assa' },

  // Presensi Santri Mutawasith 1 (Kelas 5)
  { id: 'att_15_2025-12-10', studentId: 15, studentName: 'Ali Faiz Mubarak', classId: 5, date: '2025-12-10', status: 'H', recordedBy: 'Ust. Shodiqin' },
  { id: 'att_19_2025-12-10', studentId: 19, studentName: 'Ikrima Rabbaniya', classId: 5, date: '2025-12-10', status: 'S', notes: 'Demam di asrama / istirahat UKS', recordedBy: 'Ust. Shodiqin' },
  { id: 'att_20_2025-12-10', studentId: 20, studentName: 'Muhammad Farhan', classId: 5, date: '2025-12-10', status: 'H', recordedBy: 'Ust. Shodiqin' },
  { id: 'att_21_2025-12-10', studentId: 21, studentName: 'Nisa Amelia', classId: 5, date: '2025-12-10', status: 'H', recordedBy: 'Ust. Shodiqin' },
  { id: 'att_25_2025-12-10', studentId: 25, studentName: 'Sabila Mustaqima', classId: 5, date: '2025-12-10', status: 'H', recordedBy: 'Ust. Shodiqin' },

  // Presensi Santri Ibtidaiyah 4 (Kelas 10)
  { id: 'att_27_2025-12-10', studentId: 27, studentName: 'Abneera Husna Askariyan', classId: 10, date: '2025-12-10', status: 'H', recordedBy: 'Ust. Saeful' },
  { id: 'att_28_2025-12-10', studentId: 28, studentName: 'Kaisyah Yasarah', classId: 10, date: '2025-12-10', status: 'H', recordedBy: 'Ust. Saeful' },
  { id: 'att_30_2025-12-10', studentId: 30, studentName: 'Ukasyah Al Fadani', classId: 10, date: '2025-12-10', status: 'H', recordedBy: 'Ust. Saeful' },
  { id: 'att_31_2025-12-10', studentId: 31, studentName: 'Muhamad Syafiq', classId: 10, date: '2025-12-10', status: 'S', notes: 'Sakit flu', recordedBy: 'Ust. Saeful' },
];

export const INITIAL_TEACHER_ATTENDANCE: TeacherAttendanceRecord[] = [
  {
    id: 'tatt_1_today',
    teacherId: 'usr-1',
    teacherName: 'Muhammad Siroj, S.Pd.I',
    date: '2025-12-10',
    time: '06:55',
    status: 'hadir',
    subjectTaught: 'Tahfidz Al-Qur\'an & Hadist',
    classRoom: 'Aliyah & Mutawasith',
    notes: 'Hadir tepat waktu, memimpin sholat Dhuha bersama santri',
  },
  {
    id: 'tatt_2_today',
    teacherId: 'usr-2',
    teacherName: 'Ust. Saeful Ridwan',
    date: '2025-12-10',
    time: '07:10',
    status: 'hadir',
    subjectTaught: 'Fiqih & Ushul Fiqih',
    classRoom: 'Ibtidaiyah 4 & Aliyah 2',
    notes: 'Kajian Fiqih Bab Muamalah',
  },
  {
    id: 'tatt_3_today',
    teacherId: 'usr-3',
    teacherName: 'Ust. Ahmad Hilal',
    date: '2025-12-10',
    time: '07:05',
    status: 'hadir',
    subjectTaught: 'Bahasa Arab & Nahwu-Shorof',
    classRoom: 'Aliyah 2',
    notes: 'Mutholaah Kitab Al-Jurumiyah',
  },
  {
    id: 'tatt_4_today',
    teacherId: 'usr-shodiqin',
    teacherName: 'Ust. Jajang Iqin Shodiqin',
    date: '2025-12-10',
    time: '07:15',
    status: 'hadir',
    subjectTaught: 'Tauhid & Aqidah',
    classRoom: 'Mutawasith 1',
    notes: 'Pengajaran Matan Aqidatul Awam',
  },
  {
    id: 'tatt_5_today',
    teacherId: 'usr-cahdiyat',
    teacherName: 'Ust. Yayat Cahdiyat',
    date: '2025-12-10',
    time: '07:20',
    status: 'hadir',
    subjectTaught: 'Tajwid & TTB',
    classRoom: 'Mutawasith 2',
    notes: 'Kaidah Tuhfatul Athfal',
  },
  {
    id: 'tatt_6_today',
    teacherId: 'usr-salwa',
    teacherName: 'Ustz. Salwa',
    date: '2025-12-10',
    time: '07:45',
    status: 'dinas_luar',
    subjectTaught: 'Tarbiyatul Aulad',
    classRoom: 'Tarbiyatul Aulad',
    notes: 'Mengikuti Workshop Pembelajaran Pesantren Tingkat Kabupaten',
  },
];

export const INITIAL_TEACHING_ASSIGNMENTS: TeachingAssignment[] = [
  {
    id: 'ta-1',
    subjectId: 22, // Fiqih
    subjectName: 'Fiqih',
    category: 'Diniyah',
    classId: 4, // Aliyah 2
    className: 'Aliyah 2',
    teacherName: 'Ust. Saeful Ridwan',
    hoursPerWeek: 4,
    day: 'Senin',
    timeSlot: '07:30 - 09:00',
    room: 'Kelas Aliyah 2',
    referenceBook: 'Safinatun Najah & Fathul Qorib',
    targetCompetence: 'Memahami rukun sholat, thaharah, dan fiqih muamalah kontemporer',
  },
  {
    id: 'ta-2',
    subjectId: 33, // Bahasa Arab
    subjectName: 'Bahasa Arab',
    category: 'Bahasa',
    classId: 4, // Aliyah 2
    className: 'Aliyah 2',
    teacherName: 'Ust. Ahmad Hilal',
    hoursPerWeek: 4,
    day: 'Selasa',
    timeSlot: '09:30 - 11:00',
    room: 'Laboratorium Bahasa',
    referenceBook: 'Durusul Lughah Al-Arabiyyah Jilid 2',
    targetCompetence: 'Keterampilan muhadatsah aktif dan tarkib kalimat dasar bahasa Arab',
  },
  {
    id: 'ta-3',
    subjectId: 21, // Tauhid
    subjectName: 'Tauhid',
    category: 'Diniyah',
    classId: 4, // Aliyah 2
    className: 'Aliyah 2',
    teacherName: 'Muhammad Siroj, S.Pd.I',
    hoursPerWeek: 2,
    day: 'Rabu',
    timeSlot: '07:30 - 09:00',
    room: 'Kelas Aliyah 2',
    referenceBook: 'Tijan Ad-Darari & Al-Aqidah Al-Wasithiyyah',
    targetCompetence: 'Menanamkan pondasi akidah ahlussunnah wal jamaah dan sifat 20',
  },
  {
    id: 'ta-4',
    subjectId: 36, // Tajwid
    subjectName: 'Tajwid',
    category: 'Diniyah',
    classId: 1, // Aliyah
    className: 'Aliyah',
    teacherName: 'Abu Assa',
    hoursPerWeek: 2,
    day: 'Senin',
    timeSlot: '09:30 - 11:00',
    room: 'Masjid Pesantren',
    referenceBook: 'Tuhfatul Athfal & Hidayatush Shibyan',
    targetCompetence: 'Hukum nun sukun, tanwin, mim sukun, dan mad far\'i praktis',
  },
  {
    id: 'ta-5',
    subjectId: 35, // Tashrif
    subjectName: 'Tashrif',
    category: 'Diniyah',
    classId: 5, // Mutawasith 1
    className: 'Mutawasith 1',
    teacherName: 'Ust. Jajang Iqin Shodiqin',
    hoursPerWeek: 3,
    day: 'Kamis',
    timeSlot: '07:30 - 09:00',
    room: 'Kelas Mutawasith 1',
    referenceBook: 'Matan Al-Bina wa Al-Asas & Tashrif Al-Izzi',
    targetCompetence: 'Menguasai wazan fiil tsulatsi mujarrad dan tsulatsi mazid',
  },
  {
    id: 'ta-6',
    subjectId: 39, // Hadist
    subjectName: 'Hadist',
    category: 'Diniyah',
    classId: 6, // Mutawasith 2
    className: 'Mutawasith 2',
    teacherName: 'Ust. Yayat Cahdiyat',
    hoursPerWeek: 2,
    day: 'Jumat',
    timeSlot: '08:00 - 09:30',
    room: 'Masjid Pesantren',
    referenceBook: 'Al-Arba\'in An-Nawawiyyah',
    targetCompetence: 'Menghafal 20 hadist pilihan beserta syarah adab dan akhlak santri',
  },
  {
    id: 'ta-7',
    subjectId: 1, // Matematika
    subjectName: 'Matematika',
    category: 'Umum',
    classId: 4, // Aliyah 2
    className: 'Aliyah 2',
    teacherName: 'Ust. Saeful Ridwan',
    hoursPerWeek: 4,
    day: 'Kamis',
    timeSlot: '09:30 - 11:00',
    room: 'Kelas Aliyah 2',
    referenceBook: 'Buku Matematika Kurikulum Nasional & Modul Latihan',
    targetCompetence: 'Aljabar, fungsi, statistik dasar, dan penalaran numerik',
  },
  {
    id: 'ta-8',
    subjectId: 4, // Fisika
    subjectName: 'Fisika',
    category: 'Umum',
    classId: 1, // Aliyah
    className: 'Aliyah',
    teacherName: 'Ust. Ahmad Hilal',
    hoursPerWeek: 3,
    day: 'Rabu',
    timeSlot: '13:00 - 14:30',
    room: 'Laboratorium IPA',
    referenceBook: 'Buku Fisika Madrasah Aliyah',
    targetCompetence: 'Mekanika gerak, energi kinetik, dan hukum dinamika Newton',
  },
  {
    id: 'ta-9',
    subjectId: 28, // Bahasa Inggris
    subjectName: 'Bahasa Inggris',
    category: 'Bahasa',
    classId: 6, // Mutawasith 2
    className: 'Mutawasith 2',
    teacherName: 'Ustz. Salwa',
    hoursPerWeek: 3,
    day: 'Sabtu',
    timeSlot: '07:30 - 09:00',
    room: 'Kelas Mutawasith 2',
    referenceBook: 'English for Islamic Boarding Schools',
    targetCompetence: 'Grammar dasar, vocabulary harian, dan percakapan bahasa Inggris santri',
  },
  {
    id: 'ta-10',
    subjectId: 34, // Komputer
    subjectName: 'Komputer',
    category: 'Keterampilan',
    classId: 10, // Ibtidaiyah 4
    className: 'Ibtidaiyah 4',
    teacherName: 'Ust. Saeful Ridwan',
    hoursPerWeek: 2,
    day: 'Ahad',
    timeSlot: '08:00 - 09:30',
    room: 'Laboratorium Komputer',
    referenceBook: 'Panduan Praktis Aplikasi Perkantoran & TIK',
    targetCompetence: 'Pengenalan komputer, mengetik 10 jari, dan pengolahan dokumen teks',
  },
];

