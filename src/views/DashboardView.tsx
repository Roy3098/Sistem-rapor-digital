import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getRadiusClass, resolveGradeThresholds } from '../utils/theme';
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
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
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
    isDeviceDarkMode,
    openSuperAdminAnnouncements,
  } = useApp();

  const isSuperAdmin = currentUser?.role === 'superadmin' || currentUser?.username === 'superadmin';
  const radius = getRadiusClass(themeSettings.borderRadius);

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');

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
        const bannerStyle = themeSettings.heroBannerStyle || 'gradient_brand';
        const isLightBanner =
          !isDeviceDarkMode &&
          (bannerStyle === 'light_clean' ||
            bannerStyle === 'glass_modern' ||
            bannerStyle === 'split_accent' ||
            bannerStyle === 'editorial_card' ||
            bannerStyle === 'pastel_mint' ||
            bannerStyle === 'vintage_parchment');

        const bannerPadding =
          themeSettings.heroBannerHeight === 'compact'
            ? 'p-4 sm:p-5'
            : themeSettings.heroBannerHeight === 'spacious'
            ? 'p-8 sm:p-11'
            : 'p-6 sm:p-8';

        let bannerSurfaceClass = '';
        let bannerExtraStyle: React.CSSProperties | undefined = undefined;

        switch (bannerStyle) {
          case 'dark_elegant':
            bannerSurfaceClass =
              'bg-slate-950 text-white border border-slate-800 shadow-md ring-1 ring-white/5';
            break;
          case 'light_clean':
            bannerSurfaceClass =
              'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-2xs';
            break;
          case 'glass_modern':
            bannerSurfaceClass = `bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl text-slate-900 dark:text-white border ${themeClasses.primaryBorder} shadow-xs`;
            break;
          case 'split_accent':
            bannerSurfaceClass =
              'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 border-l-[10px] shadow-2xs';
            bannerExtraStyle = { borderLeftColor: 'var(--brand-primary)' };
            break;
          case 'islamic_arch':
            bannerSurfaceClass =
              'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white border border-emerald-500/30 shadow-md';
            break;
          case 'aurora_mesh':
            bannerSurfaceClass = 'bg-slate-950 text-white border border-indigo-500/30 shadow-md';
            bannerExtraStyle = {
              backgroundImage:
                'radial-gradient(ellipse at 15% 10%, var(--brand-primary) 0%, transparent 60%), radial-gradient(ellipse at 85% 30%, #6366f1 0%, transparent 55%), radial-gradient(ellipse at 50% 90%, #06b6d4 0%, transparent 60%)',
            };
            break;
          case 'geometric_mosaic':
            bannerSurfaceClass =
              'bg-slate-900 text-white border-2 border-amber-500/30 shadow-md ring-1 ring-amber-400/20';
            break;
          case 'editorial_card':
            bannerSurfaceClass =
              'bg-[#fcfcf9] dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-800 dark:border-slate-600 shadow-sm';
            break;
          case 'compact_ribbon':
            bannerSurfaceClass =
              'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700 shadow-sm';
            break;
          case 'cyber_academic':
            bannerSurfaceClass =
              'bg-[#0a0f1d] text-white border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/20';
            break;
          case 'sunset_warmth':
            bannerSurfaceClass =
              'bg-gradient-to-r from-amber-700 via-orange-800 to-amber-900 text-white border border-amber-400/30 shadow-md';
            break;
          case 'royal_emerald':
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#042f2e] text-white border-2 border-amber-400/50 shadow-xl ring-1 ring-amber-300/30';
            bannerExtraStyle = {
              boxShadow: '0 20px 25px -5px rgba(6, 78, 59, 0.4), 0 8px 10px -6px rgba(245, 158, 11, 0.2)',
            };
            break;
          case 'islamic_calligraphy':
            bannerSurfaceClass =
              'bg-gradient-to-r from-[#062c20] via-[#0f4d3d] to-[#0d3b32] text-white border border-emerald-400/40 shadow-lg';
            break;
          case 'modern_stacked':
            bannerSurfaceClass =
              'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-t-4 border-t-indigo-500 border-x border-b border-slate-800 shadow-lg';
            break;
          case 'pastel_mint':
            bannerSurfaceClass =
              'bg-gradient-to-br from-[#ecfdf5] via-[#f0fdf4] to-[#e6fffa] dark:from-slate-900 dark:via-emerald-950/40 dark:to-slate-900 text-slate-900 dark:text-white border border-emerald-200/90 dark:border-emerald-800/60 shadow-sm';
            break;
          case 'cosmic_galaxy':
            bannerSurfaceClass =
              'bg-[#090d16] text-white border border-purple-500/40 shadow-xl ring-1 ring-purple-400/25';
            bannerExtraStyle = {
              backgroundImage:
                'radial-gradient(circle at 18% 18%, rgba(168, 85, 247, 0.35) 0%, transparent 45%), radial-gradient(circle at 82% 75%, rgba(59, 130, 246, 0.25) 0%, transparent 45%), linear-gradient(135deg, #090d16 0%, #1e1136 50%, #0f172a 100%)',
            };
            break;
          case 'vintage_parchment':
            bannerSurfaceClass =
              'bg-[#fdfbf7] dark:bg-slate-900 text-[#292524] dark:text-white border-2 border-[#d6c7a1] dark:border-stone-700 shadow-md';
            bannerExtraStyle = {
              backgroundImage: 'radial-gradient(#d6c7a1 0.75px, transparent 0.75px)',
              backgroundSize: '16px 16px',
            };
            break;
          case 'ocean_breeze':
            bannerSurfaceClass =
              'bg-gradient-to-r from-[#0c4a6e] via-[#0284c7] to-[#0d9488] text-white border border-cyan-400/30 shadow-lg';
            break;
          case 'crimson_luxury':
            bannerSurfaceClass =
              'bg-gradient-to-r from-[#4c0519] via-[#881337] to-[#3b0764] text-white border border-rose-400/40 shadow-xl ring-1 ring-rose-400/20';
            break;
          case 'gradient_brand':
          default:
            bannerSurfaceClass = `bg-gradient-to-r ${themeClasses.gradientHeader} text-white shadow-sm`;
            break;
        }

        return (
          <div
            style={bannerExtraStyle}
            className={`relative overflow-hidden ${radius.card} ${bannerSurfaceClass} ${bannerPadding}`}
          >
            {/* Style-specific Decorative Overlays */}
            {bannerStyle === 'islamic_arch' && (
              <div className="absolute right-0 top-0 bottom-0 w-80 pointer-events-none opacity-20 hidden md:block">
                <svg viewBox="0 0 200 200" className="w-full h-full text-emerald-400 fill-current" preserveAspectRatio="none">
                  <path d="M100 10 C 120 40, 160 70, 190 110 C 195 130, 200 160, 200 200 L 0 200 C 0 160, 5 130, 10 110 C 40 70, 80 40, 100 10 Z" fill="none" stroke="currentColor" strokeWidth="3" />
                  <circle cx="100" cy="80" r="18" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M100 45 L 100 62 M 100 98 L 100 115" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            )}

            {bannerStyle === 'royal_emerald' && (
              <div className="absolute right-0 top-0 bottom-0 w-84 pointer-events-none opacity-25 hidden md:block">
                <svg viewBox="0 0 200 200" className="w-full h-full text-amber-300 fill-current" preserveAspectRatio="none">
                  <polygon points="100,10 125,75 190,75 138,115 158,180 100,140 42,180 62,115 10,75 75,75" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                </svg>
              </div>
            )}

            {bannerStyle === 'islamic_calligraphy' && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 hidden md:block text-right pr-6">
                <span className="font-arabic text-6xl text-emerald-300 block select-none">
                  ﷽
                </span>
                <span className="text-[11px] font-medium text-emerald-200 block mt-1 tracking-widest uppercase">
                  Pendidikan Berkualitas & Beradab
                </span>
              </div>
            )}

            {bannerStyle === 'geometric_mosaic' && (
              <div className="absolute right-0 top-0 bottom-0 w-72 pointer-events-none opacity-15 hidden md:block">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-300 fill-current">
                  <polygon points="50,5 64,18 82,18 82,36 95,50 82,64 82,82 64,82 50,95 36,82 18,82 18,64 5,50 18,36 18,18 36,18" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="50" cy="50" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            )}

            {bannerStyle === 'cyber_academic' && (
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d410_1px,transparent_1px),linear-gradient(to_bottom,#06b6d410_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            )}

            {bannerStyle === 'cosmic_galaxy' && (
              <div className="absolute right-8 top-6 pointer-events-none opacity-40 hidden md:block">
                <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_12px_#fff]" />
                <div className="w-1.5 h-1.5 rounded-full bg-purple-300 shadow-[0_0_8px_#c084fc] ml-12 mt-4" />
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9] ml-6 mt-8" />
              </div>
            )}

            {/* Subtle Standard Background Pattern Backdrop */}
            {bannerStyle !== 'islamic_arch' &&
              bannerStyle !== 'geometric_mosaic' &&
              bannerStyle !== 'royal_emerald' &&
              bannerStyle !== 'islamic_calligraphy' && (
                <div
                  className={`absolute right-0 top-0 bottom-0 w-1/2 ${
                    isLightBanner ? 'opacity-[0.06]' : 'opacity-15'
                  } pointer-events-none hidden md:block`}
                >
                  <img
                    src="/src/assets/images/banner_academic_pattern_1791464114520.jpg"
                    alt="Islamic pattern"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div
                  className={`flex items-center gap-2 ${
                    isLightBanner ? themeClasses.primaryText : 'text-slate-200'
                  } text-xs font-semibold uppercase tracking-wider mb-2`}
                >
                  {bannerStyle === 'cyber_academic' ? (
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  ) : bannerStyle === 'geometric_mosaic' ? (
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-current opacity-85" />
                  )}
                  <span>
                    {siteSettings.foundationName ? `${siteSettings.foundationName} · ` : ''}
                    {siteSettings.schoolName}
                  </span>
                  {bannerStyle === 'compact_ribbon' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500 text-white">
                      Portal Resmi
                    </span>
                  )}
                </div>

                <h1
                  className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                    isLightBanner ? 'text-slate-900' : 'text-white'
                  } ${bannerStyle === 'editorial_card' ? 'font-serif-report' : ''} mb-2`}
                >
                  Selamat Datang, {currentUser?.fullName || 'Ustadz'}!
                </h1>
                <p
                  className={`${
                    isLightBanner ? 'text-slate-600' : 'text-slate-200'
                  } text-sm leading-relaxed mb-5`}
                >
                  {siteSettings.announcement ||
                    'Kelola nilai rapor, catatan hafalan tahfidz, dan bank soal ujian santri dengan mudah, rapi, dan terstruktur.'}
                </p>

                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setCurrentView('grades')}
                    className={
                      isLightBanner
                        ? `btn-precision w-full sm:w-auto ${radius.button} ${themeClasses.primary} ${themeClasses.primaryHover} text-white shadow-2xs ${
                            !isSuperAdmin ? 'col-span-2 sm:col-span-1' : ''
                          }`
                        : `btn-precision w-full sm:w-auto ${radius.button} bg-white text-slate-900 hover:bg-slate-100 shadow-2xs ${
                            !isSuperAdmin ? 'col-span-2 sm:col-span-1' : ''
                          }`
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
                            ? `btn-precision w-full sm:w-auto col-span-2 sm:col-span-1 ${radius.button} bg-slate-800 hover:bg-slate-900 text-white`
                            : `btn-precision w-full sm:w-auto col-span-2 sm:col-span-1 ${radius.button} bg-black/25 hover:bg-black/35 text-white border border-white/20`
                        }
                      >
                        <Settings2 className="w-3.5 h-3.5 text-current shrink-0" />
                        <span>Super Admin</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Hero Right Summary Box (Controlled by showHeroStats in 1F) */}
              {themeSettings.showHeroStats !== false && (
                <div
                  className={`grid grid-cols-2 gap-2.5 sm:w-72 shrink-0 p-3.5 rounded-xl border ${
                    isLightBanner
                      ? 'bg-slate-50/90 border-slate-200 text-slate-900'
                      : 'bg-black/25 backdrop-blur-md border-white/15 text-white'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-lg ${
                      isLightBanner ? 'bg-white border border-slate-200/80' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold block ${
                        isLightBanner ? 'text-slate-500' : 'text-white/70'
                      }`}
                    >
                      Tahun Ajaran
                    </span>
                    <span className="text-sm font-extrabold tabular-nums">{academicYear}</span>
                  </div>
                  <div
                    className={`p-2.5 rounded-lg ${
                      isLightBanner ? 'bg-white border border-slate-200/80' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold block ${
                        isLightBanner ? 'text-slate-500' : 'text-white/70'
                      }`}
                    >
                      Kelas Aktif
                    </span>
                    <span className="text-sm font-extrabold tabular-nums">
                      {classes.length} Rombel
                    </span>
                  </div>
                  <div
                    className={`p-2.5 rounded-lg ${
                      isLightBanner ? 'bg-white border border-slate-200/80' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold block ${
                        isLightBanner ? 'text-slate-500' : 'text-white/70'
                      }`}
                    >
                      Mata Pelajaran
                    </span>
                    <span className="text-sm font-extrabold tabular-nums">
                      {subjects.length} Mapel
                    </span>
                  </div>
                  <div
                    className={`p-2.5 rounded-lg ${
                      isLightBanner ? 'bg-white border border-slate-200/80' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold block ${
                        isLightBanner ? 'text-slate-500' : 'text-white/70'
                      }`}
                    >
                      Standar KKM
                    </span>
                    <span className="text-sm font-extrabold tabular-nums">
                      {siteSettings.kkmDefault ?? 70} Poin
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Precision Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 px-1">
          <Filter className={`w-4 h-4 ${themeClasses.primaryText} shrink-0`} />
          <span>Filter Statistik & Rapor</span>
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
        const statsStyle = themeSettings.statsCardStyle || 'modern_elevated';
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
