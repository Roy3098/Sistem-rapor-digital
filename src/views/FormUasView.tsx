import React from 'react';
import { useApp } from '../context/AppContext';
import { FormUasTab } from '../types';
import { GradesView } from './GradesView';
import { ExamsView } from './ExamsView';
import { ReportCardView } from './ReportCardView';
import { getRadiusClass } from '../utils/theme';
import {
  GraduationCap,
  FileQuestion,
  FileCheck2,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  Printer,
  BookOpen,
} from 'lucide-react';

export const FormUasView: React.FC = () => {
  const {
    formUasTab,
    setFormUasTab,
    grades,
    tahfidzGrades,
    examFiles,
    examPackages,
    reportCards,
    academicYear,
    siteSettings,
    themeClasses,
    themeSettings,
  } = useApp();

  const radius = getRadiusClass(themeSettings.borderRadius);

  // Summary counts for UAS progress
  const totalGrades = grades.length + tahfidzGrades.length;
  const totalExams = examFiles.length + examPackages.length;
  const publishedReports = reportCards.filter((r) => r.status === 'published' || r.status === 'ready').length;

  const tabs: {
    id: FormUasTab;
    label: string;
    subLabel: string;
    icon: React.ReactNode;
    badgeCount?: number;
    badgeText?: string;
  }[] = [
    {
      id: 'grades',
      label: '1. Penilaian Santri UAS',
      subLabel: 'Nilai Akademik & Tahfidz',
      icon: <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />,
      badgeCount: totalGrades,
    },
    ...(siteSettings.enableBankSoal !== false
      ? [
          {
            id: 'exams' as FormUasTab,
            label: '2. Bank & Paket Soal UAS',
            subLabel: 'Berkas Soal & Soal PG/Essay',
            icon: <FileQuestion className="w-4 h-4 sm:w-5 sm:h-5" />,
            badgeCount: totalExams,
          },
        ]
      : []),
    {
      id: 'reports',
      label: '3. Penerbitan & Cetak Rapor',
      subLabel: 'Kelengkapan & Cetak PDF',
      icon: <FileCheck2 className="w-4 h-4 sm:w-5 sm:h-5" />,
      badgeCount: publishedReports,
      badgeText: `${publishedReports}/${reportCards.length} Siap`,
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. MASTER HEADER: FORM UAS (UJIAN AKHIR SEMESTER)                         */}
      {/* ========================================================================= */}
      <div
        className={`bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-5 sm:p-7 ${radius} shadow-lg relative overflow-hidden`}
      >
        {/* Background Islamic Pattern Accent */}
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
          <BookOpen className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold backdrop-blur-xs border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Modul Terpadu Evaluasi & Hasil Belajar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>FORM UAS</span>
              <span className="text-xs sm:text-sm font-medium px-2.5 py-0.5 rounded-md bg-white/10 text-emerald-100 border border-white/15">
                Ujian Akhir Semester
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Portal satu pintu untuk seluruh tahapan evaluasi semester: mulai dari{' '}
              <strong className="text-white">Input Penilaian Akademik & Tahfidz</strong>,{' '}
              <strong className="text-white">Penyusunan Bank Soal UAS</strong>, hingga{' '}
              <strong className="text-white">Penerbitan & Cetak Rapor Digital Santri</strong>.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center">
              <span className="text-[11px] text-emerald-200/90 block font-medium">Nilai Terinput</span>
              <span className="text-lg sm:text-xl font-black text-white">{totalGrades}</span>
              <span className="text-[10px] text-emerald-300 block">Akademik & Tahfidz</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center">
              <span className="text-[11px] text-emerald-200/90 block font-medium">Paket Soal</span>
              <span className="text-lg sm:text-xl font-black text-white">{totalExams}</span>
              <span className="text-[10px] text-emerald-300 block">Kisi-kisi & Naskah</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] text-emerald-200/90 block font-medium">Rapor Siap</span>
              <span className="text-lg sm:text-xl font-black text-white">{publishedReports}</span>
              <span className="text-[10px] text-emerald-300 block">Tahun {academicYear}</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SUBTAB SWITCHER (Penilaian, Bank Soal, Rapor)                           */}
        {/* ========================================================================= */}
        <div className="mt-6 pt-4 border-t border-white/15 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = formUasTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFormUasTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-emerald-950 shadow-md scale-102 ring-2 ring-emerald-300'
                    : 'bg-white/10 text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <div className={isActive ? 'text-emerald-700' : 'text-emerald-300'}>
                  {tab.icon}
                </div>
                <div className="text-left leading-tight">
                  <div className="font-bold">{tab.label}</div>
                  <div
                    className={`text-[10px] font-normal hidden sm:block ${
                      isActive ? 'text-emerald-800' : 'text-emerald-200/80'
                    }`}
                  >
                    {tab.subLabel}
                  </div>
                </div>
                {tab.badgeCount !== undefined && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {tab.badgeText || tab.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ACTIVE SUBTAB CONTENT VIEW                                             */}
      {/* ========================================================================= */}
      <div className="transition-all duration-150">
        {formUasTab === 'grades' && (
          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-3.5 rounded-xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  <strong>Tahap 1 FORM UAS:</strong> Masukkan nilai ujian akademik per mata pelajaran dan catatan setoran hafalan tahfidz santri.
                </span>
              </div>
              <button
                onClick={() => setFormUasTab('reports')}
                className="hidden md:flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
              >
                <span>Lanjut ke Cetak Rapor</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <GradesView />
          </div>
        )}

        {formUasTab === 'exams' && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 p-3.5 rounded-xl flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>
                  <strong>Tahap 2 FORM UAS:</strong> Siapkan dan cetak naskah soal ujian semester santri, berkas PDF kisi-kisi, atau paket soal pilihan ganda & essay.
                </span>
              </div>
              <button
                onClick={() => setFormUasTab('grades')}
                className="hidden md:flex items-center gap-1 font-bold text-blue-700 dark:text-blue-300 hover:underline cursor-pointer"
              >
                <span>Lihat Nilai Santri</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <ExamsView />
          </div>
        )}

        {formUasTab === 'reports' && (
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 p-3.5 rounded-xl flex items-center justify-between text-xs text-purple-900 dark:text-purple-200">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>
                  <strong>Tahap 3 FORM UAS:</strong> Periksa kelengkapan rapor semester, catatan wali kelas, predikat sikap, ekstrakurikuler, dan cetak rapor digital santri resmi.
                </span>
              </div>
              <button
                onClick={() => setFormUasTab('grades')}
                className="hidden md:flex items-center gap-1 font-bold text-purple-700 dark:text-purple-300 hover:underline cursor-pointer"
              >
                <span>Edit Nilai Santri</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <ReportCardView />
          </div>
        )}
      </div>
    </div>
  );
};
