import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  getRadiusClass,
  resolveGradeThresholds,
  HERO_STYLES_CATALOG,
  getHeroStyleMeta,
  HeroStyleCategory,
  STATS_STYLES_CATALOG,
  getStatsStyleMeta,
  StatsStyleCategory,
} from '../utils/theme';
import {
  Users,
  Award,
  BookOpen,
  GraduationCap,
  Sparkles,
  BarChart3,
  Trophy,
  Filter,
  ArrowRight,
  PlusCircle,
  FileText,
  FileCheck2,
  Megaphone,
  Settings2,
  TrendingUp,
  Cpu,
  Star,
  CheckCircle2,
  Flame,
  Palette,
  Check,
  X,
  ChevronDown,
  Eye,
  EyeOff,
  Layers,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    isSuperAdmin: contextIsSuperAdmin,
    classes,
    students,
    subjects,
    grades,
    tahfidzGrades,
    setCurrentView,
    setManageTab,
    setSuperAdminFocusSection,
    academicYear,
    siteSettings,
    themeClasses,
    themeSettings,
    updateThemeSettings,
    isDeviceDarkMode,
    openSuperAdminAnnouncements,
  } = useApp();

  const isSuperAdmin = Boolean(
    contextIsSuperAdmin ||
      currentUser?.role === 'superadmin' ||
      currentUser?.username === 'superadmin'
  );
  const radius = getRadiusClass(themeSettings.borderRadius);

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [isHeroPickerOpen, setIsHeroPickerOpen] = useState<boolean>(false);
  const [pickerModeTab, setPickerModeTab] = useState<'hero' | 'stats'>('hero');
  const [heroPickerCategory, setHeroPickerCategory] = useState<'all' | HeroStyleCategory>('all');
  const [statsPickerCategory, setStatsPickerCategory] = useState<'all' | StatsStyleCategory>('all');

  // Filtered grades calculation
  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      const matchClass = selectedClassId ? g.classId === parseInt(selectedClassId, 10) : true;
      const matchSemester = selectedSemester ? g.semester === parseInt(selectedSemester, 10) : true;
      return matchClass && matchSemester;
    });
  }, [grades, selectedClassId, selectedSemester]);

  const activeThresholds = useMemo(
    () => resolveGradeThresholds(siteSettings.gradeThresholds),
    [siteSettings.gradeThresholds]
  );

  // General Statistics
  const stats = useMemo(() => {
    const totalStudents = selectedClassId
      ? students.filter((s) => s.classId === parseInt(selectedClassId, 10)).length
      : students.length;

    const totalGradesCount = filteredGrades.length;

    const totalScoreSum = filteredGrades.reduce((sum, g) => sum + g.score, 0);
    const overallAverage = totalGradesCount > 0 ? (totalScoreSum / totalGradesCount).toFixed(1) : '0.0';

    const gradeACount = filteredGrades.filter((g) => g.score >= activeThresholds.minA).length;
    const gradeBCount = filteredGrades.filter(
      (g) => g.score >= activeThresholds.minB && g.score < activeThresholds.minA
    ).length;
    const gradeCCount = filteredGrades.filter(
      (g) => g.score >= activeThresholds.minC && g.score < activeThresholds.minB
    ).length;
    const gradeDCount = filteredGrades.filter(
      (g) => g.score >= activeThresholds.minD && g.score < activeThresholds.minC
    ).length;
    const gradeECount = filteredGrades.filter((g) => g.score < activeThresholds.minD).length;

    const excellentCount = gradeACount + gradeBCount;
    const goodCount = gradeCCount + gradeDCount;
    const needsImprovementCount = gradeECount;

    return {
      totalStudents,
      totalGradesCount,
      overallAverage,
      gradeACount,
      gradeBCount,
      gradeCCount,
      gradeDCount,
      gradeECount,
      excellentCount,
      goodCount,
      needsImprovementCount,
    };
  }, [students, filteredGrades, selectedClassId, activeThresholds]);

  // Top performers per class
  const topGradesByClass = useMemo(() => {
    // Group grades by student
    const studentScores: Record<number, { scores: number[]; classId: number }> = {};
    filteredGrades.forEach((g) => {
      if (!studentScores[g.studentId]) {
        studentScores[g.studentId] = { scores: [], classId: g.classId };
      }
      studentScores[g.studentId].scores.push(g.score);
    });

    // Best student per class
    const classBests: Array<{
      classId: number;
      className: string;
      studentName: string;
      subjectCount: number;
      average: string;
    }> = [];

    const activeClasses = selectedClassId
      ? classes.filter((c) => c.id === parseInt(selectedClassId, 10))
      : classes;

    activeClasses.forEach((cls) => {
      let highestAvg = -1;
      let topStudentName = '';
      let topSubjectCount = 0;

      Object.entries(studentScores).forEach(([sIdStr, data]) => {
        if (data.classId === cls.id && data.scores.length > 0) {
          const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
          if (avg > highestAvg) {
            highestAvg = avg;
            const st = students.find((s) => s.id === parseInt(sIdStr, 10));
            topStudentName = st ? st.name : 'Siswa';
            topSubjectCount = data.scores.length;
          }
        }
      });

      if (highestAvg > 0) {
        classBests.push({
          classId: cls.id,
          className: cls.name,
          studentName: topStudentName,
          subjectCount: topSubjectCount,
          average: highestAvg.toFixed(1),
        });
      }
    });

    return classBests;
  }, [filteredGrades, classes, students, selectedClassId]);

  // Subject Averages
  const subjectAverages = useMemo(() => {
    const map: Record<number, { total: number; count: number; name: string }> = {};

    filteredGrades.forEach((g) => {
      if (!map[g.subjectId]) {
        const sub = subjects.find((s) => s.id === g.subjectId);
        map[g.subjectId] = {
          total: 0,
          count: 0,
          name: sub ? sub.name : `Mapel #${g.subjectId}`,
        };
      }
      map[g.subjectId].total += g.score;
      map[g.subjectId].count += 1;
    });

    return Object.values(map)
      .map((item) => ({
        name: item.name,
        count: item.count,
        average: (item.total / item.count).toFixed(1),
        avgNum: item.total / item.count,
      }))
      .sort((a, b) => b.avgNum - a.avgNum);
  }, [filteredGrades, subjects]);

  // Overall Top 5 Students
  const topStudents = useMemo(() => {
    const studentAgg: Record<number, { scores: number[]; studentId: number; classId: number }> = {};
    filteredGrades.forEach((g) => {
      if (!studentAgg[g.studentId]) {
        studentAgg[g.studentId] = { scores: [], studentId: g.studentId, classId: g.classId };
      }
      studentAgg[g.studentId].scores.push(g.score);
    });

    return Object.values(studentAgg)
      .map((item) => {
        const st = students.find((s) => s.id === item.studentId);
        const cls = classes.find((c) => c.id === item.classId);
        const avg = item.scores.reduce((a, b) => a + b, 0) / item.scores.length;
        return {
          studentName: st ? st.name : 'Siswa',
          className: cls ? cls.name : '-',
          subjectCount: item.scores.length,
          average: avg.toFixed(1),
          avgNum: avg,
        };
      })
      .sort((a, b) => b.avgNum - a.avgNum)
      .slice(0, 5);
  }, [filteredGrades, students, classes]);

  return (
    <div className="space-y-6 pb-20">
      {/* Hero Welcome Banner */}
      {themeSettings.showHeroBanner !== false && (() => {
        const bannerStyle = (themeSettings.heroBannerStyle || 'gradient_brand') as string;
        const activeHeroMeta = getHeroStyleMeta(bannerStyle as any);
        const isLightBanner = !isDeviceDarkMode && activeHeroMeta.isLight;

        const bannerPadding =
          themeSettings.heroBannerHeight === 'compact'
            ? 'p-3.5 sm:p-5'
            : themeSettings.heroBannerHeight === 'spacious'
            ? 'p-5 sm:p-10 lg:p-11'
            : 'p-4 sm:p-7 lg:p-8';

        let bannerSurfaceClass = '';
        let bannerExtraStyle: React.CSSProperties | undefined = undefined;

        switch (bannerStyle) {
          case 'dark_elegant':
            bannerSurfaceClass =
              'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-md ring-1 ring-inset ring-white/10';
            break;
          case 'light_clean':
            bannerSurfaceClass =
              'bg-gradient-to-br from-white via-white to-slate-50/90 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white border-2 border-slate-200/90 dark:border-slate-800 shadow-xs';
            break;
          case 'glass_modern':
            bannerSurfaceClass = `bg-white/88 dark:bg-slate-900/88 backdrop-blur-xl text-slate-900 dark:text-white border ${themeClasses.primaryBorder} shadow-sm ring-1 ring-inset ring-white/50 dark:ring-white/10`;
            break;
          case 'split_accent':
            bannerSurfaceClass =
              'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 border-l-[6px] sm:border-l-[10px] shadow-xs';
            bannerExtraStyle = {
              borderLeftColor: 'var(--brand-primary, #047857)',
              backgroundImage: isDeviceDarkMode
                ? undefined
                : 'radial-gradient(circle at 96% 8%, var(--brand-primary-light, rgba(16,185,129,0.12)) 0%, transparent 45%)',
            };
            break;
          case 'islamic_arch':
            bannerSurfaceClass =
              'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white border border-emerald-500/35 shadow-md ring-1 ring-inset ring-emerald-400/15';
            break;
          case 'aurora_mesh':
            bannerSurfaceClass =
              'bg-slate-950 text-white border border-indigo-500/35 shadow-md ring-1 ring-inset ring-indigo-400/15';
            bannerExtraStyle = {
              backgroundImage:
                'radial-gradient(ellipse at 12% 15%, var(--brand-primary, #047857) 0%, transparent 58%), radial-gradient(ellipse at 88% 25%, #6366f1 0%, transparent 55%), radial-gradient(ellipse at 50% 95%, #06b6d4 0%, transparent 58%)',
            };
            break;
          case 'geometric_mosaic':
            bannerSurfaceClass =
              'bg-gradient-to-br from-slate-900 via-slate-900 to-stone-900 text-white border border-amber-500/40 shadow-md ring-1 ring-inset ring-amber-400/20';
            break;
          case 'editorial_card':
            bannerSurfaceClass =
              'bg-[#fcfcf9] dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-800 dark:border-slate-600 shadow-xs';
            break;
          case 'compact_ribbon':
            bannerSurfaceClass =
              'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700/90 shadow-xs ring-1 ring-inset ring-white/5';
            break;
          case 'cyber_academic':
          case 'neon_synth_grid' as any:
            bannerSurfaceClass =
              'bg-[#070c18] text-white border border-cyan-500/45 shadow-[0_0_24px_rgba(6,182,212,0.16)] ring-1 ring-inset ring-cyan-400/20';
            break;
          case 'sunset_warmth':
          case 'desert_dunes_gold' as any:
            bannerSurfaceClass =
              'bg-gradient-to-br from-amber-700 via-orange-800 to-amber-950 text-white border border-amber-400/35 shadow-md ring-1 ring-inset ring-amber-300/15';
            break;
          case 'royal_emerald':
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#042f2e] text-white border border-amber-400/55 shadow-lg ring-1 ring-inset ring-amber-300/30';
            bannerExtraStyle = {
              boxShadow:
                '0 16px 24px -6px rgba(6, 78, 59, 0.35), 0 6px 10px -4px rgba(245, 158, 11, 0.16)',
            };
            break;
          case 'islamic_calligraphy':
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#062c20] via-[#0f4d3d] to-[#0b332b] text-white border border-emerald-400/40 shadow-md ring-1 ring-inset ring-emerald-300/15';
            break;
          case 'modern_stacked':
            bannerSurfaceClass =
              'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-t-4 border-t-indigo-500 border-x border-b border-slate-800 shadow-md';
            break;
          case 'pastel_mint':
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#ecfdf5] via-[#f0fdf4] to-[#e6fffa] dark:from-slate-900 dark:via-emerald-950/45 dark:to-slate-900 text-slate-900 dark:text-white border border-emerald-300/80 dark:border-emerald-800/60 shadow-xs';
            break;
          case 'cosmic_galaxy':
            bannerSurfaceClass =
              'bg-[#090d16] text-white border border-purple-500/45 shadow-lg ring-1 ring-inset ring-purple-400/25';
            bannerExtraStyle = {
              backgroundImage:
                'radial-gradient(circle at 18% 18%, rgba(168, 85, 247, 0.38) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(59, 130, 246, 0.28) 0%, transparent 45%), linear-gradient(135deg, #090d16 0%, #1e1136 52%, #0f172a 100%)',
            };
            break;
          case 'vintage_parchment':
            bannerSurfaceClass =
              'bg-[#fdfbf7] dark:bg-slate-900 text-[#292524] dark:text-white border-2 border-[#d6c7a1] dark:border-stone-700 shadow-xs';
            bannerExtraStyle = {
              backgroundImage: 'radial-gradient(#d6c7a1 0.75px, transparent 0.75px)',
              backgroundSize: '16px 16px',
            };
            break;
          case 'ocean_breeze':
          case 'tropical_lagoon' as any:
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#0c4a6e] via-[#0284c7] to-[#0d9488] text-white border border-cyan-300/35 shadow-md ring-1 ring-inset ring-white/15';
            break;
          case 'crimson_luxury':
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#4c0519] via-[#881337] to-[#3b0764] text-white border border-rose-400/40 shadow-lg ring-1 ring-inset ring-rose-300/20';
            break;
          case 'nabawi_medina':
          case 'nabawi_green_dome' as any:
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#022c22] via-[#047857] to-[#065f46] text-white border-2 border-amber-300/60 shadow-xl ring-1 ring-inset ring-amber-200/30';
            bannerExtraStyle = {
              boxShadow:
                '0 16px 26px -6px rgba(4, 120, 87, 0.45), 0 6px 12px -4px rgba(251, 191, 36, 0.25)',
            };
            break;
          case 'kaaba_kiswah':
          case 'kaaba_gold_kiswah' as any:
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#09090b] via-[#18181b] to-[#27272a] text-[#fef3c7] border-2 border-amber-500/80 shadow-2xl ring-1 ring-inset ring-amber-400/40';
            bannerExtraStyle = {
              boxShadow:
                '0 20px 30px -10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(245, 158, 11, 0.2)',
            };
            break;
          case 'andalusia_alhambra':
          case 'andalusia_courtyard' as any:
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#431407] via-[#7c2d12] to-[#451a03] text-white border-2 border-amber-400/60 shadow-xl ring-1 ring-inset ring-amber-300/25';
            bannerExtraStyle = {
              boxShadow: '0 16px 24px -6px rgba(124, 45, 18, 0.45)',
            };
            break;
          case 'ottoman_iznik':
          case 'ottoman_blue_iznik' as any:
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#172554] via-[#0369a1] to-[#0f766e] text-white border-2 border-cyan-300/50 shadow-xl ring-1 ring-inset ring-cyan-200/25';
            break;
          case 'moroccan_zellige':
          case 'moroccan_terracotta' as any:
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#042f2e] via-[#115e59] to-[#1e3a8a] text-white border-2 border-teal-300/50 shadow-xl ring-1 ring-inset ring-teal-200/25';
            break;
          case 'nusantara_batik':
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#27170e] via-[#452715] to-[#143627] text-amber-100 border-2 border-amber-600/60 shadow-xl ring-1 ring-inset ring-amber-400/30';
            bannerExtraStyle = {
              boxShadow: '0 16px 24px -6px rgba(69, 39, 21, 0.5)',
            };
            break;
          case 'golden_minaret':
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#1e1b4b] via-[#4c1d95] to-[#b45309] text-white border-2 border-amber-400/50 shadow-xl ring-1 ring-inset ring-amber-300/25';
            break;
          case 'ivory_gold_leaf':
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#fffdf7] via-[#fef9e7] to-[#fef3c7] dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 text-stone-900 dark:text-stone-100 border-2 border-amber-500/70 dark:border-amber-700/80 shadow-xs';
            break;
          case 'sakura_dawn':
          case 'sakura_academic' as any:
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#fff1f2] via-[#ffe4e6] to-[#fef3c7] dark:from-slate-900 dark:via-rose-950/50 dark:to-slate-950 text-slate-900 dark:text-white border-2 border-rose-300/90 dark:border-rose-800/70 shadow-xs';
            break;
          case 'nordic_frost':
          case 'nordic_frost_clean' as any:
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] dark:from-slate-900 dark:via-slate-900 dark:to-sky-950/60 text-slate-900 dark:text-white border-2 border-sky-300/80 dark:border-sky-800/70 shadow-xs';
            break;
          case 'monochrome_swiss':
            bannerSurfaceClass =
              'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-900 dark:border-white shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#f8fafc]';
            break;
          case 'velvet_sapphire':
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#0a192f] via-[#172a45] to-[#1e3a8a] text-white border-2 border-blue-400/50 shadow-xl ring-1 ring-inset ring-blue-300/25';
            bannerExtraStyle = {
              boxShadow: '0 16px 24px -6px rgba(30, 58, 138, 0.45)',
            };
            break;
          case 'forest_canopy':
          case 'forest_botanical' as any:
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#052e16] via-[#14532d] to-[#166534] text-white border-2 border-green-400/50 shadow-xl ring-1 ring-inset ring-green-300/25';
            bannerExtraStyle = {
              boxShadow: '0 16px 24px -6px rgba(22, 101, 52, 0.45)',
            };
            break;
          case 'royal_amethyst':
          case 'velvet_amethyst' as any:
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#2e1065] via-[#581c87] to-[#3b0764] text-white border-2 border-yellow-400/60 shadow-xl ring-1 ring-inset ring-yellow-300/30';
            bannerExtraStyle = {
              boxShadow:
                '0 16px 24px -6px rgba(88, 28, 135, 0.5), 0 4px 10px rgba(250, 204, 21, 0.2)',
            };
            break;
          case 'lava_obsidian':
          case 'copper_industrial' as any:
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#0c0a09] via-[#1c1917] to-[#431407] text-white border-2 border-orange-500/60 shadow-xl ring-1 ring-inset ring-orange-400/30';
            bannerExtraStyle = {
              backgroundImage:
                'radial-gradient(circle at 85% 20%, rgba(249,115,22,0.35) 0%, transparent 50%), linear-gradient(135deg, #0c0a09 0%, #1c1917 58%, #431407 100%)',
            };
            break;
          case 'holographic_pearl':
          case 'pearl_iridescent' as any:
          case 'lavender_mist_soft' as any:
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#e0e7ff] via-[#fae8ff] to-[#ccfbf1] dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900 text-slate-900 dark:text-white border-2 border-purple-300/90 dark:border-purple-800/60 shadow-xs';
            bannerExtraStyle = {
              backgroundImage:
                'linear-gradient(135deg, #e0e7ff 0%, #fae8ff 48%, #ccfbf1 100%)',
            };
            break;
          case 'gradient_brand':
          default:
            bannerSurfaceClass = `bg-gradient-to-br ${themeClasses.gradientHeader} text-white shadow-sm ring-1 ring-inset ring-white/15`;
            break;
        }

        return (
          <div
            style={bannerExtraStyle}
            className={`relative overflow-hidden transition-all duration-300 ${radius.card} ${bannerSurfaceClass} ${bannerPadding}`}
          >
            {/* Top Crown / Shimmer Bars for Specific Styles */}
            {(bannerStyle === 'royal_emerald' ||
              bannerStyle === 'nabawi_medina' ||
              bannerStyle === 'nabawi_green_dome' ||
              bannerStyle === 'golden_minaret' ||
              bannerStyle === 'royal_amethyst' ||
              bannerStyle === 'velvet_amethyst' ||
              bannerStyle === 'nusantara_batik') && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/90 to-transparent pointer-events-none" />
            )}
            {(bannerStyle === 'kaaba_kiswah' || bannerStyle === 'kaaba_gold_kiswah') && (
              <div className="absolute top-2.5 left-0 right-0 h-2 bg-gradient-to-r from-amber-600/40 via-amber-400/90 to-amber-600/40 border-y border-amber-300/60 pointer-events-none" />
            )}
            {bannerStyle === 'editorial_card' && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900 dark:bg-slate-300 pointer-events-none" />
            )}
            {(bannerStyle === 'vintage_parchment' ||
              bannerStyle === 'andalusia_alhambra' ||
              bannerStyle === 'andalusia_courtyard') && (
              <div className="absolute inset-1.5 sm:inset-2 rounded-[inherit] border border-[#c2a878]/45 dark:border-stone-700/60 pointer-events-none" />
            )}

            {/* Style-specific Responsive Decorative Overlays (Visible on Mobile & Desktop) */}
            {(bannerStyle === 'islamic_arch' ||
              bannerStyle === 'nabawi_medina' ||
              bannerStyle === 'nabawi_green_dome' ||
              bannerStyle === 'andalusia_alhambra' ||
              bannerStyle === 'andalusia_courtyard' ||
              bannerStyle === 'golden_minaret') && (
              <div className="absolute -right-6 -top-2 sm:right-0 sm:top-0 sm:bottom-0 w-44 h-44 sm:w-64 md:w-80 sm:h-full pointer-events-none opacity-[0.16] sm:opacity-22">
                <svg viewBox="0 0 200 200" className="w-full h-full text-current fill-current" preserveAspectRatio="none">
                  <path d="M100 10 C 120 40, 160 70, 190 110 C 195 130, 200 160, 200 200 L 0 200 C 0 160, 5 130, 10 110 C 40 70, 80 40, 100 10 Z" fill="none" stroke="currentColor" strokeWidth="3" />
                  <circle cx="100" cy="80" r="18" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M100 45 L 100 62 M 100 98 L 100 115" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            )}

            {(bannerStyle === 'royal_emerald' ||
              bannerStyle === 'ottoman_iznik' ||
              bannerStyle === 'ottoman_blue_iznik' ||
              bannerStyle === 'moroccan_zellige' ||
              bannerStyle === 'moroccan_terracotta' ||
              bannerStyle === 'nusantara_batik') && (
              <div className="absolute -right-6 -top-6 sm:right-0 sm:top-0 sm:bottom-0 w-44 h-44 sm:w-64 md:w-84 sm:h-full pointer-events-none opacity-20 sm:opacity-25">
                <svg viewBox="0 0 200 200" className="w-full h-full text-amber-300 fill-current" preserveAspectRatio="none">
                  <polygon points="100,10 125,75 190,75 138,115 158,180 100,140 42,180 62,115 10,75 75,75" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                </svg>
              </div>
            )}

            {(bannerStyle === 'islamic_calligraphy' ||
              bannerStyle === 'kaaba_kiswah' ||
              bannerStyle === 'kaaba_gold_kiswah' ||
              bannerStyle === 'nabawi_medina' ||
              bannerStyle === 'nabawi_green_dome') && (
              <div className="absolute right-3 top-10 sm:right-4 sm:top-1/2 sm:-translate-y-1/2 pointer-events-none opacity-[0.18] sm:opacity-25 text-right sm:pr-6">
                <span
                  className={`font-arabic text-4xl sm:text-6xl ${
                    bannerStyle === 'kaaba_kiswah' || bannerStyle === 'kaaba_gold_kiswah'
                      ? 'text-amber-400'
                      : 'text-emerald-300'
                  } block select-none leading-none`}
                >
                  ﷽
                </span>
                <span className="hidden sm:block text-[11px] font-medium text-amber-200/90 mt-1.5 tracking-widest uppercase">
                  Pendidikan Berkualitas & Beradab
                </span>
              </div>
            )}

            {bannerStyle === 'geometric_mosaic' && (
              <div className="absolute -right-5 -top-5 sm:right-0 sm:top-0 sm:bottom-0 w-40 h-40 sm:w-60 md:w-72 sm:h-full pointer-events-none opacity-15 sm:opacity-20">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-300 fill-current">
                  <polygon points="50,5 64,18 82,18 82,36 95,50 82,64 82,82 64,82 50,95 36,82 18,82 18,64 5,50 18,36 18,18 36,18" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="50" cy="50" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            )}

            {(bannerStyle === 'cyber_academic' || (bannerStyle as any) === 'neon_synth_grid') && (
              <>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d415_1px,transparent_1px),linear-gradient(to_bottom,#06b6d415_1px,transparent_1px)] bg-[size:22px_22px] pointer-events-none" />
                <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />
              </>
            )}

            {bannerStyle === 'cosmic_galaxy' && (
              <div className="absolute right-5 top-4 sm:right-8 sm:top-6 pointer-events-none opacity-45">
                <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_12px_#fff]" />
                <div className="w-1.5 h-1.5 rounded-full bg-purple-300 shadow-[0_0_8px_#c084fc] ml-10 sm:ml-12 mt-3 sm:mt-4" />
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9] ml-4 sm:ml-6 mt-5 sm:mt-8" />
              </div>
            )}

            {/* Subtle Standard Background Pattern Backdrop (Responsive for Mobile & Desktop) */}
            {bannerStyle !== 'islamic_arch' &&
              bannerStyle !== 'geometric_mosaic' &&
              bannerStyle !== 'royal_emerald' &&
              bannerStyle !== 'islamic_calligraphy' &&
              bannerStyle !== 'nabawi_medina' &&
              bannerStyle !== 'nabawi_green_dome' &&
              bannerStyle !== 'kaaba_kiswah' &&
              bannerStyle !== 'kaaba_gold_kiswah' &&
              bannerStyle !== 'cyber_academic' &&
              bannerStyle !== 'cosmic_galaxy' &&
              bannerStyle !== 'andalusia_alhambra' &&
              bannerStyle !== 'ottoman_iznik' &&
              bannerStyle !== 'moroccan_zellige' &&
              bannerStyle !== 'nusantara_batik' &&
              bannerStyle !== 'golden_minaret' &&
              bannerStyle !== 'lava_obsidian' && (
                <div
                  className={`absolute right-0 top-0 bottom-0 w-3/5 sm:w-1/2 ${
                    isLightBanner ? 'opacity-[0.05] sm:opacity-[0.07]' : 'opacity-10 sm:opacity-15'
                  } pointer-events-none`}
                  style={{
                    maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 5%, transparent 95%)',
                    WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 5%, transparent 95%)',
                  }}
                >
                  <img
                    src="/src/assets/images/banner_academic_pattern_1791464114520.jpg"
                    alt="Islamic pattern"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
              <div className="max-w-2xl min-w-0">
                {/* Top Eyebrow Bar: Institution Identity + Quick Mobile Hero Style Trigger */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div
                    className={`inline-flex items-center gap-1.5 min-w-0 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider border ${
                      isLightBanner
                        ? `${themeClasses.primaryLightBg} ${themeClasses.primaryText} ${themeClasses.primaryBorder}`
                        : 'bg-black/20 text-white/95 border-white/15 backdrop-blur-xs'
                    }`}
                  >
                    {bannerStyle === 'cyber_academic' ? (
                      <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    ) : bannerStyle === 'geometric_mosaic' ||
                      bannerStyle === 'royal_emerald' ||
                      bannerStyle === 'nabawi_medina' ||
                      bannerStyle === 'kaaba_kiswah' ||
                      bannerStyle === 'golden_minaret' ||
                      bannerStyle === 'nusantara_batik' ? (
                      <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-current opacity-90 shrink-0" />
                    )}
                    <span className="truncate">
                      {siteSettings.foundationName ? `${siteSettings.foundationName} · ` : ''}
                      {siteSettings.schoolName}
                    </span>
                    {bannerStyle === 'compact_ribbon' && (
                      <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500 text-white shrink-0">
                        Resmi
                      </span>
                    )}
                  </div>

                  {/* Quick Hero Style Selector Trigger Pill (Super Admin Only) */}
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setPickerModeTab('hero');
                        setIsHeroPickerOpen(true);
                      }}
                      title="Ubah & Pratinjau Gaya Hero Banner (Super Admin)"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 ${
                        isLightBanner
                          ? 'bg-slate-900/5 hover:bg-slate-900/10 text-slate-800 dark:text-slate-100 border border-slate-300/80 dark:border-slate-700'
                          : 'bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-xs'
                      }`}
                    >
                      <Palette className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[84px] sm:max-w-[130px]">
                        {activeHeroMeta.shortName}
                      </span>
                      <ChevronDown className="w-3 h-3 shrink-0 opacity-75" />
                    </button>
                  )}
                </div>

                <h1
                  className={`text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-snug ${
                    isLightBanner ? 'text-slate-900 dark:text-white' : 'text-white'
                  } ${bannerStyle === 'editorial_card' ? 'font-serif-report' : ''} mb-1.5 sm:mb-2`}
                >
                  Selamat Datang, {currentUser?.fullName || 'Ustadz'}!
                </h1>
                <p
                  className={`${
                    isLightBanner ? 'text-slate-600 dark:text-slate-300' : 'text-slate-200/95'
                  } text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 line-clamp-3 sm:line-clamp-none`}
                >
                  {siteSettings.announcement ||
                    'Kelola nilai rapor, catatan hafalan tahfidz, dan bank soal ujian santri dengan mudah, rapi, dan terstruktur.'}
                </p>

                {/* Mobile-Refined Action Buttons Grid */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setCurrentView('grades')}
                    className={
                      isLightBanner
                        ? `btn-precision w-full sm:w-auto ${radius.button} ${themeClasses.primary} ${themeClasses.primaryHover} text-white shadow-2xs`
                        : `btn-precision w-full sm:w-auto ${radius.button} bg-white text-slate-900 hover:bg-slate-100 shadow-2xs`
                    }
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-current shrink-0" />
                    <span>Input Nilai</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('reports')}
                    className={
                      isLightBanner
                        ? `btn-precision w-full sm:w-auto ${radius.button} bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200`
                        : `btn-precision w-full sm:w-auto ${radius.button} bg-white/15 hover:bg-white/25 text-white border border-white/20`
                    }
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-current shrink-0" />
                    <span>Cetak Rapor</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('exams')}
                    className={
                      isLightBanner
                        ? `btn-precision w-full sm:w-auto ${radius.button} bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200`
                        : `btn-precision w-full sm:w-auto ${radius.button} bg-white/10 hover:bg-white/20 text-white border border-white/15`
                    }
                  >
                    <FileText className="w-3.5 h-3.5 text-current shrink-0" />
                    <span>Bank Soal</span>
                  </button>
                  {isSuperAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setPickerModeTab('hero');
                          setIsHeroPickerOpen(true);
                        }}
                        className={
                          isLightBanner
                            ? `btn-precision w-full sm:w-auto ${radius.button} bg-white hover:bg-slate-50 text-slate-800 border border-slate-200`
                            : `btn-precision w-full sm:w-auto ${radius.button} bg-white/10 hover:bg-white/20 text-white border border-white/15`
                        }
                      >
                        <Palette className="w-3.5 h-3.5 text-current shrink-0" />
                        <span>Tema Hero & Stat</span>
                      </button>
                      <button
                        onClick={openSuperAdminAnnouncements}
                        className={
                          isLightBanner
                            ? `btn-precision w-full sm:w-auto ${radius.button} ${themeClasses.primaryLightBg} ${themeClasses.primaryText} border ${themeClasses.primaryBorder}`
                            : `btn-precision w-full sm:w-auto ${radius.button} bg-black/25 hover:bg-black/35 text-white border border-white/20`
                        }
                      >
                        <Megaphone className="w-3.5 h-3.5 text-current shrink-0" />
                        <span>Pengumuman</span>
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView('manage');
                          setManageTab('superadmin');
                          setSuperAdminFocusSection('web_theme');
                        }}
                        className={
                          isLightBanner
                            ? `btn-precision w-full sm:w-auto ${radius.button} bg-slate-800 hover:bg-slate-900 text-white`
                            : `btn-precision w-full sm:w-auto ${radius.button} bg-black/25 hover:bg-black/35 text-white border border-white/20`
                        }
                      >
                        <Settings2 className="w-3.5 h-3.5 text-current shrink-0" />
                        <span>Super Admin</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Hero Summary Box: Compact 4-Column Horizontal Bento Strip on Mobile, 2x2 Grid on Desktop */}
              {themeSettings.showHeroStats !== false && (
                <div
                  className={`grid grid-cols-4 sm:grid-cols-2 gap-1.5 sm:gap-2.5 lg:w-76 shrink-0 p-2 sm:p-3.5 rounded-xl border ${
                    isLightBanner
                      ? 'bg-slate-50/95 dark:bg-slate-800/80 border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white'
                      : 'bg-black/25 backdrop-blur-md border-white/15 text-white'
                  }`}
                >
                  <div
                    className={`p-2 sm:p-2.5 rounded-lg min-w-0 ${
                      isLightBanner
                        ? 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700'
                        : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold block truncate ${
                        isLightBanner ? 'text-slate-500 dark:text-slate-400' : 'text-white/70'
                      }`}
                    >
                      <span className="sm:hidden">T.Ajaran</span>
                      <span className="hidden sm:inline">Tahun Ajaran</span>
                    </span>
                    <span className="text-[11px] sm:text-sm font-extrabold tabular-nums block truncate">
                      {academicYear}
                    </span>
                  </div>
                  <div
                    className={`p-2 sm:p-2.5 rounded-lg min-w-0 ${
                      isLightBanner
                        ? 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700'
                        : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold block truncate ${
                        isLightBanner ? 'text-slate-500 dark:text-slate-400' : 'text-white/70'
                      }`}
                    >
                      <span className="sm:hidden">Kelas</span>
                      <span className="hidden sm:inline">Kelas Aktif</span>
                    </span>
                    <span className="text-[11px] sm:text-sm font-extrabold tabular-nums block truncate">
                      {classes.length} Rombel
                    </span>
                  </div>
                  <div
                    className={`p-2 sm:p-2.5 rounded-lg min-w-0 ${
                      isLightBanner
                        ? 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700'
                        : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold block truncate ${
                        isLightBanner ? 'text-slate-500 dark:text-slate-400' : 'text-white/70'
                      }`}
                    >
                      <span className="sm:hidden">Mapel</span>
                      <span className="hidden sm:inline">Mata Pelajaran</span>
                    </span>
                    <span className="text-[11px] sm:text-sm font-extrabold tabular-nums block truncate">
                      {subjects.length} Mapel
                    </span>
                  </div>
                  <div
                    className={`p-2 sm:p-2.5 rounded-lg min-w-0 ${
                      isLightBanner
                        ? 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700'
                        : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold block truncate ${
                        isLightBanner ? 'text-slate-500 dark:text-slate-400' : 'text-white/70'
                      }`}
                    >
                      <span className="sm:hidden">KKM</span>
                      <span className="hidden sm:inline">Standar KKM</span>
                    </span>
                    <span className="text-[11px] sm:text-sm font-extrabold tabular-nums block truncate">
                      {siteSettings.kkmDefault ?? 70} Poin
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Mobile-First Interactive Hero & Statistik Style Studio (Super Admin Only) */}
      {isSuperAdmin && isHeroPickerOpen && (() => {
        const activeStyleId = themeSettings.heroBannerStyle || 'gradient_brand';
        const activeMeta = getHeroStyleMeta(activeStyleId);
        const activeStatsId = themeSettings.statsCardStyle || 'modern_elevated';
        const activeStatsMeta = getStatsStyleMeta(activeStatsId);

        const filteredHeroStyles = HERO_STYLES_CATALOG.filter((item) =>
          heroPickerCategory === 'all' ? true : item.category === heroPickerCategory
        );

        const filteredStatsStyles = STATS_STYLES_CATALOG.filter((item) =>
          statsPickerCategory === 'all' ? true : item.category === statsPickerCategory
        );

        const heroCategoryTabs: Array<{ id: 'all' | HeroStyleCategory; label: string; count: number }> = [
          { id: 'all', label: 'Semua Hero', count: HERO_STYLES_CATALOG.length },
          {
            id: 'islami',
            label: 'Islami & Pesantren',
            count: HERO_STYLES_CATALOG.filter((i) => i.category === 'islami').length,
          },
          {
            id: 'modern',
            label: 'Modern & Kaca',
            count: HERO_STYLES_CATALOG.filter((i) => i.category === 'modern').length,
          },
          {
            id: 'spektakuler',
            label: 'Spektakuler',
            count: HERO_STYLES_CATALOG.filter((i) => i.category === 'spektakuler').length,
          },
          {
            id: 'terang',
            label: 'Terang & Klasik',
            count: HERO_STYLES_CATALOG.filter((i) => i.category === 'terang').length,
          },
        ];

        const statsCategoryTabs: Array<{ id: 'all' | StatsStyleCategory; label: string; count: number }> = [
          { id: 'all', label: 'Semua Statistik', count: STATS_STYLES_CATALOG.length },
          {
            id: 'modern',
            label: 'Modern & Bersih',
            count: STATS_STYLES_CATALOG.filter((i) => i.category === 'modern').length,
          },
          {
            id: 'islami',
            label: 'Islami & Klasik',
            count: STATS_STYLES_CATALOG.filter((i) => i.category === 'islami').length,
          },
          {
            id: 'eksklusif',
            label: 'Eksklusif & Spektakuler',
            count: STATS_STYLES_CATALOG.filter((i) => i.category === 'eksklusif').length,
          },
          {
            id: 'kompak',
            label: 'Kompak & Minimalis',
            count: STATS_STYLES_CATALOG.filter((i) => i.category === 'kompak').length,
          },
        ];

        return (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn"
            onClick={() => setIsHeroPickerOpen(false)}
          >
            <div
              className="w-full sm:max-w-3xl max-h-[90vh] sm:max-h-[86vh] bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Drag Handle Indicator */}
              <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
                <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>

              {/* Modal Header */}
              <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl ${themeClasses.primary} text-white flex items-center justify-center shadow-2xs shrink-0`}
                  >
                    <Palette className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                        Studio Tema Hero & Statistik
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                        {HERO_STYLES_CATALOG.length + STATS_STYLES_CATALOG.length} Tema
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Hero: <strong className="text-slate-800 dark:text-slate-200">{activeMeta.shortName}</strong> · Statistik: <strong className="text-slate-800 dark:text-slate-200">{activeStatsMeta.shortName}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHeroPickerOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dual Mode Switcher: Hero Banner (36) vs Kartu Statistik (30) */}
              <div className="px-4 pt-2.5 pb-2 sm:px-5 bg-slate-100/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/75 dark:bg-slate-800/90 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPickerModeTab('hero')}
                    className={`py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      pickerModeTab === 'hero'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">Tema Hero ({HERO_STYLES_CATALOG.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerModeTab('stats')}
                    className={`py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      pickerModeTab === 'stats'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate">Tema Statistik ({STATS_STYLES_CATALOG.length})</span>
                  </button>
                </div>
              </div>

              {pickerModeTab === 'hero' ? (
                <>
                  {/* Quick Controls Strip for Hero (Height + Stats Toggle + Category Pills) */}
                  <div className="px-4 py-2.5 sm:px-5 bg-slate-50/90 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800 space-y-2.5 shrink-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mr-1">
                          Ukuran:
                        </span>
                        {(
                          [
                            { id: 'compact', label: 'Ringkas' },
                            { id: 'standard', label: 'Standar' },
                            { id: 'spacious', label: 'Megah' },
                          ] as const
                        ).map((h) => {
                          const activeH = (themeSettings.heroBannerHeight || 'standard') === h.id;
                          return (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() =>
                                updateThemeSettings({ heroBannerHeight: h.id }, { silent: true })
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                activeH
                                  ? `${themeClasses.primary} text-white shadow-2xs`
                                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {h.label}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          updateThemeSettings(
                            { showHeroStats: themeSettings.showHeroStats === false },
                            { silent: true }
                          )
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                          themeSettings.showHeroStats !== false
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {themeSettings.showHeroStats !== false ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Info Ringkasan: Tampil</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Info Ringkasan: Sembunyi</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Horizontal Scrollable Category Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                      {heroCategoryTabs.map((tab) => {
                        const active = heroPickerCategory === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setHeroPickerCategory(tab.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                              active
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span>{tab.label}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                                active
                                  ? 'bg-white/20 dark:bg-slate-900/15 text-current'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                              }`}
                            >
                              {tab.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Scrollable 2-Column Mobile Visual Swatch Grid for Hero */}
                  <div className="p-3.5 sm:p-5 overflow-y-auto flex-1">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                      {filteredHeroStyles.map((item) => {
                        const isSelected = activeStyleId === item.id;
                        const textOnPreview = item.isLight ? 'text-slate-900' : 'text-white';
                        const subTextOnPreview = item.isLight ? 'text-slate-600' : 'text-white/75';

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              updateThemeSettings({ heroBannerStyle: item.id }, { silent: false });
                            }}
                            className={`group rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer active:scale-[0.98] ${
                              isSelected
                                ? 'border-brand-custom ring-2 ring-brand-custom/30 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-sm'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            {/* Live Miniature Hero Preview Header */}
                            <div
                              className="h-16 sm:h-18 w-full p-2.5 flex flex-col justify-between relative overflow-hidden border-b"
                              style={{
                                background: item.previewBg,
                                borderColor: item.previewBorder,
                              }}
                            >
                              <div
                                className="absolute -right-3 -bottom-3 w-12 h-12 rounded-full opacity-25 pointer-events-none"
                                style={{ backgroundColor: item.previewAccent }}
                              />
                              {(item.id === 'islamic_calligraphy' || (item.id as string) === 'kaaba_gold_kiswah') && (
                                <span className="absolute right-2 bottom-1 font-arabic text-lg text-amber-300/70 select-none pointer-events-none">
                                  ﷽
                                </span>
                              )}
                              {(item.id === 'royal_emerald' ||
                                item.id === 'geometric_mosaic' ||
                                (item.id as string) === 'nabawi_green_dome') && (
                                <Star className="absolute right-2 bottom-1.5 w-4 h-4 text-amber-300/60 pointer-events-none" />
                              )}
                              {(item.id === 'cyber_academic' || (item.id as string) === 'neon_synth_grid') && (
                                <Cpu className="absolute right-2 bottom-1.5 w-4 h-4 text-cyan-300/60 pointer-events-none" />
                              )}

                              <div className="flex items-center justify-between gap-1 relative z-10">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                                    item.isLight
                                      ? 'bg-slate-900/10 text-slate-800'
                                      : 'bg-black/30 text-white/95 border border-white/15'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                                {isSelected && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-black uppercase shadow-2xs">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    Aktif
                                  </span>
                                )}
                              </div>

                              <div className="relative z-10 flex items-end justify-between gap-1">
                                <div className="space-y-1 min-w-0">
                                  <div className={`text-[10px] font-extrabold truncate leading-none ${textOnPreview}`}>
                                    {item.shortName}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span
                                      className="inline-block w-6 h-1.5 rounded-full"
                                      style={{ backgroundColor: item.previewAccent }}
                                    />
                                    <span className={`text-[8px] font-medium truncate ${subTextOnPreview}`}>
                                      Hero
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="p-2.5 flex-1 flex flex-col justify-between bg-white dark:bg-slate-900">
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-[11px] sm:text-xs leading-snug truncate">
                                  {item.name}
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Quick Controls Strip for Statistik Cards (Trend Badge Toggle + Category Pills) */}
                  <div className="px-4 py-2.5 sm:px-5 bg-slate-50/90 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800 space-y-2.5 shrink-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        Pilih desain kartu metrik santri, nilai, rata-rata & tahfidz ({STATS_STYLES_CATALOG.length} Tema):
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateThemeSettings(
                            { showStatTrends: themeSettings.showStatTrends === false },
                            { silent: true }
                          )
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                          themeSettings.showStatTrends !== false
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {themeSettings.showStatTrends !== false ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Badge Tren: Tampil</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Badge Tren: Sembunyi</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Horizontal Scrollable Category Filter Tabs for Statistik */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                      {statsCategoryTabs.map((tab) => {
                        const active = statsPickerCategory === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setStatsPickerCategory(tab.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                              active
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span>{tab.label}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                                active
                                  ? 'bg-white/20 dark:bg-slate-900/15 text-current'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                              }`}
                            >
                              {tab.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Scrollable 2-Column Mobile Visual Swatch Grid for Statistik */}
                  <div className="p-3.5 sm:p-5 overflow-y-auto flex-1">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                      {filteredStatsStyles.map((item) => {
                        const isSelected = activeStatsId === item.id;
                        const textOnPreview = item.isLight ? 'text-slate-900' : 'text-white';
                        const subTextOnPreview = item.isLight ? 'text-slate-500' : 'text-white/75';

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              updateThemeSettings({ statsCardStyle: item.id }, { silent: false });
                            }}
                            className={`group rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer active:scale-[0.98] ${
                              isSelected
                                ? 'border-brand-custom ring-2 ring-brand-custom/30 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-sm'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            {/* Miniature Stat Metric Card Preview */}
                            <div
                              className="h-18 w-full p-2.5 flex flex-col justify-between relative overflow-hidden border-b"
                              style={{
                                background: item.previewBg,
                                borderColor: item.previewBorder,
                              }}
                            >
                              <div className="flex items-center justify-between gap-1 relative z-10">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                                    item.isLight
                                      ? 'bg-slate-900/10 text-slate-800'
                                      : 'bg-black/30 text-white/95 border border-white/15'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                                {isSelected && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[8px] font-black uppercase shadow-2xs">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    Aktif
                                  </span>
                                )}
                              </div>

                              <div className="relative z-10 flex items-baseline justify-between gap-1">
                                <span className={`text-base font-black tabular-nums leading-none ${textOnPreview}`}>
                                  128
                                </span>
                                <span
                                  className="px-1.5 py-0.5 rounded text-[8px] font-extrabold"
                                  style={{
                                    backgroundColor: item.previewAccent,
                                    color: '#ffffff',
                                  }}
                                >
                                  +94%
                                </span>
                              </div>

                              <div className="relative z-10 flex items-center justify-between gap-1">
                                <span className={`text-[8px] font-semibold truncate ${subTextOnPreview}`}>
                                  Total Santri
                                </span>
                                <span
                                  className="inline-block w-7 h-1 rounded-full"
                                  style={{ backgroundColor: item.previewAccent }}
                                />
                              </div>
                            </div>

                            <div className="p-2.5 flex-1 flex flex-col justify-between bg-white dark:bg-slate-900">
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-[11px] sm:text-xs leading-snug truncate">
                                  {item.name}
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Modal Footer */}
              <div className="px-4 py-3 sm:px-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
                {isSuperAdmin ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsHeroPickerOpen(false);
                      setCurrentView('manage');
                      setManageTab('superadmin');
                      setSuperAdminFocusSection('web_theme');
                    }}
                    className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Buka Pengaturan Lengkap (1F)</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pilihan gaya disimpan otomatis di perangkat Anda
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsHeroPickerOpen(false)}
                  className={`btn-precision ${radius.button} ${themeClasses.primary} text-white px-4 py-2 text-xs font-bold cursor-pointer`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Selesai</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Precision Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 px-1">
          <div className="flex items-center gap-2">
            <Filter className={`w-4 h-4 ${themeClasses.primaryText} shrink-0`} />
            <span>Filter Statistik & Rapor</span>
          </div>
          {/* Quick Statistik Style Picker Button on Mobile/Desktop (Super Admin Only) */}
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => {
                setPickerModeTab('stats');
                setIsHeroPickerOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer active:scale-95"
              title="Ubah Tema Kartu Statistik (Super Admin)"
            >
              <BarChart3 className={`w-3.5 h-3.5 ${themeClasses.primaryText}`} />
              <span>Tema Statistik: {getStatsStyleMeta(themeSettings.statsCardStyle).shortName}</span>
              <ChevronDown className="w-3 h-3 opacity-65" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="filter-control w-full sm:w-44"
          >
            <option value="">Semua Kelas ({classes.length})</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                Kelas {cls.name}
              </option>
            ))}
          </select>

          <div className="filter-group grid grid-cols-3 sm:inline-flex w-full sm:w-auto">
            {[
              { id: '', label: 'Semua' },
              { id: '1', label: 'Semester 1' },
              { id: '2', label: 'Semester 2' },
            ].map((sem) => {
              const active = selectedSemester === sem.id;
              return (
                <button
                  key={sem.id}
                  type="button"
                  onClick={() => setSelectedSemester(sem.id)}
                  className={`filter-btn w-full sm:w-auto ${
                    active
                      ? `${themeClasses.primary} text-white shadow-2xs`
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{sem.label}</span>
                </button>
              );
            })}
          </div>

          {(selectedClassId || selectedSemester) && (
            <button
              type="button"
              onClick={() => {
                setSelectedClassId('');
                setSelectedSemester('');
              }}
              className="filter-reset-btn"
            >
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row (Rendered according to statsCardStyle: 8 Styles) */}
      {(() => {
        const statsStyle = (themeSettings.statsCardStyle || 'modern_elevated') as string;
        const showTrends = themeSettings.showStatTrends !== false;

        const metricItems = [
          {
            id: 'students',
            title: 'Total Santri',
            value: stats.totalStudents,
            badge: `${classes.length} Kelas`,
            subtext: selectedClassId ? 'Santri di kelas terpilih' : 'Terdaftar di semua tingkatan',
            icon: <Users className="w-4 h-4 text-current" />,
            colorText: themeClasses.primaryText,
            lightBg: themeClasses.primaryLightBg,
            headerBg: themeClasses.primary,
          },
          {
            id: 'grades',
            title: 'Total Nilai Terinput',
            value: stats.totalGradesCount,
            badge: 'Terdata',
            subtext: 'Data nilai mapel reguler',
            icon: <GraduationCap className="w-4 h-4 text-current" />,
            colorText: 'text-blue-600 dark:text-blue-400',
            lightBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
            headerBg: 'bg-blue-600',
          },
          {
            id: 'average',
            title: 'Rata-rata Nilai',
            value: stats.overallAverage,
            badge: `KKM ${siteSettings.kkmDefault ?? 70}`,
            subtext: 'Skala standar 0 - 90',
            icon: <Award className="w-4 h-4 text-current" />,
            colorText: 'text-amber-600 dark:text-amber-400',
            lightBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
            headerBg: 'bg-amber-600',
          },
          {
            id: 'tahfidz',
            title: 'Catatan Tahfidz',
            value: tahfidzGrades.length,
            badge: 'Hafalan',
            subtext: 'Hafalan Al-Quran santri',
            icon: <BookOpen className="w-4 h-4 text-current" />,
            colorText: 'text-emerald-600 dark:text-emerald-400',
            lightBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
            headerBg: 'bg-emerald-600',
          },
        ];

        if (statsStyle === 'glass_glow') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all group"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-60"
                    style={{ color: 'var(--brand-primary)' }}
                  />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                      {item.title}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 shadow-2xs ring-1 ring-slate-200 dark:ring-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
                      {item.value}
                    </div>
                    {showTrends && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">{item.subtext}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'split_metric') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
                >
                  <div className={`p-3 text-white flex items-center justify-between ${item.headerBg}`}>
                    <span className="text-[11px] font-bold tracking-wide uppercase truncate">
                      {item.title}
                    </span>
                    <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                  </div>
                  <div className="p-3.5 space-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                        {item.value}
                      </div>
                      {showTrends && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {item.subtext}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'minimal_bordered') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-xl border-l-4 border-y border-r border-slate-200 dark:border-slate-800 shadow-2xs"
                  style={{ borderLeftColor: 'var(--brand-primary)' }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 truncate">
                      {item.title}
                    </span>
                    <div className="opacity-60">{item.icon}</div>
                  </div>
                  <div className="text-3xl font-light text-slate-900 dark:text-white tabular-nums tracking-tight mb-1">
                    {item.value}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="truncate">{item.subtext}</span>
                    {showTrends && (
                      <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0 ml-1">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'neo_brutalist') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-xl border-2 border-slate-900 dark:border-slate-200 shadow-[3px_3px_0px_#0f172a] dark:shadow-[3px_3px_0px_#f8fafc] transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wide text-slate-900 dark:text-white truncate">
                      {item.title}
                    </span>
                    <div className="p-1.5 bg-black text-white dark:bg-white dark:text-slate-900 rounded-md shrink-0">
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                      {item.value}
                    </div>
                    {showTrends && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-black border border-slate-900 dark:border-slate-200 bg-amber-300 text-slate-900">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate">
                    {item.subtext}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'gradient_accent') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
                      {item.title}
                    </span>
                    <div className={`w-8 h-8 rounded-xl ${item.lightBg} flex items-center justify-center shadow-xs shrink-0`}>
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className={`text-2xl font-extrabold tracking-tight ${item.colorText} tabular-nums`}>
                      {item.value}
                    </div>
                    {showTrends && (
                      <span className={`filter-badge ${item.lightBg}`}>{item.badge}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {item.subtext}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'compact_bar') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-xl ${item.lightBg} flex items-center justify-center shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                        {item.title}
                      </span>
                      {showTrends && (
                        <span className="text-[10px] font-bold px-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                        {item.value}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">{item.subtext}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'circular_badge') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5 truncate">
                      {item.title}
                    </div>
                    <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums mb-1">
                      {item.value}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {item.subtext}
                    </div>
                  </div>
                  <div className="relative w-11 h-11 rounded-full border-2 border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center shrink-0 bg-emerald-500/10">
                    <div className={item.colorText}>{item.icon}</div>
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'floating_card_3d') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="relative bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08),0_8px_10px_-6px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.12)] transition-all duration-200 group"
                >
                  <div className={`absolute top-0 left-6 right-6 h-1 rounded-b-md ${item.headerBg}`} />
                  <div className="flex items-center justify-between mb-3 pt-1">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                      {item.title}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-xl ${item.lightBg} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}
                    >
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 mb-1.5">
                    <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
                      {item.value}
                    </div>
                    {showTrends && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${item.lightBg}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                    {item.subtext}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'dark_oled_glow') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden bg-slate-950 p-4 sm:p-4.5 rounded-2xl border border-slate-800 hover:border-slate-700 shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 truncate">
                      {item.title}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-white flex items-center justify-center group-hover:border-slate-700">
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <div className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
                      {item.value}
                    </div>
                    {showTrends && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 text-emerald-400 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_8px_#22d3ee]" />
                    <span>{item.subtext}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'kpi_target_gauge') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item, idx) => {
                const progressPct =
                  idx === 0
                    ? 85
                    : idx === 1
                    ? 92
                    : idx === 2
                    ? Math.min(100, Math.round((Number(stats.overallAverage) || 75) * 1.1))
                    : 78;
                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">
                        {item.title}
                      </span>
                      <div className={`p-1.5 rounded-lg ${item.lightBg}`}>{item.icon}</div>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                        {item.value}
                      </span>
                      {showTrends && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.headerBg}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                        <span className="truncate">{item.subtext}</span>
                        <span className="font-semibold">{progressPct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        if (statsStyle === 'bento_compact') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50/80 dark:bg-slate-900/90 p-3 sm:p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 truncate">
                      {item.title}
                    </span>
                    <span className="p-1 rounded-md bg-white dark:bg-slate-800 shadow-2xs text-slate-700 dark:text-slate-300 shrink-0">
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none mb-1.5">
                      {item.value}
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 truncate">
                        {item.subtext}
                      </span>
                      {showTrends && (
                        <span className="font-bold text-slate-700 dark:text-slate-300 ml-1 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'soft_neumorphic') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#f8fafc] dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.3)] transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                      {item.title}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center text-slate-700 dark:text-slate-200">
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                      {item.value}
                    </div>
                    {showTrends && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs border border-slate-200/80 dark:border-slate-700">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                    {item.subtext}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'ribbon_badge') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs"
                >
                  <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none">
                    <div
                      className={`absolute transform rotate-45 ${item.headerBg} text-white text-[8px] font-black uppercase text-center py-0.5 right-[-32px] top-[14px] w-[110px] shadow-2xs`}
                    >
                      {item.badge}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5 pr-6">
                    <div className={`w-7 h-7 rounded-lg ${item.lightBg} flex items-center justify-center shrink-0`}>
                      {item.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                      {item.title}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight my-1">
                    {item.value}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate pt-1 border-t border-slate-100 dark:border-slate-800">
                    {item.subtext}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'accent_bottom_wave') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden bg-white dark:bg-slate-900 p-4 pb-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {item.title}
                    </span>
                    <div className={`p-1.5 rounded-lg ${item.lightBg}`}>{item.icon}</div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                      {item.value}
                    </div>
                    {showTrends && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate mb-2">
                    {item.subtext}
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${item.headerBg}`} />
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'pill_duotone') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl ${item.lightBg} flex items-center justify-center shrink-0 text-current`}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
                      {item.title}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                        {item.value}
                      </span>
                      {showTrends && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                      {item.subtext}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'islamic_gold_frame') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="relative bg-[#fffdf7] dark:bg-slate-900 p-4 rounded-2xl border-2 border-amber-400/70 dark:border-amber-500/50 shadow-xs"
                >
                  <div className="absolute inset-1 rounded-xl border border-amber-300/40 dark:border-amber-500/20 pointer-events-none" />
                  <div className="flex items-center justify-between mb-2 relative z-10">
                    <span className="text-xs font-bold text-amber-950 dark:text-amber-200 truncate">
                      {item.title}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300/60 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 relative z-10">
                    <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                      {item.value}
                    </div>
                    {showTrends && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-400/40">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-amber-900/70 dark:text-slate-400 mt-1 truncate relative z-10">
                    {item.subtext}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'emerald_madrasah') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#065f46] text-white p-4 rounded-2xl border border-emerald-400/40 shadow-md"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-100 truncate">{item.title}</span>
                    <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 text-amber-300 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                      {item.value}
                    </div>
                    {showTrends && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-400/20 text-amber-200 border border-amber-300/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-emerald-200/80 mt-1 truncate">{item.subtext}</div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'sparkline_wave') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden bg-white dark:bg-slate-900 p-4 pb-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1.5 relative z-10">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {item.title}
                    </span>
                    <div className={`w-7 h-7 rounded-lg ${item.lightBg} flex items-center justify-center`}>
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 relative z-10">
                    <div className={`text-2xl font-black ${item.colorText} tabular-nums`}>
                      {item.value}
                    </div>
                    {showTrends && (
                      <span className={`filter-badge ${item.lightBg}`}>{item.badge}</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate relative z-10">
                    {item.subtext}
                  </div>
                  {/* Decorative Bottom Sparkline SVG Wave */}
                  <svg
                    viewBox="0 0 200 35"
                    className={`absolute bottom-0 left-0 right-0 w-full h-7 opacity-25 pointer-events-none ${item.colorText}`}
                    preserveAspectRatio="none"
                  >
                    <path
                      d={
                        idx % 2 === 0
                          ? 'M0,25 Q40,5 80,20 T160,10 T200,18 L200,35 L0,35 Z'
                          : 'M0,20 Q50,30 100,12 T170,18 T200,8 L200,35 L0,35 Z'
                      }
                      fill="currentColor"
                    />
                  </svg>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'radial_ring_meter') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item, idx) => {
                const pct = idx === 0 ? 88 : idx === 1 ? 92 : idx === 2 ? 84 : 79;
                const dashOffset = 100 - pct;
                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block truncate">
                        {item.title}
                      </span>
                      <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums my-0.5">
                        {item.value}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                        {item.subtext}
                      </span>
                    </div>
                    <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="15.5"
                          fill="none"
                          className="stroke-slate-100 dark:stroke-slate-800"
                          strokeWidth="3.2"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.5"
                          fill="none"
                          stroke="var(--brand-primary)"
                          strokeWidth="3.2"
                          strokeDasharray="100"
                          strokeDashoffset={dashOffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className={`absolute inset-0 flex items-center justify-center ${item.colorText}`}>
                        {item.icon}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        if (statsStyle === 'glass_frost_prism') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden bg-gradient-to-br from-white/95 via-sky-50/40 to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 backdrop-blur-md p-4 rounded-2xl border border-sky-200/80 dark:border-indigo-800/60 shadow-xs"
                >
                  <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-sky-400/15 blur-xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                      {item.title}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-white/90 dark:bg-slate-800 shadow-2xs border border-sky-100 dark:border-slate-700 flex items-center justify-center text-sky-600 dark:text-sky-400">
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                      {item.value}
                    </div>
                    {showTrends && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-300/40">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {item.subtext}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'editorial_serif_stat') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#fcfcf9] dark:bg-slate-900 p-4 rounded-xl border-y-2 border-x border-slate-800 dark:border-slate-600 shadow-2xs"
                >
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 truncate">
                      {item.title}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">{item.icon}</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-3xl font-serif-report font-bold text-slate-900 dark:text-white tabular-nums">
                      {item.value}
                    </div>
                    {showTrends && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] italic text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {item.subtext}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'cyber_hud_matrix') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden bg-[#060b16] text-white p-4 rounded-xl border border-cyan-500/40 shadow-[0_0_16px_rgba(6,182,212,0.12)]"
                >
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300/90 truncate">
                      {item.title}
                    </span>
                    <div className="text-cyan-400">{item.icon}</div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-2xl sm:text-3xl font-mono font-black text-white tabular-nums">
                      {item.value}
                    </div>
                    {showTrends && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1 truncate">{item.subtext}</div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'royal_crest_card') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-300/80 dark:border-amber-700/60 shadow-xs text-center flex flex-col items-center"
                >
                  <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-300 flex items-center justify-center mb-1.5 shadow-2xs">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-full">
                    {item.title}
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums my-0.5">
                    {item.value}
                  </div>
                  {showTrends ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100/80 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      {item.badge}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 truncate max-w-full">{item.subtext}</span>
                  )}
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'stacked_folder_tab') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
              {metricItems.map((item) => (
                <div key={item.id} className="relative pt-2">
                  <div
                    className={`absolute top-0 left-3 px-2.5 py-0.5 rounded-t-lg text-[9px] font-extrabold uppercase tracking-wider text-white ${item.headerBg}`}
                  >
                    {item.badge}
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl rounded-tl-md border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                        {item.title}
                      </span>
                      <div className={item.colorText}>{item.icon}</div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                      {item.value}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {item.subtext}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'outlined_wireframe') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-transparent p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-500 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">
                      {item.title}
                    </span>
                    <div className="text-slate-500 dark:text-slate-400">{item.icon}</div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                      {item.value}
                    </div>
                    {showTrends && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {item.subtext}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'warm_sandstone') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-[#fef3c7]/80 via-[#fffbeb] to-[#fde68a]/50 dark:from-stone-900 dark:via-stone-900 dark:to-amber-950/40 p-4 rounded-2xl border border-amber-300/70 dark:border-stone-700 shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-950 dark:text-amber-200 truncate">
                      {item.title}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-900/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-2xl font-black text-amber-950 dark:text-white tabular-nums">
                      {item.value}
                    </div>
                    {showTrends && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/80 dark:bg-stone-800 text-amber-900 dark:text-amber-300">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-amber-900/70 dark:text-stone-400 mt-1 truncate">
                    {item.subtext}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'pastel_soft_colors') {
          const pastelCards = [
            'bg-emerald-50/90 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/60',
            'bg-blue-50/90 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/60',
            'bg-amber-50/90 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/60',
            'bg-purple-50/90 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800/60',
          ];
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border shadow-2xs ${pastelCards[idx % pastelCards.length]}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                      {item.title}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 shadow-2xs flex items-center justify-center">
                      <span className={item.colorText}>{item.icon}</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className={`text-2xl font-black ${item.colorText} tabular-nums`}>
                      {item.value}
                    </div>
                    {showTrends && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-2xs">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 truncate">
                    {item.subtext}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'bold_solid_vivid') {
          const solidCards = [
            themeClasses.primary,
            'bg-blue-600',
            'bg-amber-600',
            'bg-teal-600',
          ];
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`${solidCards[idx % solidCards.length]} text-white p-4 rounded-2xl shadow-md border border-white/15`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white/90 truncate">{item.title}</span>
                    <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                      {item.value}
                    </div>
                    {showTrends && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-black/20 text-white border border-white/20">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-white/80 mt-1 truncate">{item.subtext}</div>
                </div>
              ))}
            </div>
          );
        }

        if (statsStyle === 'ticket_perforated') {
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems.map((item) => (
                <div
                  key={item.id}
                  className="relative bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                      {item.title}
                    </span>
                    <div className={`w-7 h-7 rounded-lg ${item.lightBg} flex items-center justify-center`}>
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 pb-2.5 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className={`text-2xl font-black ${item.colorText} tabular-nums`}>
                      {item.value}
                    </div>
                    {showTrends && (
                      <span className={`filter-badge ${item.lightBg}`}>{item.badge}</span>
                    )}
                  </div>
                  <div className="pt-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate flex items-center justify-between">
                    <span className="truncate">{item.subtext}</span>
                    <span className="text-[9px] uppercase tracking-wider opacity-60">RESMI</span>
                  </div>
                </div>
              ))}
            </div>
          );
        }

        // Default: modern_elevated
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {metricItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                    {item.title}
                  </span>
                  <div className={`w-8 h-8 rounded-lg ${item.lightBg} flex items-center justify-center shrink-0`}>
                    {item.icon}
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <div className={`text-2xl font-bold tracking-tight ${item.colorText} tabular-nums`}>
                    {item.value}
                  </div>
                  {showTrends && (
                    <span className={`filter-badge ${item.lightBg}`}>{item.badge}</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                  {item.subtext}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Main Grid: Siswa Berprestasi per Kelas & Distribusi Nilai */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Siswa Berprestasi per Kelas (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className={`w-4 h-4 ${themeClasses.primaryText}`} />
              <h2 className="text-base font-bold text-slate-900">Siswa Berprestasi per Kelas</h2>
            </div>
            <span className="text-xs text-slate-500">
              {topGradesByClass.length} kelas memiliki data nilai
            </span>
          </div>

          {topGradesByClass.length === 0 ? (
            <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-600">Belum ada data nilai pada filter ini.</p>
              <button
                onClick={() => setCurrentView('grades')}
                className={`mt-3 inline-flex items-center gap-1.5 text-xs ${themeClasses.primaryText} hover:underline font-semibold`}
              >
                <span>Input nilai sekarang</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topGradesByClass.map((item) => (
                <div
                  key={item.classId}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <span className={`text-[11px] font-semibold ${themeClasses.primaryText} uppercase tracking-wide block`}>
                      Kelas {item.className}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{item.studentName}</h3>
                    <p className="text-xs text-slate-500">{item.subjectCount} mata pelajaran</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-extrabold ${themeClasses.primaryText} tabular-nums`}>
                      {item.average}
                    </div>
                    <span className="text-[10px] text-slate-500 block">Rata-rata</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distribusi Nilai (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className={`w-4 h-4 ${themeClasses.primaryText}`} />
              <h2 className="text-base font-bold text-slate-900">Distribusi Prestasi</h2>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  letter: 'Grade A',
                  range: `${activeThresholds.minA} - 90`,
                  count: stats.gradeACount,
                  bg: 'bg-emerald-50/60 border-emerald-100',
                  text: 'text-emerald-900',
                  numText: 'text-emerald-700',
                  track: 'bg-emerald-200/50',
                  bar: 'bg-emerald-600',
                },
                {
                  letter: 'Grade B',
                  range: `${activeThresholds.minB} - ${Math.max(activeThresholds.minB, activeThresholds.minA - 1)}`,
                  count: stats.gradeBCount,
                  bg: 'bg-sky-50/60 border-sky-100',
                  text: 'text-sky-900',
                  numText: 'text-sky-700',
                  track: 'bg-sky-200/50',
                  bar: 'bg-sky-600',
                },
                {
                  letter: 'Grade C',
                  range: `${activeThresholds.minC} - ${Math.max(activeThresholds.minC, activeThresholds.minB - 1)}`,
                  count: stats.gradeCCount,
                  bg: 'bg-amber-50/60 border-amber-100',
                  text: 'text-amber-900',
                  numText: 'text-amber-700',
                  track: 'bg-amber-200/50',
                  bar: 'bg-amber-600',
                },
                {
                  letter: 'Grade D',
                  range: `${activeThresholds.minD} - ${Math.max(activeThresholds.minD, activeThresholds.minC - 1)}`,
                  count: stats.gradeDCount,
                  bg: 'bg-orange-50/60 border-orange-100',
                  text: 'text-orange-900',
                  numText: 'text-orange-700',
                  track: 'bg-orange-200/50',
                  bar: 'bg-orange-600',
                },
                {
                  letter: 'Grade E',
                  range: `< ${activeThresholds.minD}`,
                  count: stats.gradeECount,
                  bg: 'bg-rose-50/60 border-rose-100',
                  text: 'text-rose-900',
                  numText: 'text-rose-700',
                  track: 'bg-rose-200/50',
                  bar: 'bg-rose-600',
                },
              ].map((gItem) => (
                <div key={gItem.letter} className={`p-2.5 rounded-xl border ${gItem.bg}`}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-semibold ${gItem.text}`}>
                      {gItem.letter} ({gItem.range})
                    </span>
                    <span className={`font-bold ${gItem.numText} tabular-nums`}>
                      {gItem.count} nilai
                    </span>
                  </div>
                  <div className={`w-full ${gItem.track} rounded-full h-1.5 overflow-hidden`}>
                    <div
                      className={`${gItem.bar} h-1.5 rounded-full transition-all`}
                      style={{
                        width: `${
                          stats.totalGradesCount > 0
                            ? (gItem.count / stats.totalGradesCount) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Skala Grade Aktif: A (&ge;{activeThresholds.minA}), B (&ge;{activeThresholds.minB}), C (&ge;{activeThresholds.minC}), D (&ge;{activeThresholds.minD}) · KKM: {siteSettings.kkmDefault ?? 70}
          </div>
        </div>
      </div>

      {/* Second Row: Rata-rata per Mata Pelajaran & Juara Umum Top 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rata-rata per Mata Pelajaran */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className={`w-4 h-4 ${themeClasses.primaryText}`} />
              <h2 className="text-base font-bold text-slate-900">Rata-rata per Mata Pelajaran</h2>
            </div>
            <span className="text-xs text-slate-500">
              {subjectAverages.length} mata pelajaran dinilai
            </span>
          </div>

          {subjectAverages.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Belum ada data nilai mata pelajaran untuk filter ini.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {subjectAverages.map((sub, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-slate-400 font-medium tabular-nums">{idx + 1}.</span>
                    <span className="font-semibold text-slate-800">{sub.name}</span>
                    <span className="text-[11px] text-slate-400">({sub.count} nilai)</span>
                  </div>
                  <div className="font-bold tabular-nums text-slate-900">
                    <span
                      className={
                        sub.avgNum >= 80
                          ? 'text-emerald-700'
                          : sub.avgNum >= 60
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }
                    >
                      {sub.average}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Juara Umum (Top 5 Siswa) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className={`w-4 h-4 ${themeClasses.primaryText}`} />
              <h2 className="text-base font-bold text-slate-900">Juara Umum (Top 5 Santri)</h2>
            </div>
            <span className="text-xs text-slate-500">Peringkat tertinggi</span>
          </div>

          {topStudents.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Belum ada data peringkat santri.
            </div>
          ) : (
            <div className="space-y-2.5">
              {topStudents.map((st, idx) => {
                const badgeColor =
                  idx === 0
                    ? 'bg-amber-400 text-amber-950 font-bold'
                    : idx === 1
                    ? 'bg-slate-300 text-slate-800 font-bold'
                    : idx === 2
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 font-medium';

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs tabular-nums shrink-0 ${badgeColor}`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">{st.studentName}</h3>
                        <p className="text-[11px] text-slate-500">
                          Kelas {st.className} · {st.subjectCount} mata pelajaran
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${themeClasses.primaryText} tabular-nums`}>
                        {st.average}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Rata-rata</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
