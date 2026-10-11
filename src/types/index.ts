export interface User {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  avatarUrl: string;
  role: 'superadmin' | 'admin' | 'guru' | 'wali_kelas';
  joinedDate: string;
}

export type ThemeColor =
  | 'emerald'
  | 'forest'
  | 'olive'
  | 'mint'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'navy'
  | 'cobalt'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose'
  | 'crimson'
  | 'terracotta'
  | 'amber'
  | 'gold'
  | 'bronze'
  | 'espresso'
  | 'slate'
  | 'charcoal'
  | 'custom';

export type ThemeLayout = 'sidebar' | 'topbar';
export type ThemeContentWidth = 'contained' | 'full' | 'wide' | 'compact';
export type ThemeDensity = 'comfortable' | 'compact' | 'spacious';
export type ThemeBorderRadius = 'sharp' | 'subtle' | 'modern' | 'rounded' | 'pill';

export type HeroBannerStyle =
  | 'gradient_brand'
  | 'dark_elegant'
  | 'light_clean'
  | 'glass_modern'
  | 'split_accent'
  | 'islamic_arch'
  | 'aurora_mesh'
  | 'geometric_mosaic'
  | 'editorial_card'
  | 'compact_ribbon'
  | 'cyber_academic'
  | 'sunset_warmth'
  | 'royal_emerald'
  | 'islamic_calligraphy'
  | 'modern_stacked'
  | 'pastel_mint'
  | 'cosmic_galaxy'
  | 'vintage_parchment'
  | 'ocean_breeze'
  | 'crimson_luxury';

export type StatsCardStyle =
  | 'modern_elevated'
  | 'glass_glow'
  | 'split_metric'
  | 'minimal_bordered'
  | 'neo_brutalist'
  | 'gradient_accent'
  | 'compact_bar'
  | 'circular_badge'
  | 'floating_card_3d'
  | 'dark_oled_glow'
  | 'kpi_target_gauge'
  | 'bento_compact'
  | 'soft_neumorphic'
  | 'ribbon_badge'
  | 'accent_bottom_wave'
  | 'pill_duotone';

export interface ThemeSettings {
  colorTheme: ThemeColor;
  customPrimaryHex?: string;
  customSecondaryHex?: string;
  customPageBgHex?: string;
  pageBgStyle?: 'clean' | 'slate' | 'warm' | 'paper' | 'cool_slate' | 'mint_breeze' | 'pure' | 'tinted' | 'mesh' | 'cream' | 'sage' | 'cool_gray';
  layout: ThemeLayout;
  contentWidth: ThemeContentWidth;
  density: ThemeDensity;
  sectionSpacing?: 'tight' | 'normal' | 'relaxed';
  borderRadius: ThemeBorderRadius;
  showAnnouncement: boolean;
  announcementSpeed?: 'very_slow' | 'slow' | 'normal' | 'fast' | 'very_fast';
  accentSaturation: 'vibrant' | 'minimal';
  headerStyle: 'light' | 'dark' | 'brand' | 'glass' | 'colored' | 'gradient' | 'minimal' | 'minimal_border';
  sidebarStyle: 'light' | 'dark' | 'brand' | 'colored' | 'glass' | 'tinted' | 'gradient' | 'bordered_clean';
  logoIconType: 'image' | 'book' | 'graduation' | 'award' | 'school' | 'sparkles';
  customLogoUrl?: string;
  // Comprehensive Web Appearance & Style Settings (1A - 1H)
  surfaceMode?: 'light' | 'soft_tinted' | 'high_contrast' | 'sepia_warm' | 'slate_dim' | 'dark_elevated';
  surfaceThemeMode?: 'light' | 'soft_sepia' | 'high_contrast' | 'dark_slate' | 'soft_tinted' | 'sepia_warm' | 'slate_dim' | 'dark_elevated';
  fontFamily?: 'jakarta' | 'inter' | 'poppins' | 'nunito' | 'serif' | 'mono' | 'system';
  webFontFamily?: 'jakarta' | 'inter' | 'poppins' | 'nunito' | 'serif' | 'mono' | 'system';
  headingFontFamily?: 'inherit' | 'jakarta' | 'inter' | 'serif' | 'poppins';
  fontScale?: 'small' | 'normal' | 'large' | 'xlarge';
  headingWeight?: 'semibold' | 'bold' | 'extrabold' | 'black';
  headingLetterSpacing?: 'tight' | 'normal' | 'wide';
  letterSpacingStyle?: 'tight' | 'normal' | 'wide';
  lineHeight?: 'tight' | 'normal' | 'relaxed';
  lineHeightStyle?: 'snug' | 'normal' | 'relaxed' | 'tight';
  cardStyle?: 'bordered' | 'elevated' | 'glass' | 'flat' | 'soft_accent' | 'neo_brutal' | 'soft_shadow' | 'accent_top' | 'accent_left';
  cardSurfaceStyle?: 'bordered' | 'elevated' | 'glass' | 'flat' | 'soft_accent' | 'neo_brutal' | 'soft_shadow' | 'accent_top' | 'accent_left';
  cardAccentBar?: 'none' | 'top_line' | 'left_line' | 'gradient_top';
  cardHoverEffect?: 'none' | 'lift' | 'glow' | 'border_highlight' | 'scale_subtle';
  shadowIntensity?: 'none' | 'subtle' | 'medium' | 'deep';
  borderWidth?: 'thin' | 'normal' | 'thick';
  borderContrast?: 'none' | 'subtle' | 'normal' | 'high';
  tableStyle?: 'clean' | 'default' | 'striped' | 'bordered' | 'compact_grid' | 'modern_card' | 'compact' | 'tinted_header' | 'hover_highlight';
  webTableStyle?: 'clean' | 'default' | 'striped' | 'bordered' | 'compact_grid' | 'modern_card' | 'compact' | 'tinted_header' | 'hover_highlight';
  bgPattern?: 'none' | 'dots' | 'grid' | 'islamic_geo' | 'islamic_subtle' | 'diagonal' | 'crosshatch' | 'mesh_glow';
  pagePattern?: 'none' | 'dots' | 'grid' | 'islamic_geo' | 'islamic_subtle' | 'diagonal' | 'crosshatch' | 'mesh_glow';
  buttonStyle?: 'solid' | 'gradient' | 'glossy' | 'elevated_3d' | 'soft_outline';
  inputStyle?: 'outlined' | 'filled' | 'underlined' | 'soft_ring' | 'glass';
  inputFieldStyle?: 'outlined' | 'filled' | 'underlined' | 'soft_ring' | 'glass';
  badgeStyle?: 'soft' | 'solid' | 'outline' | 'pill_dot' | 'square';
  activeTabIndicator?: 'pill' | 'underline' | 'soft_box' | 'left_bar' | 'gradient_glow';
  navActiveIndicator?: 'pill' | 'pill_solid' | 'soft_tinted' | 'soft_box' | 'bottom_line' | 'underline' | 'left_bar' | 'glow' | 'gradient_glow';
  heroBannerStyle?: HeroBannerStyle;
  heroBannerHeight?: 'compact' | 'standard' | 'spacious';
  statsCardStyle?: StatsCardStyle;
  modalBackdropStyle?: 'blur_dark' | 'blur_light' | 'solid_dark' | 'glass_tint' | 'glass_brand';
  scrollbarStyle?: 'default' | 'thin' | 'thin_modern' | 'accent' | 'brand_accent' | 'minimal';
  animationStyle?: 'fade' | 'slide_up' | 'zoom_subtle' | 'none';
  animationSpeed?: 'none' | 'fast' | 'normal' | 'smooth';
  showHeroBanner?: boolean;
  showHeroStats?: boolean;
  showFooter?: boolean;
  stickyHeader?: boolean;
  tableRowHoverHighlight?: boolean;
  enableGlassmorphism?: boolean;
  enableAnimatedGradients?: boolean;
  highContrastText?: boolean;
  compactMobileNav?: boolean;
  showStatTrends?: boolean;
  showBreadcrumbIndicator?: boolean;
  customCssSnippet?: string;
  // Report Card & PDF Appearance Settings
  customRightLogoUrl?: string;
  reportShowLeftLogo?: boolean;
  reportShowRightLogo?: boolean;
  reportLogoSize?: 'sm' | 'md' | 'lg';
  reportLogoShape?: 'clean' | 'rounded' | 'circle' | 'bordered';
  reportKopDividerStyle?: 'double' | 'single' | 'triple' | 'accent';
  reportCustomTitle?: string;
  reportThemeColor?: ThemeColor | 'classic_black';
  reportCustomHex?: string;
  reportBorderStyle?: ReportBorderStyle;
  customFrameConfig?: CustomPdfFrameConfig;
  savedCustomFrames?: CustomPdfFrameConfig[];
  reportHeaderStyle?: 'dual_logo' | 'left_logo' | 'centered' | 'split';
  reportFontStyle?: 'serif' | 'sans' | 'poppins' | 'classic' | 'modern';
  reportFontSize?: 'sm' | 'md' | 'lg';
  reportTableStyle?: 'tinted' | 'striped' | 'clean' | 'bold_grid' | 'bordered_bold';
  reportRowDensity?: 'tight' | 'compact' | 'normal' | 'relaxed';
  reportPaperSize?: 'A4' | 'F4' | 'Letter' | 'Legal';
  reportOrientation?: 'portrait' | 'landscape';
  reportMarginSize?: 'none' | 'narrow' | 'normal' | 'wide';
  reportPdfQuality?: 'standard' | 'high' | 'ultra';
  reportSinglePageFit?: boolean;
  reportWatermarkOpacity?: 'subtle' | 'medium' | 'strong';
  reportShowWatermark?: boolean;
  reportShowBismillah?: boolean;
  reportShowRank?: boolean;
  reportShowTahfidz?: boolean;
  reportShowStudentPhoto?: boolean;
  reportShowAttitude?: boolean;
  reportShowAttitudeSection?: boolean;
  reportShowEkskul?: boolean;
  reportShowAttendance?: boolean;
  reportShowAttendanceBox?: boolean;
  reportShowKkm?: boolean;
  reportShowPredicate?: boolean;
  reportShowTerbilang?: boolean;
  reportShowTeacherNotes?: boolean;
  reportShowParentSignature?: boolean;
  reportShowClassTeacherSignature?: boolean;
  reportShowHeadmasterSignature?: boolean;
  reportShowSeal?: boolean;
  reportSignatureHeight?: 'compact' | 'normal' | 'spacious';
  reportShowFooterMeta?: boolean;
}

export type ReportBorderStyle =
  | 'double'
  | 'triple_formal'
  | 'ornate'
  | 'islamic_arch'
  | 'pesantren_turats'
  | 'royal_gold_seal'
  | 'geometric_kufi'
  | 'corner_floral'
  | 'modern_accent'
  | 'vintage_scroll'
  | 'dashed_coupon'
  | 'dotted_frame'
  | 'shadow_box'
  | 'single'
  | 'minimal'
  | 'none'
  | 'custom';

export type FrameOuterLineStyle =
  | 'solid'
  | 'double'
  | 'dashed'
  | 'dotted'
  | 'groove'
  | 'ridge'
  | 'none';

export type FrameInnerLineStyle =
  | 'none'
  | 'solid'
  | 'double'
  | 'dashed'
  | 'dotted';

export type FrameCornerOrnament =
  | 'none'
  | 'islamic_star'
  | 'classic_flourish'
  | 'kufi_step'
  | 'diamond_seal'
  | 'floral_leaf'
  | 'double_bracket'
  | 'crescent_dome';

export type FrameEdgeAccent =
  | 'none'
  | 'top_bottom_rosette'
  | 'all_sides_diamond'
  | 'top_ribbon_bar'
  | 'dual_side_pillars';

export interface CustomPdfFrameConfig {
  id?: string;
  name?: string;
  outerLineStyle: FrameOuterLineStyle;
  outerWidth: number; // 1 to 8 px
  innerLineStyle: FrameInnerLineStyle;
  innerWidth: number; // 1 to 6 px
  innerGap: number; // 2 to 14 px
  cornerRadius: number; // 0, 4, 8, 12, 16, 20 px
  cornerOrnament: FrameCornerOrnament;
  cornerOrnamentSize: 'sm' | 'md' | 'lg';
  edgeAccent: FrameEdgeAccent;
  useThemeColor: boolean;
  primaryColor: string;
  secondaryColor: string;
  customFrameImageUrl?: string;
  customFrameImageOpacity?: number; // 10 to 100
  customFrameImageFit?: 'stretch' | 'contain';
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: 'Akademik' | 'Tahfidz' | 'Ujian' | 'Rapor' | 'Penting';
  priority: 'normal' | 'important' | 'urgent';
  date: string;
  author: string;
  isActive: boolean;
  isPinned: boolean;
}

export interface SiteSettings {
  foundationName?: string;
  appName: string;
  schoolName: string;
  subHeader: string;
  announcement: string;
  announcements?: AnnouncementItem[];
  enableTahfidz: boolean;
  enableBankSoal: boolean;
  themeAccent: 'emerald' | 'slate' | 'navy';
  schoolAddress?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  schoolNsmNpsn?: string;
  schoolWebsite?: string;
  headmasterName?: string;
  headmasterNip?: string;
  defaultIssuePlace?: string;
  watermarkText?: string;
  kkmDefault?: number;
  footerText?: string;
  customLogoUrl?: string;
  customRightLogoUrl?: string;
  reportCustomTitle?: string;
}

export interface ExtracurricularEntry {
  name: string;
  predicate: 'A' | 'B' | 'C';
  description: string;
}

export interface ReportCardRecord {
  id: string; // `${studentId}_${semester}_${academicYear}`
  studentId: number;
  classId: number;
  semester: 1 | 2;
  academicYear: string;
  status: 'draft' | 'ready' | 'published';
  attendance: {
    sick: number;
    permission: number;
    unexcused: number;
  };
  teacherNotes: string;
  tahfidzNotes?: string;
  spiritualAttitude: 'A' | 'B' | 'C';
  spiritualDescription: string;
  socialAttitude: 'A' | 'B' | 'C';
  socialDescription: string;
  extracurriculars: ExtracurricularEntry[];
  issuePlace: string;
  issueDate: string;
  headmasterName: string;
  headmasterNip?: string;
  classTeacherName: string;
  updatedAt: string;
}

export interface Subject {
  id: number;
  name: string;
  category: 'Diniyah' | 'Umum' | 'Bahasa' | 'Keterampilan';
}

export interface ClassRoom {
  id: number;
  name: string;
  teacher: string;
}

export interface Student {
  id: number;
  nis: string;
  name: string;
  classId: number;
  birthPlace: string;
  birthDate: string;
  guardian: string;
}

export interface Grade {
  id: number;
  studentId: number;
  subjectId: number;
  classId: number;
  semester: 1 | 2;
  score: number;
  testDate: string;
  type?: 'regular' | 'exam';
}

export interface TahfidzGrade {
  id: number;
  studentId: number;
  classId: number;
  semester: 1 | 2;
  tahfidzScore: number;
  tajweedScore: number;
  totalScore: number;
  gradeLetter: 'A' | 'B' | 'C' | 'D' | 'E';
  notes: string; // e.g. "Juz 30, An-Naba s.d An-Nas"
  testDate: string;
}

export interface ExamFile {
  id: number;
  subjectId: number;
  classId: number;
  title: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
}

export interface QuestionItem {
  id: number;
  text: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: 'A' | 'B' | 'C' | 'D';
}

export interface ExamQuestionsPackage {
  id: number;
  subjectId: number;
  classId: number;
  type: 'essay' | 'multiple_choice';
  createdAt: string;
  questions: QuestionItem[];
}

export type FormUasTab = 'grades' | 'exams' | 'reports';

export interface StudentAttendanceRecord {
  id: string; // e.g., `${studentId}_${date}`
  studentId: number;
  studentName: string;
  classId: number;
  date: string; // YYYY-MM-DD
  status: 'H' | 'S' | 'I' | 'A'; // Hadir, Sakit, Izin, Alpa
  notes?: string;
  recordedBy?: string;
  updatedAt?: string;
}

export interface TeacherAttendanceRecord {
  id: string; // e.g., `${teacherId}_${date}`
  teacherId: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  status: 'hadir' | 'izin' | 'sakit' | 'dinas_luar' | 'alpa';
  notes?: string;
  subjectTaught?: string;
  classRoom?: string;
  updatedAt?: string;
}

export interface TeachingAssignment {
  id: string;
  subjectId: number;
  subjectName: string;
  category: 'Diniyah' | 'Umum' | 'Bahasa' | 'Keterampilan';
  classId: number;
  className: string;
  teacherId?: string;
  teacherName: string;
  hoursPerWeek: number; // Jam Pelajaran (JP) per minggu
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Ahad';
  timeSlot: string; // e.g. "07:30 - 09:00"
  room?: string;
  referenceBook?: string; // Kitab / Buku rujukan
  targetCompetence?: string; // Target capaian pembelajaran
  updatedAt?: string;
}

