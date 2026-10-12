import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ReportCardRecord, ThemeColor } from '../types';
import {
  getRadiusClass,
  getReportThemeStyles,
  angkaTerbilang,
  evaluateGradePredicate,
} from '../utils/theme';
import { BrandLogoIcon, OfficialKopSurat } from '../components/BrandLogoIcon';
import { PdfSettingsModal, PdfSettingsTabId } from '../components/PdfSettingsModal';
import {
  PDF_FRAME_PRESETS,
  getPdfSheetBorderStyle,
  PdfPageFrameOverlay,
  getHtmlExportFrameMarkup,
} from '../components/PdfPageFrame';
import { exportElementsToPdf, printElementsInIsolatedFrame } from '../utils/pdfExport';
import {
  FileCheck2,
  Printer,
  Edit3,
  Search,
  Filter,
  Sparkles,
  Download,
  AlertCircle,
  Plus,
  Trash2,
  X,
  Save,
  Palette,
  FileText,
  FileCode,
  Check,
  Sliders,
  Frame,
} from 'lucide-react';

export const ReportCardView: React.FC = () => {
  const {
    currentUser,
    classes,
    students,
    subjects,
    grades,
    tahfidzGrades,
    reportCards,
    saveReportCard,
    deleteReportCard,
    generateClassReportCards,
    saveBulkGrades,
    updateGrade,
    deleteGrade,
    saveBulkTahfidz,
    academicYear,
    siteSettings,
    themeClasses,
    themeSettings,
    updateThemeSettings,
    setIsThemeModalOpen,
    showToast,
  } = useApp();

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const radius = getRadiusClass(themeSettings.borderRadius);
  const reportStyles = getReportThemeStyles(themeSettings);
  const kkmValue = siteSettings.kkmDefault ?? 70;

  // Helper to classify Pelajaran Agama vs Pelajaran Umum
  const isReligiousSubject = (
    sub?: { name?: string; category?: string },
    fallbackName = ''
  ): boolean => {
    if (sub?.category === 'Diniyah') return true;
    const name = (sub?.name || fallbackName).toLowerCase();
    return (
      name.includes('arab') ||
      name.includes('fiqih') ||
      name.includes('fikih') ||
      name.includes('hadist') ||
      name.includes('hadits') ||
      name.includes('tauhid') ||
      name.includes('aqidah') ||
      name.includes('akidah') ||
      name.includes('tarikh') ||
      name.includes('tashrif') ||
      name.includes('tasrif') ||
      name.includes('nahwu') ||
      name.includes('shorof') ||
      name.includes('tajwid') ||
      name.includes('tahfidz') ||
      name.includes('tahfiz') ||
      name.includes('qur') ||
      name.includes('adab') ||
      name.includes('akhlak') ||
      name.includes('mustholah') ||
      name.includes('hafdo') ||
      name.includes('thibun') ||
      name.includes('ttb') ||
      name.includes('diniyah') ||
      name.includes('agama')
    );
  };

  const religiousSubjects = useMemo(
    () => subjects.filter((s) => isReligiousSubject(s)),
    [subjects]
  );
  const generalSubjects = useMemo(
    () => subjects.filter((s) => !isReligiousSubject(s)),
    [subjects]
  );

  // Precision Filters (Supports 'all' for Semua Kelas)
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(() =>
    siteSettings.defaultSemester === 2 ? 2 : 1
  );
  React.useEffect(() => {
    setSelectedSemester(siteSettings.defaultSemester === 2 ? 2 : 1);
  }, [siteSettings.defaultSemester]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showReportThemeBar, setShowReportThemeBar] = useState<boolean>(false);

  // Modals
  const [previewStudentId, setPreviewStudentId] = useState<number | null>(null);
  const [isBatchPrinting, setIsBatchPrinting] = useState<boolean>(false);
  const [editingReport, setEditingReport] = useState<ReportCardRecord | null>(null);
  const [editStudentGrades, setEditStudentGrades] = useState<Record<number, string>>({});
  const [editTahfidzScore, setEditTahfidzScore] = useState<string>('');
  const [editTajweedScore, setEditTajweedScore] = useState<string>('');
  const [editorActiveTab, setEditorActiveTab] = useState<
    'agama' | 'umum' | 'attendance_notes' | 'signatures'
  >('agama');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isPdfSettingsOpen, setIsPdfSettingsOpen] = useState<boolean>(false);
  const [pdfSettingsInitialTab, setPdfSettingsInitialTab] =
    useState<PdfSettingsTabId>('kop_logos');

  const openPdfSettings = (tab: PdfSettingsTabId = 'kop_logos') => {
    setPdfSettingsInitialTab(tab);
    setIsPdfSettingsOpen(true);
  };

  const singleSheetWrapperRef = useRef<HTMLDivElement>(null);
  const batchSheetsWrapperRef = useRef<HTMLDivElement>(null);

  const pdfExportOptions = useMemo(
    () => ({
      paperSize: reportStyles.paperSize,
      orientation: reportStyles.orientation,
      marginSize: reportStyles.marginSize,
      quality: reportStyles.pdfQuality,
      singlePageFit: reportStyles.singlePageFit,
    }),
    [
      reportStyles.paperSize,
      reportStyles.orientation,
      reportStyles.marginSize,
      reportStyles.pdfQuality,
      reportStyles.singlePageFit,
    ]
  );

  const handleDownloadPdfFromContainer = async (
    containerEl: HTMLElement | null,
    filename: string
  ) => {
    if (!containerEl || isGeneratingPdf) return;
    const sheets = Array.from(containerEl.querySelectorAll('.printable-sheet')) as HTMLElement[];
    if (sheets.length === 0) return;

    setIsGeneratingPdf(true);
    showToast('Sedang menyusun dokumen PDF sesuai pengaturan...', 'info');
    try {
      await exportElementsToPdf(sheets, filename, pdfExportOptions);
      showToast(`File PDF "${filename}.pdf" berhasil diunduh!`, 'success');
    } catch (err) {
      showToast('Gagal membuat PDF, silakan coba tombol Print Browser.', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrintFromContainer = async (
    containerEl: HTMLElement | null,
    docTitle: string
  ) => {
    if (!containerEl) return;
    const sheets = Array.from(containerEl.querySelectorAll('.printable-sheet')) as HTMLElement[];
    if (sheets.length === 0) return;
    await printElementsInIsolatedFrame(sheets, docTitle, pdfExportOptions);
  };

  // Active Class Students (supports 'all' for Semua Kelas)
  const classStudents = useMemo(() => {
    if (!selectedClassId || selectedClassId === 'all') return students;
    const clsId = parseInt(selectedClassId, 10);
    return students.filter((s) => Number(s.classId) === clsId);
  }, [students, selectedClassId]);

  // Current Class Object (null when 'all' is selected)
  const currentClass = useMemo(() => {
    if (!selectedClassId || selectedClassId === 'all') return null;
    const clsId = parseInt(selectedClassId, 10);
    return classes.find((c) => Number(c.id) === clsId) || null;
  }, [classes, selectedClassId]);

  // Student count per class for accurate rank display
  const classStudentCountsMap = useMemo(() => {
    const counts: Record<number, number> = {};
    students.forEach((st) => {
      const cId = Number(st.classId);
      counts[cId] = (counts[cId] || 0) + 1;
    });
    return counts;
  }, [students]);

  // Rank calculation per class (so rank is always accurate within each student's class)
  const classRanksMap = useMemo(() => {
    const ranks: Record<number, number> = {};
    const studentsByClass: Record<number, typeof students> = {};
    students.forEach((st) => {
      const cId = Number(st.classId);
      if (!studentsByClass[cId]) studentsByClass[cId] = [];
      studentsByClass[cId].push(st);
    });

    Object.values(studentsByClass).forEach((clsStudents) => {
      const studentScoreList = clsStudents
        .map((st) => {
          const stGrades = grades.filter(
            (g) =>
              Number(g.studentId) === Number(st.id) &&
              Number(g.semester) === Number(selectedSemester)
          );
          const stTahfidz = tahfidzGrades.find(
            (t) =>
              Number(t.studentId) === Number(st.id) &&
              Number(t.semester) === Number(selectedSemester)
          );
          const scores = [
            ...stGrades.map((g) => Number(g.score)),
            ...(stTahfidz ? [Number(stTahfidz.totalScore)] : []),
          ];
          const total = scores.reduce((sum, sc) => sum + sc, 0);
          const avg = scores.length > 0 ? total / scores.length : 0;
          return { studentId: st.id, total, avg };
        })
        .sort((a, b) => b.avg - a.avg || b.total - a.total);

      studentScoreList.forEach((item, idx) => {
        ranks[item.studentId] = idx + 1;
      });
    });

    return ranks;
  }, [students, grades, tahfidzGrades, selectedSemester]);

  // Enriched Student Report Cards List (All in selected class or all classes)
  const allClassReportItems = useMemo(() => {
    return classStudents.map((st) => {
      const repId = `${st.id}_${selectedSemester}_${academicYear}`;
      const existingRecord = reportCards.find(
        (r) =>
          r.id === repId ||
          (Number(r.studentId) === Number(st.id) &&
            Number(r.semester) === Number(selectedSemester) &&
            r.academicYear === academicYear)
      );

      const studentGrades = grades
        .filter(
          (g) =>
            Number(g.studentId) === Number(st.id) &&
            Number(g.semester) === Number(selectedSemester)
        )
        .map((g) => {
          const sub = subjects.find((s) => Number(s.id) === Number(g.subjectId));
          return {
            ...g,
            subjectName: sub ? sub.name : `Mapel #${g.subjectId}`,
          };
        });

      const studentTahfidz = tahfidzGrades.find(
        (t) =>
          Number(t.studentId) === Number(st.id) &&
          Number(t.semester) === Number(selectedSemester)
      );

      const totalScore = studentGrades.reduce((sum, g) => sum + Number(g.score), 0);
      const averageScore =
        studentGrades.length > 0 ? (totalScore / studentGrades.length).toFixed(1) : '-';

      const stClass = classes.find((c) => Number(c.id) === Number(st.classId)) || null;

      return {
        student: st,
        studentClass: stClass,
        reportCard: existingRecord || null,
        studentGrades,
        gradesCount: studentGrades.length,
        averageScore,
        rank: classRanksMap[st.id] || 1,
        tahfidzGrade: studentTahfidz || null,
        status: (existingRecord ? existingRecord.status : 'draft') as
          | 'draft'
          | 'ready'
          | 'published',
      };
    });
  }, [
    classStudents,
    selectedSemester,
    academicYear,
    reportCards,
    grades,
    subjects,
    classes,
    tahfidzGrades,
    classRanksMap,
  ]);

  // Filtered list by search & status
  const studentReportsList = useMemo(() => {
    return allClassReportItems.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.student.name.toLowerCase().includes(q) ||
        item.student.nis.toLowerCase().includes(q)
      );
    });
  }, [allClassReportItems, statusFilter, searchQuery]);

  // Status Summary Counters
  const stats = useMemo(() => {
    const total = allClassReportItems.length;
    const ready = allClassReportItems.filter((s) => s.status === 'ready').length;
    const published = allClassReportItems.filter((s) => s.status === 'published').length;
    const drafts = allClassReportItems.filter((s) => s.status === 'draft').length;
    return { total, ready, published, drafts };
  }, [allClassReportItems]);

  // Quick Status Toggle on Card
  const handleToggleStatus = (studentId: number, newStatus: ReportCardRecord['status']) => {
    const repId = `${studentId}_${selectedSemester}_${academicYear}`;
    const st = students.find((s) => Number(s.id) === Number(studentId));
    const stClass = classes.find((c) => Number(c.id) === Number(st?.classId)) || currentClass;
    const existing = reportCards.find(
      (r) =>
        r.id === repId ||
        (Number(r.studentId) === Number(studentId) &&
          Number(r.semester) === Number(selectedSemester) &&
          r.academicYear === academicYear)
    );

    if (existing) {
      saveReportCard({ ...existing, status: newStatus });
    } else {
      const studentTahfidz = tahfidzGrades.find(
        (t) =>
          Number(t.studentId) === Number(studentId) &&
          Number(t.semester) === Number(selectedSemester)
      );
      const fresh: ReportCardRecord = {
        id: repId,
        studentId,
        classId: st ? Number(st.classId) : parseInt(selectedClassId, 10) || 1,
        semester: selectedSemester,
        academicYear,
        status: newStatus,
        attendance: { sick: 0, permission: 0, unexcused: 0 },
        teacherNotes: `Ananda ${st?.name || 'Santri'} menunjukkan akhlak yang mulia dan tekun dalam menuntut ilmu. Pertahankan semangat belajar dan hafalan Al-Qur'an.`,
        tahfidzNotes:
          studentTahfidz?.notes || 'Telah mengikuti ujian tahfidz & tajwid semester ini.',
        spiritualAttitude: 'A',
        spiritualDescription:
          'Sangat taat dalam menjalankan ibadah sholat berjamaah dan menjaga adab islami.',
        socialAttitude: 'A',
        socialDescription:
          'Santun, menghormati asatidz dan memiliki kepedulian tinggi terhadap sesama santri.',
        extracurriculars: [
          {
            name: 'Khitabah (Muhadharah Tiga Bahasa)',
            predicate: 'A',
            description: 'Aktif sebagai pembicara muhadharah mingguan.',
          },
          {
            name: 'Kepanduan HW / Pramuka',
            predicate: 'B',
            description: 'Disiplin dan bertanggung jawab dalam kegiatan regu.',
          },
        ],
        issuePlace: siteSettings.defaultIssuePlace || 'Bandung',
        issueDate: new Date().toISOString().split('T')[0],
        headmasterName: siteSettings.headmasterName || 'Muhammad Siroj, S.Pd.I',
        headmasterNip: siteSettings.headmasterNip || '19830715 200801 1 004',
        classTeacherName: stClass?.teacher || 'Wali Kelas',
        updatedAt: new Date().toISOString(),
      };
      saveReportCard(fresh);
    }
  };

  // Export Rekap Rapor ke CSV
  const handleExportReportCSV = () => {
    let csv =
      'Peringkat,NIS,Nama Santri,Kelas,Semester,Tahun Ajaran,Status Rapor,Rata-rata Nilai,Tahfidz,Sakit,Izin,Alpa,Catatan Wali Kelas\n';
    studentReportsList.forEach((item) => {
      const notes = (item.reportCard?.teacherNotes || '').replace(/"/g, '""');
      const tahfidzStr = item.tahfidzGrade
        ? `${item.tahfidzGrade.totalScore} (${item.tahfidzGrade.gradeLetter})`
        : '-';
      const clsName = item.studentClass?.name || currentClass?.name || '-';
      csv += `${item.rank},"${item.student.nis}","${item.student.name}","Kelas ${clsName}","${selectedSemester}","${academicYear}","${item.status}","${item.averageScore}","${tahfidzStr}",${item.reportCard?.attendance.sick || 0},${item.reportCard?.attendance.permission || 0},${item.reportCard?.attendance.unexcused || 0},"${notes}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Rekap_Rapor_${currentClass ? `Kelas_${currentClass.name}` : 'Semua_Kelas'}_Sem${selectedSemester}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Rekap CSV Rapor berhasil diunduh.', 'success');
  };

  // Grade predicate helper (configured via Super Admin)
  const getGradePredicate = (score: number) => {
    const evalPred = evaluateGradePredicate(score, siteSettings.gradeThresholds);
    return {
      letter: evalPred.letter,
      text: evalPred.text,
      desc: evalPred.desc,
    };
  };

  // Standalone HTML / DOC Generator for Downloading Report Cards
  const handleDownloadReportDocument = (
    targetStudents: typeof students,
    format: 'html' | 'doc',
    filenamePrefix: string
  ) => {
    if (targetStudents.length === 0) return;

    const fontStack =
      reportStyles.fontStyle === 'serif'
        ? "'Amiri', Georgia, 'Times New Roman', serif"
        : "'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";

    const { borderCss, borderRadiusCss, boxShadowCss } =
      getHtmlExportFrameMarkup(reportStyles);

    const thBg =
      reportStyles.tableStyle === 'clean' ? '#f8fafc' : reportStyles.lightBgHex;
    const thColor =
      reportStyles.tableStyle === 'clean' ? '#0f172a' : reportStyles.textHex;

    const pagesHtml = targetStudents
      .map((st, pageIdx) => {
        const repId = `${st.id}_${selectedSemester}_${academicYear}`;
        const rep = reportCards.find(
          (r) =>
            r.id === repId ||
            (Number(r.studentId) === Number(st.id) &&
              Number(r.semester) === Number(selectedSemester) &&
              r.academicYear === academicYear)
        );
        const stClass = classes.find((c) => Number(c.id) === Number(st.classId)) || currentClass;
        const stClassCount = classStudentCountsMap[Number(st.classId)] || classStudents.length;

        const stGrades = grades
          .filter(
            (g) =>
              Number(g.studentId) === Number(st.id) &&
              Number(g.semester) === Number(selectedSemester)
          )
          .map((g) => {
            const sub = subjects.find((s) => Number(s.id) === Number(g.subjectId));
            return {
              ...g,
              subjectName: sub ? sub.name : `Mapel #${g.subjectId}`,
              isReligious: isReligiousSubject(sub, sub?.name || ''),
            };
          });
        const stTahfidz = tahfidzGrades.find(
          (t) =>
            Number(t.studentId) === Number(st.id) &&
            Number(t.semester) === Number(selectedSemester)
        );

        const religiousGradesList = stGrades.filter((g) => g.isReligious);
        const generalGradesList = stGrades.filter((g) => !g.isReligious);

        const includeTahfidzInAgama = reportStyles.showTahfidz && siteSettings.enableTahfidz;
        const tahfidzFinalScore = stTahfidz?.totalScore || 85;
        const tahfidzPred = getGradePredicate(tahfidzFinalScore);
        const rawTahfidzNote = (stTahfidz?.notes || rep?.tahfidzNotes || '').trim();
        const cleanedNote = rawTahfidzNote.replace(/\s*\([^)]*\)/g, '').trim();
        const juzMatch = cleanedNote.match(/juz\s*[0-9a-zA-Z\s.,&-]+/i);
        const tahfidzJuzLabel =
          !cleanedNote || cleanedNote.toLowerCase().includes('telah mengikuti ujian')
            ? 'Juz 30'
            : juzMatch
            ? juzMatch[0].trim()
            : cleanedNote;

        const religiousScoresArray = [
          ...(includeTahfidzInAgama ? [tahfidzFinalScore] : []),
          ...religiousGradesList.map((g) => g.score),
        ];

        const allScores = [...religiousScoresArray, ...generalGradesList.map((g) => g.score)];
        const totalAll = allScores.reduce((a, b) => a + b, 0);
        const avgG = allScores.length > 0 ? (totalAll / allScores.length).toFixed(1) : '-';
        const rank = classRanksMap[st.id] || '-';

        const tahfidzRowHtml = includeTahfidzInAgama
          ? `<tr>
              <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:center;font-size:12.5px;">1</td>
              <td style="border:1px solid #cbd5e1;padding:4px 10px;font-weight:600;font-size:12.5px;">
                <div>Tahfidz</div>
                <div style="font-size:10.5px;font-weight:600;color:#475569;margin-top:1px;">${tahfidzJuzLabel}</div>
              </td>
              <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:center;color:#475569;font-size:12.5px;font-weight:600;">${kkmValue}</td>
              <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:center;font-weight:700;font-size:13px;">${tahfidzFinalScore}</td>
              <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:center;font-weight:700;font-size:12.5px;">${stTahfidz?.gradeLetter || tahfidzPred.letter}</td>
              <td style="border:1px solid #cbd5e1;padding:4px 10px;font-size:12px;font-weight:600;font-style:italic;color:#334155;">${angkaTerbilang(tahfidzFinalScore)}</td>
            </tr>`
          : '';

        const religiousRowsHtml =
          religiousGradesList.length === 0 && !includeTahfidzInAgama
            ? `<tr><td colspan="6" style="padding:8px;text-align:center;color:#64748b;font-style:italic;font-size:12px;">Belum ada nilai pelajaran agama yang terinput.</td></tr>`
            : tahfidzRowHtml +
              religiousGradesList
                .map((g, idx) => {
                  const rowNum = (includeTahfidzInAgama ? 2 : 1) + idx;
                  const pred = getGradePredicate(g.score);
                  const rowBg =
                    reportStyles.tableStyle === 'striped' && rowNum % 2 === 0
                      ? 'background-color:#f8fafc;'
                      : '';
                  return `<tr style="${rowBg}">
                    <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:center;font-size:12.5px;">${rowNum}</td>
                    <td style="border:1px solid #cbd5e1;padding:4px 10px;font-weight:600;font-size:12.5px;">${g.subjectName}</td>
                    <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:center;color:#475569;font-size:12.5px;font-weight:600;">${kkmValue}</td>
                    <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:center;font-weight:700;font-size:13px;">${g.score}</td>
                    <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:center;font-weight:700;font-size:12.5px;">${pred.letter}</td>
                    <td style="border:1px solid #cbd5e1;padding:4px 10px;font-size:12px;font-weight:600;font-style:italic;color:#334155;">${angkaTerbilang(g.score)}</td>
                  </tr>`;
                })
                .join('');

        const generalRowsHtml =
          generalGradesList.length === 0
            ? `<tr><td colspan="6" style="padding:8px;text-align:center;color:#64748b;font-style:italic;font-size:12px;">Belum ada nilai pelajaran umum yang terinput.</td></tr>`
            : generalGradesList
                .map((g, idx) => {
                  const pred = getGradePredicate(g.score);
                  const rowBg =
                    reportStyles.tableStyle === 'striped' && idx % 2 === 1
                      ? 'background-color:#f8fafc;'
                      : '';
                  return `<tr style="${rowBg}">
                    <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:center;font-size:12.5px;">${idx + 1}</td>
                    <td style="border:1px solid #cbd5e1;padding:4px 10px;font-weight:600;font-size:12.5px;">${g.subjectName}</td>
                    <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:center;color:#475569;font-size:12.5px;font-weight:600;">${kkmValue}</td>
                    <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:center;font-weight:700;font-size:13px;">${g.score}</td>
                    <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:center;font-weight:700;font-size:12.5px;">${pred.letter}</td>
                    <td style="border:1px solid #cbd5e1;padding:4px 10px;font-size:12px;font-weight:600;font-style:italic;color:#334155;">${angkaTerbilang(g.score)}</td>
                  </tr>`;
                })
                .join('');

        const leftLogoSrc =
          themeSettings.customLogoUrl ||
          siteSettings.customLogoUrl ||
          '/src/assets/images/logo_baiturrahman_1791464090153.jpg';
        const rightLogoSrc =
          themeSettings.customRightLogoUrl ||
          siteSettings.customRightLogoUrl ||
          leftLogoSrc;
        const docTitleText =
          themeSettings.reportCustomTitle ||
          siteSettings.reportCustomTitle ||
          'LAPORAN HASIL EVALUASI BELAJAR SANTRI (RAPOR DIGITAL)';

        return `
        <div class="sheet" style="border:${borderCss};border-radius:${borderRadiusCss};box-shadow:${boxShadowCss};padding:14px 16px;background:#ffffff;color:#0f172a;font-family:${fontStack};max-width:210mm;margin:0 auto 12px auto;page-break-inside:avoid;break-inside:avoid;${
          pageIdx < targetStudents.length - 1 ? 'page-break-after:always;' : ''
        }">
          <!-- KOP SURAT (MENDUKUNG 2 GAMBAR KIRI & KANAN) -->
          <table style="width:100%;border-collapse:collapse;border-bottom:2.5px solid ${reportStyles.primaryHex};padding-bottom:6px;margin-bottom:6px;">
            <tr>
              ${
                reportStyles.showLeftLogo
                  ? `<td style="width:68px;vertical-align:middle;text-align:left;padding-right:8px;">
                      <img src="${leftLogoSrc}" alt="Logo Kiri" style="width:58px;height:58px;object-fit:contain;" />
                    </td>`
                  : `<td style="width:68px;"></td>`
              }
              <td style="vertical-align:middle;text-align:center;">
                <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#334155;">
                  ${siteSettings.foundationName || 'YAYASAN PENDIDIKAN ISLAM BAITURRAHMAN'}
                </div>
                <div style="font-size:21px;font-weight:900;text-transform:uppercase;color:${reportStyles.primaryHex};margin:1px 0;">
                  ${siteSettings.schoolName}
                </div>
                <div style="font-size:11.5px;color:#334155;">
                  ${siteSettings.schoolAddress || ''}
                </div>
                <div style="font-size:11px;color:#475569;margin-top:1px;">
                  Telp: ${siteSettings.schoolPhone || '-'} · Email: ${siteSettings.schoolEmail || '-'} · ${siteSettings.schoolNsmNpsn || ''}
                </div>
              </td>
              ${
                reportStyles.showRightLogo
                  ? `<td style="width:68px;vertical-align:middle;text-align:right;padding-left:8px;">
                      <img src="${rightLogoSrc}" alt="Logo Kanan" style="width:58px;height:58px;object-fit:contain;" />
                    </td>`
                  : `<td style="width:68px;"></td>`
              }
            </tr>
          </table>

          ${
            reportStyles.showBismillah
              ? `<div style="text-align:center;font-size:15px;margin-bottom:1px;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>`
              : ''
          }
          <div style="text-align:center;margin-bottom:6px;">
            <div style="font-size:15px;font-weight:800;text-transform:uppercase;text-decoration:underline;color:${reportStyles.primaryHex};">
              ${docTitleText}
            </div>
            <div style="font-size:12px;font-weight:600;color:#334155;margin-top:1px;">
              Tahun Ajaran ${academicYear} · Semester ${selectedSemester === 1 ? '1 (Ganjil)' : '2 (Genap)'}
            </div>
          </div>

          <!-- IDENTITAS -->
          <table style="width:100%;font-size:12.5px;margin-bottom:6px;border:1px solid #cbd5e1;background:#f8fafc;padding:4px 8px;border-radius:6px;">
            <tr>
              <td style="width:18%;color:#475569;font-weight:600;padding:1.5px 6px;">Nama Santri</td>
              <td style="width:34%;font-weight:800;padding:1.5px 6px;">: ${st.name}</td>
              <td style="width:18%;color:#475569;font-weight:600;padding:1.5px 6px;">Kelas / Tingkat</td>
              <td style="width:30%;font-weight:800;padding:1.5px 6px;">: Kelas ${stClass?.name || '-'}</td>
            </tr>
            <tr>
              <td style="color:#475569;font-weight:600;padding:1.5px 6px;">Nomor Induk (NIS)</td>
              <td style="font-weight:700;padding:1.5px 6px;">: ${st.nis}</td>
              <td style="color:#475569;font-weight:600;padding:1.5px 6px;">Wali Kelas</td>
              <td style="font-weight:700;padding:1.5px 6px;">: ${rep?.classTeacherName || stClass?.teacher || '-'}</td>
            </tr>
            <tr>
              <td style="color:#475569;font-weight:600;padding:1.5px 6px;">Tempat, Tgl Lahir</td>
              <td style="font-weight:600;padding:1.5px 6px;">: ${st.birthPlace}, ${st.birthDate}</td>
              ${
                reportStyles.showRank
                  ? `<td style="color:#475569;font-weight:600;padding:1.5px 6px;">Peringkat Kelas</td>
                     <td style="font-weight:800;color:${reportStyles.primaryHex};padding:1.5px 6px;">: Ke-${rank} dari ${stClassCount} Santri (Rata: ${avgG})</td>`
                  : `<td style="color:#475569;font-weight:600;padding:1.5px 6px;">Tahun Pelajaran</td><td style="font-weight:700;padding:1.5px 6px;">: ${academicYear}</td>`
              }
            </tr>
          </table>

          <!-- A. PELAJARAN AGAMA -->
          <div style="margin-bottom:6px;">
            <div style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.35;font-size:12.5px;font-weight:800;text-transform:uppercase;color:${reportStyles.primaryHex};background:${thBg};border:1px solid #cbd5e1;border-left:4px solid ${reportStyles.primaryHex};padding:3px 8px;margin-bottom:3px;border-radius:4px;">
              A. Pelajaran Agama
            </div>
            <table style="width:100%;table-layout:fixed;border-collapse:collapse;font-size:12.5px;">
              <colgroup>
                <col style="width:6%;" />
                <col style="width:34%;" />
                <col style="width:9%;" />
                <col style="width:10%;" />
                <col style="width:11%;" />
                <col style="width:30%;" />
              </colgroup>
              <thead>
                <tr style="background:${thBg};color:${thColor};">
                  <th style="border:1px solid #cbd5e1;padding:3.5px 6px;white-space:nowrap;">No</th>
                  <th style="border:1px solid #cbd5e1;padding:3.5px 8px;text-align:left;white-space:nowrap;">Mata Pelajaran</th>
                  <th style="border:1px solid #cbd5e1;padding:3.5px 6px;white-space:nowrap;">KKM</th>
                  <th style="border:1px solid #cbd5e1;padding:3.5px 6px;white-space:nowrap;">Nilai</th>
                  <th style="border:1px solid #cbd5e1;padding:3.5px 6px;white-space:nowrap;">Predikat</th>
                  <th style="border:1px solid #cbd5e1;padding:3.5px 8px;text-align:left;white-space:nowrap;">Terbilang (Huruf)</th>
                </tr>
              </thead>
              <tbody>
                ${religiousRowsHtml}
              </tbody>
            </table>
          </div>

          <!-- B. PELAJARAN UMUM -->
          <div style="margin-bottom:6px;">
            <div style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.35;font-size:12.5px;font-weight:800;text-transform:uppercase;color:${reportStyles.primaryHex};background:${thBg};border:1px solid #cbd5e1;border-left:4px solid ${reportStyles.primaryHex};padding:3px 8px;margin-bottom:3px;border-radius:4px;">
              B. Pelajaran Umum
            </div>
            <table style="width:100%;table-layout:fixed;border-collapse:collapse;font-size:12.5px;">
              <colgroup>
                <col style="width:6%;" />
                <col style="width:34%;" />
                <col style="width:9%;" />
                <col style="width:10%;" />
                <col style="width:11%;" />
                <col style="width:30%;" />
              </colgroup>
              <thead>
                <tr style="background:${thBg};color:${thColor};">
                  <th style="border:1px solid #cbd5e1;padding:3.5px 6px;white-space:nowrap;">No</th>
                  <th style="border:1px solid #cbd5e1;padding:3.5px 8px;text-align:left;white-space:nowrap;">Mata Pelajaran</th>
                  <th style="border:1px solid #cbd5e1;padding:3.5px 6px;white-space:nowrap;">KKM</th>
                  <th style="border:1px solid #cbd5e1;padding:3.5px 6px;white-space:nowrap;">Nilai</th>
                  <th style="border:1px solid #cbd5e1;padding:3.5px 6px;white-space:nowrap;">Predikat</th>
                  <th style="border:1px solid #cbd5e1;padding:3.5px 8px;text-align:left;white-space:nowrap;">Terbilang (Huruf)</th>
                </tr>
              </thead>
              <tbody>
                ${generalRowsHtml}
              </tbody>
              <tfoot>
                <tr style="background:#f8fafc;font-weight:700;font-size:12.5px;">
                  <td colspan="3" style="border:1px solid #cbd5e1;padding:3.5px 8px;text-align:right;">Jumlah Nilai Keseluruhan</td>
                  <td style="border:1px solid #cbd5e1;padding:3.5px 6px;text-align:center;font-weight:800;color:${reportStyles.primaryHex};">${totalAll}</td>
                  <td colspan="2" style="border:1px solid #cbd5e1;padding:3.5px 8px;">Rata-rata Nilai: <strong style="color:${reportStyles.primaryHex};">${avgG}</strong> (${avgG !== '-' ? angkaTerbilang(Number(avgG)) : '-'})</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- C. PRESENSI & CATATAN WALI KELAS -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:6px;">
            <tr>
              ${
                reportStyles.showAttendance
                  ? `<td style="width:42%;vertical-align:top;padding-right:10px;">
                      <div style="font-size:12px;font-weight:800;text-transform:uppercase;color:${reportStyles.primaryHex};margin-bottom:3px;">
                        C. Rekapitulasi Kehadiran
                      </div>
                      <table style="width:100%;border-collapse:collapse;font-size:12px;">
                        <tr>
                          <td style="border:1px solid #cbd5e1;padding:3px 8px;">Sakit (S)</td>
                          <td style="border:1px solid #cbd5e1;padding:3px 8px;text-align:center;font-weight:700;">${rep?.attendance.sick || 0} hari</td>
                        </tr>
                        <tr>
                          <td style="border:1px solid #cbd5e1;padding:3px 8px;">Izin (I)</td>
                          <td style="border:1px solid #cbd5e1;padding:3px 8px;text-align:center;font-weight:700;">${rep?.attendance.permission || 0} hari</td>
                        </tr>
                        <tr>
                          <td style="border:1px solid #cbd5e1;padding:3px 8px;">Tanpa Keterangan (A)</td>
                          <td style="border:1px solid #cbd5e1;padding:3px 8px;text-align:center;font-weight:700;">${rep?.attendance.unexcused || 0} hari</td>
                        </tr>
                      </table>
                    </td>`
                  : ''
              }
              <td style="vertical-align:top;">
                <div style="font-size:12px;font-weight:800;text-transform:uppercase;color:${reportStyles.primaryHex};margin-bottom:3px;">
                  ${reportStyles.showAttendance ? 'D.' : 'C.'} Catatan & Evaluasi Wali Kelas
                </div>
                <div style="border:1px solid #cbd5e1;padding:6px 10px;border-radius:6px;background:#f8fafc;font-style:italic;font-size:12px;line-height:1.4;min-height:54px;">
                  "${rep?.teacherNotes || 'Ananda menunjukkan kesungguhan dan akhlak terpuji. Terus tingkatkan semangat muraja\'ah dan ibadah harian.'}"
                </div>
              </td>
            </tr>
          </table>

          <!-- TANDA TANGAN -->
          <table style="width:100%;font-size:12px;text-align:center;margin-top:10px;margin-bottom:22px;padding-top:8px;border-top:1px solid #cbd5e1;">
            <tr>
              <td style="width:33%;vertical-align:top;padding:0 8px;">
                <div>Mengetahui,</div>
                <div style="font-weight:700;">Orang Tua / Wali Santri</div>
                <div style="height:82px;"></div>
                <div style="font-weight:700;text-decoration:underline;">( ${st.guardian || '.........................'} )</div>
                <div style="font-size:11px;color:#475569;">Wali Santri</div>
              </td>
              <td style="width:33%;vertical-align:top;padding:0 8px;">
                <div>Menyetujui,</div>
                <div style="font-weight:700;">Wali Kelas ${stClass?.name || ''}</div>
                <div style="height:82px;"></div>
                <div style="font-weight:700;text-decoration:underline;">( ${rep?.classTeacherName || stClass?.teacher || 'Wali Kelas'} )</div>
                <div style="font-size:11px;color:#475569;">Wali Kelas</div>
              </td>
              <td style="width:34%;vertical-align:top;padding:0 8px;">
                <div>${rep?.issuePlace || siteSettings.defaultIssuePlace || 'Bandung'}, ${rep?.issueDate || new Date().toLocaleDateString('id-ID')}</div>
                <div style="font-weight:700;">Kepala Madrasah</div>
                <div style="height:82px;"></div>
                <div style="font-weight:700;text-decoration:underline;">( ${rep?.headmasterName || siteSettings.headmasterName || 'Muhammad Siroj, S.Pd.I'} )</div>
                <div style="font-size:11px;color:#475569;">NIY/NIP: ${rep?.headmasterNip || siteSettings.headmasterNip || '-'}</div>
              </td>
            </tr>
          </table>
        </div>`;
      })
      .join('\n');

    const fullDoc = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' lang="id">
<head>
  <meta charset="utf-8" />
  <title>${filenamePrefix}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
  <style>
    @page { size: ${reportStyles.paperSize === 'F4' ? '215mm 330mm' : 'A4 portrait'}; margin: 3.5mm 4mm; }
    body { background: #f1f5f9; margin: 0; padding: 12px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .no-print-bar { display: none !important; }
      .sheet { margin: 0 !important; box-shadow: none !important; page-break-inside: avoid !important; break-inside: avoid !important; }
    }
  </style>
</head>
<body>
  ${
    format === 'html'
      ? `<div class="no-print-bar" style="max-width:210mm;margin:0 auto 16px auto;background:#0f172a;color:#fff;padding:10px 16px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;font-family:sans-serif;font-size:12px;">
          <span><strong>Dokumen Rapor Digital Resmi</strong> — ${siteSettings.schoolName}</span>
          <button onclick="window.print()" style="background:${reportStyles.primaryHex};color:#fff;border:none;padding:6px 14px;border-radius:6px;font-weight:700;cursor:pointer;">Cetak / Simpan PDF</button>
        </div>`
      : ''
  }
  ${pagesHtml}
</body>
</html>`;

    const mimeType =
      format === 'doc'
        ? 'application/msword;charset=utf-8'
        : 'text/html;charset=utf-8';
    const ext = format === 'doc' ? 'doc' : 'html';
    const blob = new Blob(['\ufeff', fullDoc], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `${filenamePrefix.replace(/[^a-zA-Z0-9_-]/g, '_')}.${ext}`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(
      `Rapor berhasil diunduh dalam format .${ext.toUpperCase()} (${targetStudents.length} santri).`,
      'success'
    );
  };

  // Open Edit Modal for a Student's Report Card
  const handleOpenEdit = (studentId: number) => {
    const repId = `${studentId}_${selectedSemester}_${academicYear}`;
    const st = students.find((s) => Number(s.id) === Number(studentId));
    const stClass = classes.find((c) => Number(c.id) === Number(st?.classId)) || currentClass;
    const existing = reportCards.find(
      (r) =>
        r.id === repId ||
        (Number(r.studentId) === Number(studentId) &&
          Number(r.semester) === Number(selectedSemester) &&
          r.academicYear === academicYear)
    );
    const studentTahfidz = tahfidzGrades.find(
      (t) =>
        Number(t.studentId) === Number(studentId) &&
        Number(t.semester) === Number(selectedSemester)
    );

    // Load student's academic grades for this semester
    const stGrades = grades.filter(
      (g) =>
        Number(g.studentId) === Number(studentId) &&
        Number(g.semester) === Number(selectedSemester)
    );
    const gradeMap: Record<number, string> = {};
    stGrades.forEach((g) => {
      gradeMap[Number(g.subjectId)] = g.score.toString();
    });
    setEditStudentGrades(gradeMap);

    setEditTahfidzScore(studentTahfidz ? studentTahfidz.tahfidzScore.toString() : '');
    setEditTajweedScore(studentTahfidz ? studentTahfidz.tajweedScore.toString() : '');
    setEditorActiveTab('agama');

    if (existing) {
      setEditingReport({
        ...existing,
        tahfidzNotes:
          studentTahfidz?.notes ||
          existing.tahfidzNotes ||
          'Juz 30',
      });
    } else {
      const fresh: ReportCardRecord = {
        id: repId,
        studentId,
        classId: st ? Number(st.classId) : parseInt(selectedClassId, 10) || 1,
        semester: selectedSemester,
        academicYear,
        status: 'draft',
        attendance: { sick: 0, permission: 0, unexcused: 0 },
        teacherNotes: `Ananda ${st?.name || 'Santri'} menunjukkan akhlak yang mulia dan tekun dalam menuntut ilmu. Pertahankan semangat belajar dan hafalan Al-Qur'an.`,
        tahfidzNotes:
          studentTahfidz?.notes || 'Juz 30',
        spiritualAttitude: 'A',
        spiritualDescription: '',
        socialAttitude: 'A',
        socialDescription: '',
        extracurriculars: [],
        issuePlace: siteSettings.defaultIssuePlace || 'Bandung',
        issueDate: new Date().toISOString().split('T')[0],
        headmasterName: siteSettings.headmasterName || 'Muhammad Siroj, S.Pd.I',
        headmasterNip: siteSettings.headmasterNip || '19830715 200801 1 004',
        classTeacherName: stClass?.teacher || 'Wali Kelas',
        updatedAt: new Date().toISOString(),
      };
      setEditingReport(fresh);
    }
  };

  // Helper to persist current editingReport + grades + tahfidz to database
  const persistEditingReportToDatabase = (reportToSave: ReportCardRecord, showNotification = false) => {
    // 1. Save Report Card metadata
    saveReportCard(reportToSave);

    // 2. Save Tahfidz & Tajwid unified inside Pelajaran Agama (only if entered, max 90)
    if (editTahfidzScore.trim() !== '' && editTajweedScore.trim() !== '') {
      const tfz = Math.min(90, Math.max(0, parseFloat(editTahfidzScore)));
      const tjw = Math.min(90, Math.max(0, parseFloat(editTajweedScore)));
      if (!isNaN(tfz) && !isNaN(tjw) && tfz >= 0 && tjw >= 0) {
        saveBulkTahfidz(reportToSave.classId, reportToSave.semester, [
          {
            studentId: reportToSave.studentId,
            notes: (reportToSave.tahfidzNotes || '').trim(),
            tahfidzScore: tfz,
            tajweedScore: tjw,
          },
        ]);
      }
    }

    // 3. Save any updated/added Pelajaran Agama & Pelajaran Umum scores in one batch (max 90)
    const newScoresBatch: Record<number, { subjectId: number; score: number }> = {};
    Object.entries(editStudentGrades).forEach(([subIdStr, valStr]) => {
      const subId = parseInt(subIdStr, 10);
      const trimmed = valStr.trim();
      const existingGrade = grades.find(
        (g) =>
          Number(g.studentId) === Number(reportToSave.studentId) &&
          Number(g.subjectId) === subId &&
          Number(g.semester) === Number(reportToSave.semester)
      );

      if (trimmed === '') {
        if (existingGrade) {
          deleteGrade(existingGrade.id);
        }
        return;
      }

      const numScore = parseFloat(trimmed);
      if (!isNaN(numScore) && numScore >= 0) {
        const clampedScore = Math.min(90, Math.max(0, numScore));
        if (existingGrade) {
          if (existingGrade.score !== clampedScore) {
            updateGrade(existingGrade.id, clampedScore);
          }
        } else {
          newScoresBatch[subId] = { subjectId: subId, score: clampedScore };
        }
      }
    });

    Object.values(newScoresBatch).forEach(({ subjectId, score }) => {
      saveBulkGrades(subjectId, reportToSave.classId, reportToSave.semester, {
        [reportToSave.studentId]: score,
      });
    });

    if (showNotification) {
      showToast('Data rapor dan nilai santri otomatis tersimpan ke database.', 'success');
    }
  };

  // Automatic debounced database sync whenever any field in editingReport, tahfidz, or subject grades changes
  React.useEffect(() => {
    if (!editingReport) return;
    const timer = setTimeout(() => {
      persistEditingReportToDatabase(editingReport, false);
    }, 450);
    return () => clearTimeout(timer);
  }, [editingReport, editTahfidzScore, editTajweedScore, editStudentGrades]);

  // Save changes from Edit Modal (including Pelajaran Agama, Tahfidz, and Pelajaran Umum)
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;
    persistEditingReportToDatabase(editingReport, true);
    setEditingReport(null);
  };

  // Generate All Reports for Current Class (or All Classes when 'all' is selected)
  const handleBatchGenerate = () => {
    const clsId = !selectedClassId || selectedClassId === 'all' ? 0 : parseInt(selectedClassId, 10);
    generateClassReportCards(clsId, selectedSemester);
  };

  // Student Selected for Printable Preview
  const previewStudent = useMemo(() => {
    if (!previewStudentId) return null;
    return students.find((s) => Number(s.id) === Number(previewStudentId)) || null;
  }, [previewStudentId, students]);

  // Note templates for quick fill in editor
  const noteTemplates = [
    "Ananda memiliki semangat belajar dan hafalan Al-Qur'an yang sangat mengagumkan. Pertahankan keteladanan akhlak mulia ini.",
    "Menunjukkan kemajuan signifikan dalam penguasaan materi diniyah dan ketekunan muraja'ah hafalan. Terus istiqamah.",
    'Potensi akademik ananda sangat baik. Disarankan untuk lebih fokus dan disiplin dalam mengulang setoran hafalan di asrama.',
    'Alhamdulillah, ananda berakhlak santun, rajin beribadah dan disukai teman-temannya. Tingkatkan minat baca pada mata pelajaran umum.',
  ];

  // Helper to render official report card sheet with full dynamic theme customization, readable typography, and single-page fit
  const renderOfficialReportCardSheet = (st: (typeof students)[0], isBatch = false) => {
    const repId = `${st.id}_${selectedSemester}_${academicYear}`;
    const rep = reportCards.find(
      (r) =>
        r.id === repId ||
        (Number(r.studentId) === Number(st.id) &&
          Number(r.semester) === Number(selectedSemester) &&
          r.academicYear === academicYear)
    );
    const stClass = classes.find((c) => Number(c.id) === Number(st.classId)) || currentClass;
    const stClassCount = classStudentCountsMap[Number(st.classId)] || classStudents.length;

    const stGrades = grades
      .filter(
        (g) =>
          Number(g.studentId) === Number(st.id) &&
          Number(g.semester) === Number(selectedSemester)
      )
      .map((g) => {
        const sub = subjects.find((s) => Number(s.id) === Number(g.subjectId));
        return {
          ...g,
          subjectName: sub ? sub.name : `Mapel #${g.subjectId}`,
          isReligious: isReligiousSubject(sub, sub?.name || ''),
        };
      });
    const stTahfidz = tahfidzGrades.find(
      (t) =>
        Number(t.studentId) === Number(st.id) &&
        Number(t.semester) === Number(selectedSemester)
    );

    const religiousGradesList = stGrades.filter((g) => g.isReligious);
    const generalGradesList = stGrades.filter((g) => !g.isReligious);

    const includeTahfidzInAgama = reportStyles.showTahfidz && siteSettings.enableTahfidz;
    const tahfidzFinalScore = stTahfidz?.totalScore || 85;
    const tahfidzPred = getGradePredicate(tahfidzFinalScore);

    // Extract concise Juz-only label for Tahfidz subtitle on PDF
    const rawTahfidzNote = (stTahfidz?.notes || rep?.tahfidzNotes || '').trim();
    const cleanedTahfidzNote = rawTahfidzNote.replace(/\s*\([^)]*\)/g, '').trim();
    const juzRegexMatch = cleanedTahfidzNote.match(/juz\s*[0-9a-zA-Z\s.,&-]+/i);
    const tahfidzJuzOnly =
      !cleanedTahfidzNote || cleanedTahfidzNote.toLowerCase().includes('telah mengikuti ujian')
        ? 'Juz 30'
        : juzRegexMatch
        ? juzRegexMatch[0].trim()
        : cleanedTahfidzNote;

    const religiousScoresArray = [
      ...(includeTahfidzInAgama ? [tahfidzFinalScore] : []),
      ...religiousGradesList.map((g) => g.score),
    ];

    const allScores = [...religiousScoresArray, ...generalGradesList.map((g) => g.score)];
    const totalG = allScores.reduce((a, b) => a + b, 0);
    const avgG = allScores.length > 0 ? (totalG / allScores.length).toFixed(1) : '-';
    const rank = classRanksMap[st.id] || '-';

    const fontClass =
      reportStyles.fontStyle === 'serif' || reportStyles.fontStyle === 'classic'
        ? 'font-serif-report'
        : 'font-sans';

    const fontFamilyInline =
      reportStyles.fontStyle === 'classic'
        ? '"Times New Roman", Times, Georgia, serif'
        : reportStyles.fontStyle === 'poppins'
        ? '"Poppins", "Plus Jakarta Sans", sans-serif'
        : undefined;

    const sheetBorderStyle: React.CSSProperties = getPdfSheetBorderStyle(
      reportStyles,
      fontFamilyInline
    );

    const tableHeaderStyle: React.CSSProperties =
      reportStyles.tableStyle === 'clean'
        ? { backgroundColor: '#f8fafc', color: '#0f172a' }
        : reportStyles.tableStyle === 'bold_grid'
        ? { backgroundColor: reportStyles.primaryHex, color: '#ffffff' }
        : {
            backgroundColor: reportStyles.lightBgHex,
            color: reportStyles.textHex,
          };

    const cellBorderClass =
      reportStyles.tableStyle === 'bold_grid' ? 'border-slate-500' : 'border-slate-300';

    const rowPadClass =
      reportStyles.rowDensity === 'tight'
        ? 'px-1.5 py-[1px]'
        : reportStyles.rowDensity === 'normal'
        ? 'px-2 py-1'
        : reportStyles.rowDensity === 'relaxed'
        ? 'px-2.5 py-1.5'
        : 'px-2 py-0.5';

    const tableTextSizeClass =
      reportStyles.fontSize === 'sm'
        ? 'text-[11.5px]'
        : reportStyles.fontSize === 'lg'
        ? 'text-[13.5px]'
        : 'text-[12.5px]';

    const watermarkOpacityClass =
      reportStyles.watermarkOpacity === 'strong'
        ? 'opacity-[0.11]'
        : reportStyles.watermarkOpacity === 'medium'
        ? 'opacity-[0.065]'
        : 'opacity-[0.035]';

    const sheetMinHeightClass =
      reportStyles.orientation === 'landscape'
        ? 'min-h-[198mm]'
        : reportStyles.paperSize === 'F4'
        ? 'min-h-[326mm]'
        : reportStyles.paperSize === 'Legal'
        ? 'min-h-[346mm]'
        : 'min-h-[293mm]';

    const visibleTableColsCount =
      3 +
      (reportStyles.showKkm ? 1 : 0) +
      (reportStyles.showPredicate ? 1 : 0) +
      (reportStyles.showTerbilang ? 1 : 0);

    const sigSpacerClass =
      reportStyles.signatureHeight === 'compact'
        ? 'h-[54px]'
        : reportStyles.signatureHeight === 'spacious'
        ? 'h-[94px]'
        : 'h-[76px]';

    const sigBlockMinHClass =
      reportStyles.signatureHeight === 'compact'
        ? 'min-h-[112px]'
        : reportStyles.signatureHeight === 'spacious'
        ? 'min-h-[154px]'
        : 'min-h-[136px]';

    const visibleSigCount =
      (reportStyles.showParentSignature ? 1 : 0) +
      (reportStyles.showClassTeacherSignature ? 1 : 0) +
      (reportStyles.showHeadmasterSignature ? 1 : 0);

    const sigGridColsClass =
      visibleSigCount === 1
        ? 'grid-cols-1 max-w-xs mx-auto'
        : visibleSigCount === 2
        ? 'grid-cols-2'
        : 'grid-cols-3';

    const docMainTitle =
      themeSettings.reportCustomTitle ||
      siteSettings.reportCustomTitle ||
      'LAPORAN HASIL EVALUASI BELAJAR SANTRI (RAPOR DIGITAL)';

    const renderSubjectTableHead = () => (
      <thead>
        <tr style={tableHeaderStyle}>
          <th className={`border ${cellBorderClass} ${rowPadClass} text-center font-bold whitespace-nowrap w-[6%]`}>
            No
          </th>
          <th className={`border ${cellBorderClass} ${rowPadClass} text-left font-bold whitespace-nowrap`}>
            Mata Pelajaran
          </th>
          {reportStyles.showKkm && (
            <th className={`border ${cellBorderClass} ${rowPadClass} text-center font-bold whitespace-nowrap w-[9%]`}>
              KKM
            </th>
          )}
          <th className={`border ${cellBorderClass} ${rowPadClass} text-center font-bold whitespace-nowrap w-[10%]`}>
            Nilai
          </th>
          {reportStyles.showPredicate && (
            <th className={`border ${cellBorderClass} ${rowPadClass} text-center font-bold whitespace-nowrap w-[11%]`}>
              Predikat
            </th>
          )}
          {reportStyles.showTerbilang && (
            <th className={`border ${cellBorderClass} ${rowPadClass} text-left font-bold whitespace-nowrap w-[30%]`}>
              Terbilang (Huruf)
            </th>
          )}
        </tr>
      </thead>
    );

    return (
      <div
        key={st.id}
        style={sheetBorderStyle}
        className={`relative px-4 pt-2.5 pb-5 sm:px-5 sm:pt-3 sm:pb-6 rounded-xl bg-white text-slate-900 ${fontClass} ${sheetMinHeightClass} flex flex-col justify-start shadow-xs printable-sheet overflow-hidden ${
          isBatch ? 'page-break mb-4' : ''
        }`}
      >
        {/* Decorative Page Frame Overlay (Inner Lines, Corner Ornaments, Custom Frame) */}
        <PdfPageFrameOverlay reportStyles={reportStyles} />

        {/* Dynamic Background Watermark */}
        {reportStyles.showWatermark && (
          <div
            className={`pointer-events-none select-none absolute inset-0 flex items-center justify-center ${watermarkOpacityClass} z-0`}
          >
            <div
              className="text-5xl sm:text-6xl font-black uppercase tracking-widest -rotate-24 text-center px-8"
              style={{ color: reportStyles.primaryHex }}
            >
              {siteSettings.watermarkText || siteSettings.schoolName}
            </div>
          </div>
        )}

        <div className="relative z-10 flex-1 flex flex-col justify-start">
          {/* KOP MADRASAH RESMI (Mendukung 2 Gambar Kop Kiri & Kanan, 1 Gambar Kiri, Terpusat, & Split) */}
          <OfficialKopSurat />

          {/* Basmalah & Judul Rapor */}
          <div className="text-center mb-1.5">
            {reportStyles.showBismillah && (
              <div className="font-serif-report text-[14.5px] tracking-wide text-slate-800 leading-tight">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
            )}
            <h3
              className="text-[14.5px] font-extrabold tracking-wider uppercase underline decoration-1 underline-offset-4 leading-snug"
              style={{ color: reportStyles.primaryHex }}
            >
              {docMainTitle}
            </h3>
            <p className="text-xs text-slate-700 font-semibold">
              Tahun Ajaran {academicYear} · Semester{' '}
              {selectedSemester === 1 ? '1 (Ganjil)' : '2 (Genap)'}
            </p>
          </div>

          {/* IDENTITAS SANTRI (Tabel 2 Kolom Simetris & Presisi) */}
          <div className="mb-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50/80 border border-slate-300">
            <table className={`w-full ${tableTextSizeClass} border-collapse`}>
              <tbody>
                <tr>
                  <td className="text-slate-700 font-semibold py-0.5 w-[17%]">Nama Santri</td>
                  <td className="text-slate-500 py-0.5 w-[2%]">:</td>
                  <td className="font-extrabold text-slate-900 py-0.5 w-[33%] uppercase">{st.name}</td>
                  <td className="text-slate-700 font-semibold py-0.5 w-[17%]">Kelas / Rombel</td>
                  <td className="text-slate-500 py-0.5 w-[2%]">:</td>
                  <td className="font-extrabold text-slate-900 py-0.5 w-[29%]">
                    Kelas {stClass?.name || '-'}
                  </td>
                </tr>
                <tr>
                  <td className="text-slate-700 font-semibold py-0.5">Nomor Induk / NIS</td>
                  <td className="text-slate-500 py-0.5">:</td>
                  <td className="font-bold text-slate-900 font-mono py-0.5">{st.nis}</td>
                  <td className="text-slate-700 font-semibold py-0.5">Wali Kelas</td>
                  <td className="text-slate-500 py-0.5">:</td>
                  <td className="font-bold text-slate-800 py-0.5">
                    {rep?.classTeacherName || stClass?.teacher || '-'}
                  </td>
                </tr>
                <tr>
                  <td className="text-slate-700 font-semibold py-0.5">Tempat, Tgl. Lahir</td>
                  <td className="text-slate-500 py-0.5">:</td>
                  <td className="font-medium text-slate-800 py-0.5">
                    {st.birthPlace}, {st.birthDate}
                  </td>
                  <td className="text-slate-700 font-semibold py-0.5">
                    {reportStyles.showRank ? 'Peringkat Kelas' : 'Tahun Pelajaran'}
                  </td>
                  <td className="text-slate-500 py-0.5">:</td>
                  <td className="font-extrabold py-0.5" style={{ color: reportStyles.primaryHex }}>
                    {reportStyles.showRank
                      ? `Peringkat ${rank} dari ${stClassCount} Santri (Rata: ${avgG})`
                      : `${academicYear} (Sem. ${selectedSemester})`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* A. PELAJARAN AGAMA */}
          <div className="mb-1.5">
            <div
              className={`w-full px-2.5 py-0.5 mb-1 rounded-md font-extrabold ${tableTextSizeClass} uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis block leading-snug border`}
              style={{
                backgroundColor:
                  reportStyles.tableStyle === 'clean' ? '#f8fafc' : reportStyles.lightBgHex,
                color: reportStyles.primaryHex,
                borderColor: '#cbd5e1',
                borderLeft: `4px solid ${reportStyles.primaryHex}`,
              }}
            >
              A. Pelajaran Agama
            </div>
            <table className={`w-full table-fixed border-collapse border ${cellBorderClass} ${tableTextSizeClass}`}>
              {renderSubjectTableHead()}
              <tbody>
                {/* Unified Tahfidz Row inside Pelajaran Agama */}
                {includeTahfidzInAgama && (
                  <tr>
                    <td className={`border ${cellBorderClass} ${rowPadClass} text-center tabular-nums align-top`}>
                      1
                    </td>
                    <td className={`border ${cellBorderClass} ${rowPadClass} font-semibold text-slate-900`}>
                      <div className="leading-tight font-bold">Tahfidz</div>
                      <div className="text-[10.5px] font-semibold text-slate-600 leading-tight mt-0.5">
                        {tahfidzJuzOnly}
                      </div>
                    </td>
                    {reportStyles.showKkm && (
                      <td className={`border ${cellBorderClass} ${rowPadClass} text-center font-semibold text-slate-700 tabular-nums align-top`}>
                        {kkmValue}
                      </td>
                    )}
                    <td className={`border ${cellBorderClass} ${rowPadClass} text-center font-bold text-slate-900 tabular-nums align-top`}>
                      {tahfidzFinalScore}
                    </td>
                    {reportStyles.showPredicate && (
                      <td className={`border ${cellBorderClass} ${rowPadClass} text-center font-bold text-slate-900 align-top`}>
                        {stTahfidz?.gradeLetter || tahfidzPred.letter}
                      </td>
                    )}
                    {reportStyles.showTerbilang && (
                      <td className={`border ${cellBorderClass} ${rowPadClass} font-semibold italic text-slate-800 leading-snug truncate align-top`}>
                        {angkaTerbilang(tahfidzFinalScore)}
                      </td>
                    )}
                  </tr>
                )}

                {religiousGradesList.length === 0 && !includeTahfidzInAgama ? (
                  <tr>
                    <td
                      colSpan={visibleTableColsCount}
                      className={`border ${cellBorderClass} p-1.5 text-center text-slate-500 italic text-xs`}
                    >
                      Belum ada nilai pelajaran agama yang terinput untuk semester ini.
                    </td>
                  </tr>
                ) : (
                  religiousGradesList.map((g, idx) => {
                    const rowNumber = (includeTahfidzInAgama ? 2 : 1) + idx;
                    const pred = getGradePredicate(g.score);
                    const stripedClass =
                      reportStyles.tableStyle === 'striped' && rowNumber % 2 === 0
                        ? 'bg-slate-50/80'
                        : '';
                    return (
                      <tr key={g.id} className={stripedClass}>
                        <td className={`border ${cellBorderClass} ${rowPadClass} text-center tabular-nums`}>
                          {rowNumber}
                        </td>
                        <td className={`border ${cellBorderClass} ${rowPadClass} font-semibold text-slate-900 truncate`}>
                          {g.subjectName}
                        </td>
                        {reportStyles.showKkm && (
                          <td className={`border ${cellBorderClass} ${rowPadClass} text-center font-semibold text-slate-700 tabular-nums`}>
                            {kkmValue}
                          </td>
                        )}
                        <td className={`border ${cellBorderClass} ${rowPadClass} text-center font-bold text-slate-900 tabular-nums`}>
                          {g.score}
                        </td>
                        {reportStyles.showPredicate && (
                          <td className={`border ${cellBorderClass} ${rowPadClass} text-center font-bold text-slate-900`}>
                            {pred.letter}
                          </td>
                        )}
                        {reportStyles.showTerbilang && (
                          <td className={`border ${cellBorderClass} ${rowPadClass} font-semibold italic text-slate-800 leading-snug truncate`}>
                            {angkaTerbilang(g.score)}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* B. PELAJARAN UMUM */}
          <div className="mb-1.5">
            <div
              className={`w-full px-2.5 py-0.5 mb-1 rounded-md font-extrabold ${tableTextSizeClass} uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis block leading-snug border`}
              style={{
                backgroundColor:
                  reportStyles.tableStyle === 'clean' ? '#f8fafc' : reportStyles.lightBgHex,
                color: reportStyles.primaryHex,
                borderColor: '#cbd5e1',
                borderLeft: `4px solid ${reportStyles.primaryHex}`,
              }}
            >
              B. Pelajaran Umum
            </div>
            <table className={`w-full table-fixed border-collapse border ${cellBorderClass} ${tableTextSizeClass}`}>
              {renderSubjectTableHead()}
              <tbody>
                {generalGradesList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleTableColsCount}
                      className={`border ${cellBorderClass} p-1.5 text-center text-slate-500 italic text-xs`}
                    >
                      Belum ada nilai pelajaran umum yang terinput untuk semester ini.
                    </td>
                  </tr>
                ) : (
                  generalGradesList.map((g, idx) => {
                    const pred = getGradePredicate(g.score);
                    const stripedClass =
                      reportStyles.tableStyle === 'striped' && idx % 2 === 1
                        ? 'bg-slate-50/80'
                        : '';
                    return (
                      <tr key={g.id} className={stripedClass}>
                        <td className={`border ${cellBorderClass} ${rowPadClass} text-center tabular-nums`}>
                          {idx + 1}
                        </td>
                        <td className={`border ${cellBorderClass} ${rowPadClass} font-semibold text-slate-900 truncate`}>
                          {g.subjectName}
                        </td>
                        {reportStyles.showKkm && (
                          <td className={`border ${cellBorderClass} ${rowPadClass} text-center font-semibold text-slate-700 tabular-nums`}>
                            {kkmValue}
                          </td>
                        )}
                        <td className={`border ${cellBorderClass} ${rowPadClass} text-center font-bold text-slate-900 tabular-nums`}>
                          {g.score}
                        </td>
                        {reportStyles.showPredicate && (
                          <td className={`border ${cellBorderClass} ${rowPadClass} text-center font-bold text-slate-900`}>
                            {pred.letter}
                          </td>
                        )}
                        {reportStyles.showTerbilang && (
                          <td className={`border ${cellBorderClass} ${rowPadClass} font-semibold italic text-slate-800 leading-snug truncate`}>
                            {angkaTerbilang(g.score)}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr className={`bg-slate-50 font-bold ${tableTextSizeClass}`}>
                  <td
                    colSpan={reportStyles.showKkm ? 3 : 2}
                    className={`border ${cellBorderClass} ${rowPadClass} text-right`}
                  >
                    Jumlah Nilai Keseluruhan: <strong style={{ color: reportStyles.primaryHex }}>{totalG}</strong>
                  </td>
                  <td
                    colSpan={Math.max(1, visibleTableColsCount - (reportStyles.showKkm ? 3 : 2))}
                    className={`border ${cellBorderClass} ${rowPadClass} text-slate-700 truncate`}
                  >
                    Rata-rata:{' '}
                    <strong style={{ color: reportStyles.primaryHex }}>{avgG}</strong>{' '}
                    <span className="italic">
                      ({avgG !== '-' ? angkaTerbilang(Number(avgG)) : '-'})
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* C & D: REKAPITULASI KEHADIRAN & CATATAN WALI KELAS */}
          {(reportStyles.showAttendance || reportStyles.showTeacherNotes) && (
            <div className="grid grid-cols-12 gap-2.5 mb-1.5 text-[12px]">
              {reportStyles.showAttendance && (
                <div className={reportStyles.showTeacherNotes ? 'col-span-5' : 'col-span-12'}>
                  <h4
                    className="font-extrabold uppercase tracking-wider mb-0.5 text-[12px]"
                    style={{ color: reportStyles.primaryHex }}
                  >
                    C. Rekapitulasi Kehadiran
                  </h4>
                  <table className={`w-full border-collapse border ${cellBorderClass} text-[12px]`}>
                    <thead>
                      <tr style={tableHeaderStyle}>
                        <th className={`border ${cellBorderClass} px-2 py-0.5 text-left font-bold`}>
                          Keterangan
                        </th>
                        <th className={`border ${cellBorderClass} px-2 py-0.5 text-center w-24 font-bold`}>
                          Jumlah
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={`border ${cellBorderClass} px-2 py-0.5 font-medium`}>Sakit (S)</td>
                        <td className={`border ${cellBorderClass} px-2 py-0.5 text-center font-bold tabular-nums`}>
                          {rep?.attendance.sick || 0} hari
                        </td>
                      </tr>
                      <tr>
                        <td className={`border ${cellBorderClass} px-2 py-0.5 font-medium`}>Izin (I)</td>
                        <td className={`border ${cellBorderClass} px-2 py-0.5 text-center font-bold tabular-nums`}>
                          {rep?.attendance.permission || 0} hari
                        </td>
                      </tr>
                      <tr>
                        <td className={`border ${cellBorderClass} px-2 py-0.5 font-medium`}>Tanpa Keterangan (A)</td>
                        <td className={`border ${cellBorderClass} px-2 py-0.5 text-center font-bold tabular-nums`}>
                          {rep?.attendance.unexcused || 0} hari
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {reportStyles.showTeacherNotes && (
                <div className={reportStyles.showAttendance ? 'col-span-7' : 'col-span-12'}>
                  <h4
                    className="font-extrabold uppercase tracking-wider mb-0.5 text-[12px]"
                    style={{ color: reportStyles.primaryHex }}
                  >
                    {reportStyles.showAttendance ? 'D.' : 'C.'} Catatan & Evaluasi Wali Kelas
                  </h4>
                  <div className="px-2.5 py-1.5 border border-slate-300 rounded-md italic bg-slate-50/70 text-[12px] text-slate-800 leading-snug min-h-[62px] flex items-center">
                    <span>
                      "
                      {rep?.teacherNotes ||
                        "Ananda menunjukkan kesungguhan dan akhlak terpuji. Terus tingkatkan semangat muraja'ah dan ibadah harian."}
                      "
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TANDA TANGAN RESMI */}
          {visibleSigCount > 0 && (
            <div className={`grid ${sigGridColsClass} gap-6 text-center text-[12px] pt-2.5 mt-2 pb-3 border-t border-slate-300 relative break-inside-avoid px-2`}>
              {reportStyles.showParentSignature && (
                <div className={`flex flex-col justify-between ${sigBlockMinHClass}`}>
                  <div>
                    <p className="text-slate-600 text-[11.5px]">Mengetahui,</p>
                    <p className="font-bold text-slate-800">Orang Tua / Wali Santri</p>
                  </div>
                  <div className={sigSpacerClass} />
                  <div>
                    <p className="font-bold underline text-slate-900">
                      ( {st.guardian || '.........................'} )
                    </p>
                    <p className="text-[11px] text-slate-600">Wali Santri</p>
                  </div>
                </div>
              )}

              {reportStyles.showClassTeacherSignature && (
                <div className={`flex flex-col justify-between ${sigBlockMinHClass}`}>
                  <div>
                    <p className="text-slate-600 text-[11.5px]">Menyetujui,</p>
                    <p className="font-bold text-slate-800">Wali Kelas {stClass?.name || ''}</p>
                  </div>
                  <div className={sigSpacerClass} />
                  <div>
                    <p className="font-bold underline text-slate-900">
                      ( {rep?.classTeacherName || stClass?.teacher || 'Wali Kelas'} )
                    </p>
                    <p className="text-[11px] text-slate-600">Wali Kelas</p>
                  </div>
                </div>
              )}

              {reportStyles.showHeadmasterSignature && (
                <div className={`flex flex-col justify-between ${sigBlockMinHClass} relative`}>
                  <div>
                    <p className="text-slate-600 text-[11.5px]">
                      {rep?.issuePlace || siteSettings.defaultIssuePlace || 'Bandung'},{' '}
                      {rep?.issueDate || new Date().toLocaleDateString('id-ID')}
                    </p>
                    <p className="font-bold text-slate-800">Kepala Madrasah</p>
                  </div>

                  <div className={sigSpacerClass} />

                  {/* Official Subtle Seal Watermark */}
                  {reportStyles.showSeal && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 top-7 w-[72px] h-[72px] border-2 rounded-full flex flex-col items-center justify-center pointer-events-none rotate-[-10deg] select-none opacity-20"
                      style={{
                        borderColor: reportStyles.primaryHex,
                        color: reportStyles.primaryHex,
                      }}
                    >
                      <div className="text-[5.5px] font-black uppercase tracking-wider text-center px-1 leading-tight line-clamp-2">
                        {siteSettings.schoolName}
                      </div>
                      <div
                        className="text-[5px] font-bold border-y my-0.5 px-1 uppercase tracking-widest"
                        style={{ borderColor: reportStyles.primaryHex }}
                      >
                        TERVERIFIKASI
                      </div>
                      <div className="text-[5px] font-semibold">RAPOR RESMI</div>
                    </div>
                  )}

                  <div className="relative z-10">
                    <p className="font-bold underline text-slate-900">
                      ( {rep?.headmasterName || siteSettings.headmasterName || 'Muhammad Siroj, S.Pd.I'} )
                    </p>
                    <p className="text-[11px] text-slate-600">
                      NIY/NIP: {rep?.headmasterNip || siteSettings.headmasterNip || '19830715 200801 1 004'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Meta / Verification Timestamp */}
          {reportStyles.showFooterMeta && (
            <div className="mt-auto pt-1.5 border-t border-slate-200 flex items-center justify-between text-[9.5px] text-slate-400 font-medium">
              <span>
                {siteSettings.schoolName} · Rapor Digital TA {academicYear} (Sem. {selectedSemester})
              </span>
              <span className="font-mono">
                NIS: {st.nis} · Dicetak: {new Date().toLocaleDateString('id-ID')}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Top Header & Precision Action Bar */}
      <div
        className={`bg-white ${radius.card} border border-slate-200 p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4`}
      >
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className={`w-5 h-5 ${themeClasses.primaryText}`} />
            <span>Pusat Rapor Digital, Kustomisasi Tema & Unduhan</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur tema tampilan rapor, sunting catatan santri, cetak PDF A4/F4, atau unduh berkas Rapor (.HTML & .DOC Word).
          </p>
        </div>

        {/* Precision Action Buttons (Uniform 36px height) */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => openPdfSettings('kop_logos')}
            className={`btn-precision w-full sm:w-auto border ${themeClasses.primaryLightBg} ${themeClasses.primaryText} ${themeClasses.primaryBorder} hover:opacity-90`}
            title="Atur Kop 2 Gambar (Kiri & Kanan), Kertas, Margin, dan Format PDF"
          >
            <Sliders className="w-3.5 h-3.5 text-current" />
            <span>Atur PDF & Kop</span>
          </button>

          <button
            type="button"
            onClick={() => openPdfSettings('frames_studio')}
            className="btn-precision w-full sm:w-auto bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/80"
            title="Pilih 17+ Gaya Bingkai Halaman PDF atau Buat Bingkai Sendiri"
          >
            <Frame className="w-3.5 h-3.5 text-current" />
            <span>Bingkai PDF</span>
          </button>

          <button
            type="button"
            onClick={handleExportReportCSV}
            className="btn-precision w-full sm:w-auto bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80"
            title="Unduh Rekap Nilai Rapor Kelas dalam Format CSV/Excel"
          >
            <Download className="w-3.5 h-3.5 text-current" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleDownloadReportDocument(
                classStudents,
                'doc',
                `Rapor_Kelas_${currentClass?.name || 'Semua'}_Sem${selectedSemester}`
              )
            }
            className="btn-precision w-full sm:w-auto bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80"
            title="Unduh Seluruh Rapor Kelas ini dalam format Microsoft Word (.DOC)"
          >
            <FileText className="w-3.5 h-3.5 text-current" />
            <span>Word Kelas</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBatchPrinting(true)}
            className="btn-precision w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-current" />
            <span>
              {currentClass
                ? `Cetak Kelas (${classStudents.length})`
                : `Cetak Semua (${classStudents.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={handleBatchGenerate}
            className={`btn-precision w-full sm:w-auto col-span-2 sm:col-span-1 ${themeClasses.primary} ${themeClasses.primaryHover} text-white shadow-2xs`}
          >
            <Sparkles className="w-3.5 h-3.5 text-current" />
            <span>Buat Rapor</span>
          </button>
        </div>
      </div>

      {/* Precision Filter & Status Bar */}
      <div className={`bg-white ${radius.card} border border-slate-200 p-3.5 shadow-2xs space-y-3`}>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Left: Class, Semester, Search */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 flex-1">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 mr-1">
              <Filter className={`w-4 h-4 ${themeClasses.primaryText}`} />
              <span>Filter:</span>
            </div>

            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="filter-control w-full sm:w-auto"
            >
              <option value="all">Semua Kelas ({classes.length} Kelas)</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id.toString()}>
                  Kelas {cls.name} (Wali: {cls.teacher})
                </option>
              ))}
            </select>

            {/* Precision Semester Segmented Filter */}
            <div className="filter-group grid grid-cols-2 sm:inline-flex w-full sm:w-auto">
              {([1, 2] as const).map((sem) => {
                const active = selectedSemester === sem;
                return (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => setSelectedSemester(sem)}
                    className={`filter-btn w-full sm:w-auto ${
                      active
                        ? `${themeClasses.primary} text-white shadow-2xs`
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Semester {sem}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px] sm:max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama santri / NIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-control w-full pl-8"
              />
            </div>
          </div>

          {/* Right: Status Filter Pills (Precision) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="filter-group grid grid-cols-2 sm:inline-flex w-full sm:w-auto">
              {[
                { id: 'all', label: 'Semua', count: stats.total },
                { id: 'ready', label: 'Siap Cetak', count: stats.ready },
                { id: 'published', label: 'Terbit', count: stats.published },
                { id: 'draft', label: 'Draft', count: stats.drafts },
              ].map((stTab) => {
                const isActive = statusFilter === stTab.id;
                return (
                  <button
                    key={stTab.id}
                    type="button"
                    onClick={() => setStatusFilter(stTab.id as any)}
                    className={`filter-btn w-full sm:w-auto ${
                      isActive
                        ? `${themeClasses.primary} text-white shadow-2xs`
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{stTab.label}</span>
                    <span
                      className={`filter-badge ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {stTab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {(selectedClassId !== 'all' || statusFilter !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedClassId('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="filter-reset-btn w-full sm:w-auto"
              >
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Report Cards Grid */}
      {studentReportsList.length === 0 ? (
        <div
          className={`bg-white ${radius.card} border border-slate-200 p-12 text-center shadow-2xs`}
        >
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">
            Tidak ada data rapor santri pada filter ini
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Ubah filter status/pencarian di atas, atau pilih kelas lainnya.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studentReportsList.map((item) => {
            return (
              <div
                key={item.student.id}
                className={`bg-white ${radius.card} border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg ${themeClasses.primaryLightBg} ${themeClasses.primaryText} flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border ${themeClasses.primaryBorder}`}
                      >
                        #{item.rank}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900">{item.student.name}</h3>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            Kelas {item.studentClass?.name || '-'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          NIS: <span className="font-mono">{item.student.nis}</span> · Wali:{' '}
                          {item.student.guardian}
                        </p>
                      </div>
                    </div>

                    {/* Cohesive Status Badge */}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border shrink-0 ${
                        item.status === 'published'
                          ? `${themeClasses.badgeBg} ${themeClasses.badgeText} ${themeClasses.primaryBorder}`
                          : item.status === 'ready'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.status === 'published'
                        ? 'Diterbitkan'
                        : item.status === 'ready'
                        ? 'Siap Cetak'
                        : 'Draft'}
                    </span>
                  </div>

                  {/* Summary Metric Chips */}
                  <div className="grid grid-cols-3 gap-2 text-center p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Mapel Dinilai</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {item.gradesCount} Mapel
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Rata-rata Nilai</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {item.averageScore}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tahfidz</span>
                      <span className={`font-bold ${themeClasses.primaryText} tabular-nums`}>
                        {item.tahfidzGrade
                          ? `${item.tahfidzGrade.totalScore} (${item.tahfidzGrade.gradeLetter})`
                          : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Connected Grades Preview from Halaman Nilai */}
                  {item.studentGrades.length > 0 && (
                    <div className="mb-3 p-2.5 rounded-lg bg-slate-50/70 border border-slate-200/80">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Nilai Mapel Terkoneksi (Semester {selectedSemester}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.studentGrades.map((g) => {
                          const pred = getGradePredicate(g.score);
                          return (
                            <span
                              key={g.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] text-slate-700"
                            >
                              <span className="font-medium truncate max-w-[110px]">
                                {g.subjectName}:
                              </span>
                              <strong className="text-slate-900 tabular-nums">{g.score}</strong>
                              <span className="text-[10px] font-bold text-slate-500">
                                ({pred.letter})
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Catatan Singkat Wali Kelas */}
                  <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80 mb-3">
                    <span className="font-semibold text-slate-800 block mb-0.5 text-[11px]">
                      Catatan Wali Kelas:
                    </span>
                    <p className="line-clamp-2 italic text-slate-500 text-[11px]">
                      "
                      {item.reportCard?.teacherNotes ||
                        'Belum ada catatan. Klik tombol Sunting untuk mengisi.'}
                      "
                    </p>
                  </div>
                </div>

                {/* Precision Card Action Buttons (Uniform 36px height) */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="contents sm:flex items-center gap-1.5">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleToggleStatus(
                          item.student.id,
                          e.target.value as ReportCardRecord['status']
                        )
                      }
                      className="filter-control w-full sm:w-auto bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700"
                      title="Ubah Status Rapor"
                    >
                      <option value="draft">Draft</option>
                      <option value="ready">Siap Cetak</option>
                      <option value="published">Terbit</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item.student.id)}
                      className="btn-precision w-full sm:w-auto text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-current" />
                      <span>Sunting</span>
                    </button>
                  </div>

                  <div className="contents sm:flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadReportDocument(
                          [item.student],
                          'doc',
                          `Rapor_${item.student.name}_Sem${selectedSemester}`
                        )
                      }
                      title="Unduh Rapor ke Microsoft Word (.DOC)"
                      className="btn-precision w-full sm:w-auto bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80"
                    >
                      <Download className="w-3.5 h-3.5 text-current" />
                      <span>Word</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewStudentId(item.student.id)}
                      className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white shadow-2xs`}
                    >
                      <Printer className="w-3.5 h-3.5 text-current" />
                      <span>Pratinjau</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: SUNTING RAPOR DIGITAL (AGAMA+TAHFIDZ, UMUM, KEHADIRAN, PENGESAHAN) */}
      {/* ============================================================ */}
      {editingReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className={`w-4 h-4 ${themeClasses.primaryText}`} />
                  <span>Sunting Lembar Rapor Digital</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Santri:{' '}
                  <strong>
                    {students.find((s) => s.id === editingReport.studentId)?.name}
                  </strong>{' '}
                  · Semester {editingReport.semester} ({editingReport.academicYear})
                </p>
              </div>
              <button
                onClick={() => setEditingReport(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Precision Sub-tabs inside editor (Full-width grid so tabs never clip) */}
            <div className="shrink-0 px-4 sm:px-6 py-2.5 border-b border-slate-200 bg-slate-100/90">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-200/75 rounded-lg border border-slate-200 w-full text-xs">
                {[
                  { id: 'agama', label: '1. Agama' },
                  { id: 'umum', label: '2. Umum' },
                  { id: 'attendance_notes', label: '3. Kehadiran' },
                  { id: 'signatures', label: '4. Pengesahan' },
                ].map((t) => {
                  const active = editorActiveTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setEditorActiveTab(t.id as any)}
                      className={`h-8 px-2.5 rounded-md font-semibold flex items-center justify-center transition-all cursor-pointer select-none leading-none ${
                        active
                          ? `${themeClasses.primary} text-white shadow-2xs`
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      <span className="truncate">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Body */}
            <form
              onSubmit={handleSaveEdit}
              className="p-6 overflow-y-auto space-y-5 flex-1 text-xs"
            >
              {/* STATUS SELECTOR */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Status Dokumen Rapor:</span>
                  <span className="text-[11px] text-slate-500">
                    Pilih status penerbitan rapor santri
                  </span>
                </div>
                <select
                  value={editingReport.status}
                  onChange={(e) =>
                    setEditingReport({
                      ...editingReport,
                      status: e.target.value as ReportCardRecord['status'],
                    })
                  }
                  className="h-9 px-3 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                >
                  <option value="draft">Draft (Belum Siap)</option>
                  <option value="ready">Siap Cetak</option>
                  <option value="published">Diterbitkan Resmi</option>
                </select>
              </div>

              {/* TAB 1: PELAJARAN AGAMA & TAHFIDZ (UNIFIED) */}
              {editorActiveTab === 'agama' && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  {/* Unified Tahfidz & Tajwid Assessment inside Pelajaran Agama */}
                  <div className={`p-4 rounded-xl border ${themeClasses.primaryBorder} ${themeClasses.primaryLightBg} space-y-3`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 pb-2">
                      <div>
                        <span className={`font-bold text-xs uppercase tracking-wider ${themeClasses.primaryText} block`}>
                          Penilaian Tahfidz (Terpadu di Pelajaran Agama)
                        </span>
                        <span className="text-[11px] text-slate-600">
                          Nilai Tahfidz otomatis disatukan ke dalam Pelajaran Agama pada lembar rapor.
                        </span>
                      </div>
                      {(() => {
                        const tfz = parseFloat(editTahfidzScore) || 0;
                        const tjw = parseFloat(editTajweedScore) || 0;
                        const avgTfz = Math.round((tfz + tjw) / 2);
                        const pred = getGradePredicate(avgTfz);
                        return (
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-900 tabular-nums shrink-0 self-start sm:self-auto">
                            Nilai Akhir: {avgTfz} ({pred.letter}) · {angkaTerbilang(avgTfz)}
                          </span>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Nilai Tahfidz / Kelancaran (Skala 1-90)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="90"
                          placeholder="1-90"
                          value={editTahfidzScore}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const n = parseFloat(raw);
                            if (raw === '') {
                              setEditTahfidzScore('');
                            } else if (!isNaN(n) && n > 90) {
                              setEditTahfidzScore('90');
                            } else if (!isNaN(n) && n < 0) {
                              setEditTahfidzScore('0');
                            } else {
                              setEditTahfidzScore(raw);
                            }
                          }}
                          className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg font-bold text-center tabular-nums text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Nilai Tajwid &amp; Makhorijul Huruf (Skala 1-90)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="90"
                          placeholder="1-90"
                          value={editTajweedScore}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const n = parseFloat(raw);
                            if (raw === '') {
                              setEditTajweedScore('');
                            } else if (!isNaN(n) && n > 90) {
                              setEditTajweedScore('90');
                            } else if (!isNaN(n) && n < 0) {
                              setEditTajweedScore('0');
                            } else {
                              setEditTajweedScore(raw);
                            }
                          }}
                          className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg font-bold text-center tabular-nums text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Keterangan Juz Hafalan (Ditampilkan di Bawah Tahfidz pada Rapor PDF)
                      </label>
                      <input
                        type="text"
                        value={editingReport.tahfidzNotes || ''}
                        onChange={(e) =>
                          setEditingReport({
                            ...editingReport,
                            tahfidzNotes: e.target.value,
                          })
                        }
                        placeholder="Contoh: Juz 30 atau Juz 29 - 30"
                        className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Daftar Mata Pelajaran Agama (Diniyah & Bahasa Arab) */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-900 text-xs">
                        Daftar Nilai Mata Pelajaran Agama ({religiousSubjects.length} Mapel)
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Skala 0 - 90 (Kosongkan jika tidak diambil)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                      {religiousSubjects.map((sub) => {
                        const rawVal = editStudentGrades[sub.id] ?? '';
                        const numVal = parseFloat(rawVal);
                        const hasVal = rawVal.trim() !== '' && !isNaN(numVal);
                        const pred = hasVal ? getGradePredicate(numVal) : null;

                        return (
                          <div
                            key={sub.id}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate">
                                {sub.name}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate">
                                {pred
                                  ? `Predikat ${pred.letter} · ${angkaTerbilang(numVal)}`
                                  : 'Pelajaran Agama'}
                              </span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              max="90"
                              step="0.5"
                              placeholder="0-90"
                              value={rawVal}
                              onChange={(e) => {
                                const raw = e.target.value;
                                const n = parseFloat(raw);
                                const clamped =
                                  raw === ''
                                    ? ''
                                    : !isNaN(n) && n > 90
                                    ? '90'
                                    : !isNaN(n) && n < 0
                                    ? '0'
                                    : raw;
                                setEditStudentGrades((prev) => ({
                                  ...prev,
                                  [sub.id]: clamped,
                                }));
                              }}
                              className="w-20 h-8 px-2 bg-white border border-slate-300 rounded-lg text-center font-bold tabular-nums text-slate-900 shrink-0"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PELAJARAN UMUM */}
              {editorActiveTab === 'umum' && (
                <div className="space-y-3 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-bold text-slate-900 text-xs block">
                        Daftar Nilai Pelajaran Umum ({generalSubjects.length} Mapel)
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Sains, Matematika, Sosial, Bahasa Umum, dan Keterampilan (Skala 0 - 90)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
                    {generalSubjects.map((sub) => {
                      const rawVal = editStudentGrades[sub.id] ?? '';
                      const numVal = parseFloat(rawVal);
                      const hasVal = rawVal.trim() !== '' && !isNaN(numVal);
                      const pred = hasVal ? getGradePredicate(numVal) : null;

                      return (
                        <div
                          key={sub.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">
                              {sub.name}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">
                              {pred
                                ? `Predikat ${pred.letter} · ${angkaTerbilang(numVal)}`
                                : `Kategori: ${sub.category || 'Umum'}`}
                            </span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            max="90"
                            step="0.5"
                            placeholder="0-90"
                            value={rawVal}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const n = parseFloat(raw);
                              const clamped =
                                raw === ''
                                  ? ''
                                  : !isNaN(n) && n > 90
                                  ? '90'
                                  : !isNaN(n) && n < 0
                                  ? '0'
                                  : raw;
                              setEditStudentGrades((prev) => ({
                                ...prev,
                                [sub.id]: clamped,
                              }));
                            }}
                            className="w-20 h-8 px-2 bg-white border border-slate-300 rounded-lg text-center font-bold tabular-nums text-slate-900 shrink-0"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: KEHADIRAN & CATATAN WALI KELAS */}
              {editorActiveTab === 'attendance_notes' && (
                <div className="space-y-5 animate-in fade-in duration-100">
                  <div>
                    <label className="font-bold text-slate-900 block mb-2">
                      1. Rekapitulasi Kehadiran Semester Ini (Hari)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="text-[11px] text-slate-600 block mb-1 font-medium">
                          Sakit (S)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editingReport.attendance.sick}
                          onChange={(e) =>
                            setEditingReport({
                              ...editingReport,
                              attendance: {
                                ...editingReport.attendance,
                                sick: parseInt(e.target.value, 10) || 0,
                              },
                            })
                          }
                          className="w-full h-9 px-2.5 bg-white border border-slate-300 rounded-lg text-center font-bold tabular-nums"
                        />
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="text-[11px] text-slate-600 block mb-1 font-medium">
                          Izin (I)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editingReport.attendance.permission}
                          onChange={(e) =>
                            setEditingReport({
                              ...editingReport,
                              attendance: {
                                ...editingReport.attendance,
                                permission: parseInt(e.target.value, 10) || 0,
                              },
                            })
                          }
                          className="w-full h-9 px-2.5 bg-white border border-slate-300 rounded-lg text-center font-bold tabular-nums"
                        />
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="text-[11px] text-slate-600 block mb-1 font-medium">
                          Tanpa Keterangan (A)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editingReport.attendance.unexcused}
                          onChange={(e) =>
                            setEditingReport({
                              ...editingReport,
                              attendance: {
                                ...editingReport.attendance,
                                unexcused: parseInt(e.target.value, 10) || 0,
                              },
                            })
                          }
                          className="w-full h-9 px-2.5 bg-white border border-slate-300 rounded-lg text-center font-bold tabular-nums"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="font-bold text-slate-900 block">
                      2. Nasihat, Evaluasi & Catatan Motivasi Wali Kelas
                    </label>
                    <textarea
                      rows={3}
                      value={editingReport.teacherNotes}
                      onChange={(e) =>
                        setEditingReport({
                          ...editingReport,
                          teacherNotes: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                    />

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        Klik untuk menggunakan templat motivasi cepat:
                      </span>
                      <div className="space-y-1">
                        {noteTemplates.map((tpl, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() =>
                              setEditingReport({ ...editingReport, teacherNotes: tpl })
                            }
                            className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[11px] text-slate-700 transition-colors cursor-pointer"
                          >
                            "{tpl}"
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PENGESAHAN */}
              {editorActiveTab === 'signatures' && (
                <div className="space-y-3 animate-in fade-in duration-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Tempat Penerbitan
                      </label>
                      <input
                        type="text"
                        value={editingReport.issuePlace}
                        onChange={(e) =>
                          setEditingReport({
                            ...editingReport,
                            issuePlace: e.target.value,
                          })
                        }
                        className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Tanggal Rapor
                      </label>
                      <input
                        type="date"
                        value={editingReport.issueDate}
                        onChange={(e) =>
                          setEditingReport({
                            ...editingReport,
                            issueDate: e.target.value,
                          })
                        }
                        className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Nama Wali Kelas
                      </label>
                      <input
                        type="text"
                        value={editingReport.classTeacherName}
                        onChange={(e) =>
                          setEditingReport({
                            ...editingReport,
                            classTeacherName: e.target.value,
                          })
                        }
                        className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Nama Kepala Madrasah
                      </label>
                      <input
                        type="text"
                        value={editingReport.headmasterName}
                        onChange={(e) =>
                          setEditingReport({
                            ...editingReport,
                            headmasterName: e.target.value,
                          })
                        }
                        className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg font-medium"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-slate-700 font-semibold mb-1">
                        NIY / NIP Kepala Madrasah
                      </label>
                      <input
                        type="text"
                        value={editingReport.headmasterNip || ''}
                        onChange={(e) =>
                          setEditingReport({
                            ...editingReport,
                            headmasterNip: e.target.value,
                          })
                        }
                        className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2">
                <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setEditingReport(null)}
                    className={`btn-precision w-full sm:w-auto text-slate-600 bg-slate-100 hover:bg-slate-200 ${
                      !reportCards.some((r) => r.id === editingReport.id) ? 'col-span-2' : ''
                    }`}
                  >
                    Batal
                  </button>
                  {reportCards.some((r) => r.id === editingReport.id) && (
                    <button
                      type="button"
                      onClick={() => {
                        deleteReportCard(editingReport.id);
                        setEditingReport(null);
                      }}
                      className="btn-precision w-full sm:w-auto text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200"
                      title="Hapus/Reset data kustomisasi rapor santri ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Reset Rapor</span>
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white px-5 shadow-xs`}
                >
                  <Save className="w-4 h-4 text-current" />
                  <span>Simpan Rapor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: PRATINJAU, KUSTOMISASI TEMA & UNDUH RAPOR TUNGGAL */}
      {/* ============================================================ */}
      {previewStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 printable-card-modal">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto p-5 sm:p-8 shadow-2xl animate-in zoom-in-95 printable-card-modal">
            {/* Action Bar (Not Printed) */}
            <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-200">
              <div>
                <span className="text-sm font-bold text-slate-900 block">
                  Pratinjau & Cetak PDF Rapor: {previewStudent.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  Ukuran {reportStyles.paperSize} · Tema warna, bingkai & kop surat mengikuti pengaturan aktif.
                </span>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsPdfSettingsOpen(true)}
                  className={`btn-precision w-full sm:w-auto border ${themeClasses.primaryLightBg} ${themeClasses.primaryText} ${themeClasses.primaryBorder}`}
                  title="Atur Kop 2 Gambar (Kiri & Kanan), Kertas & Format PDF"
                >
                  <Sliders className="w-3.5 h-3.5 text-current" />
                  <span>Atur PDF & Kop</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDownloadReportDocument(
                      [previewStudent],
                      'doc',
                      `Rapor_${previewStudent.name}_Sem${selectedSemester}`
                    )
                  }
                  className="btn-precision w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                  title="Unduh Dokumen Microsoft Word (.DOC)"
                >
                  <FileText className="w-3.5 h-3.5 text-current" />
                  <span>Word</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handlePrintFromContainer(
                      singleSheetWrapperRef.current,
                      `Rapor_${previewStudent.name}_Sem${selectedSemester}`
                    )
                  }
                  className="btn-precision w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white"
                  title="Buka dialog cetak printer langsung"
                >
                  <Printer className="w-3.5 h-3.5 text-current" />
                  <span>Cetak</span>
                </button>

                <button
                  type="button"
                  disabled={isGeneratingPdf}
                  onClick={() =>
                    handleDownloadPdfFromContainer(
                      singleSheetWrapperRef.current,
                      `Rapor_${previewStudent.name.replace(/\s+/g, '_')}_Sem${selectedSemester}`
                    )
                  }
                  className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white shadow-2xs disabled:opacity-60`}
                >
                  <Download className="w-3.5 h-3.5 text-current" />
                  <span>{isGeneratingPdf ? 'Membuat PDF...' : 'Unduh PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewStudentId(null)}
                  className="btn-precision w-full sm:w-auto col-span-2 sm:col-span-1 text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Quick Inline Theme Bar inside Preview Modal */}
            <div className="no-print mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Palette className={`w-3.5 h-3.5 ${themeClasses.primaryText}`} />
                <span className="font-semibold text-slate-700">Pintasan Format PDF & Kop:</span>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={reportStyles.headerStyle}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'dual_logo') {
                      updateThemeSettings({
                        reportHeaderStyle: 'dual_logo',
                        reportShowLeftLogo: true,
                        reportShowRightLogo: true,
                      });
                    } else if (val === 'left_logo') {
                      updateThemeSettings({
                        reportHeaderStyle: 'left_logo',
                        reportShowLeftLogo: true,
                        reportShowRightLogo: false,
                      });
                    } else {
                      updateThemeSettings({ reportHeaderStyle: val as any });
                    }
                  }}
                  className="filter-control w-full sm:w-auto bg-white"
                >
                  <option value="dual_logo">Kop 2 Gambar (Kiri & Kanan)</option>
                  <option value="left_logo">Kop 1 Gambar Kiri</option>
                  <option value="centered">Kop Terpusat</option>
                  <option value="split">Kop Split 2 Kolom</option>
                </select>

                <select
                  value={reportStyles.paperSize}
                  onChange={(e) =>
                    updateThemeSettings({ reportPaperSize: e.target.value as any })
                  }
                  className="filter-control w-full sm:w-auto bg-white"
                >
                  <option value="A4">Kertas A4</option>
                  <option value="F4">Kertas F4 / Folio</option>
                  <option value="Letter">Kertas Letter</option>
                  <option value="Legal">Kertas Legal</option>
                </select>

                <select
                  value={reportStyles.borderStyle}
                  onChange={(e) =>
                    updateThemeSettings({ reportBorderStyle: e.target.value as any })
                  }
                  className="filter-control w-full sm:w-auto bg-white"
                >
                  {PDF_FRAME_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      Bingkai: {preset.shortLabel}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => openPdfSettings('frames_studio')}
                  className={`filter-control w-full sm:w-auto ${themeClasses.primaryLightBg} ${themeClasses.primaryText} ${themeClasses.primaryBorder} font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer`}
                >
                  <Frame className="w-3.5 h-3.5" />
                  <span>Buat Bingkai Sendiri</span>
                </button>

                <button
                  type="button"
                  onClick={() => openPdfSettings('kop_logos')}
                  className="filter-control w-full sm:w-auto bg-white hover:bg-slate-100 font-bold text-slate-800 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Kop 2 Gambar & Opsi Lain</span>
                </button>
              </div>
            </div>

            {/* Official Report Card Sheet Container */}
            <div ref={singleSheetWrapperRef}>
              {renderOfficialReportCardSheet(previewStudent, false)}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: CETAK & UNDUH MASSAL SELURUH RAPOR KELAS */}
      {/* ============================================================ */}
      {isBatchPrinting && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 printable-card-modal">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto p-5 sm:p-8 shadow-2xl animate-in zoom-in-95 printable-card-modal">
            {/* Action Bar (Not Printed) */}
            <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur-md z-30 pt-1">
              <div>
                <span className="text-sm font-bold text-slate-900 block">
                  Cetak & Unduh Massal Rapor {currentClass ? `Kelas ${currentClass.name}` : 'Semua Kelas'} ({classStudents.length}{' '}
                  Santri)
                </span>
                <span className="text-[11px] text-slate-500">
                  Kertas {reportStyles.paperSize} · Setiap rapor santri otomatis dipisah ke halaman baru.
                </span>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsPdfSettingsOpen(true)}
                  className={`btn-precision w-full sm:w-auto border ${themeClasses.primaryLightBg} ${themeClasses.primaryText} ${themeClasses.primaryBorder}`}
                >
                  <Sliders className="w-3.5 h-3.5 text-current" />
                  <span>Atur PDF & Kop</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadReportDocument(
                      classStudents,
                      'doc',
                      `Bundel_Rapor_${currentClass ? `Kelas_${currentClass.name}` : 'Semua_Kelas'}_Sem${selectedSemester}`
                    )
                  }
                  className="btn-precision w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                >
                  <FileText className="w-3.5 h-3.5 text-current" />
                  <span>Word Kelas</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handlePrintFromContainer(
                      batchSheetsWrapperRef.current,
                      `Bundel_Rapor_${currentClass ? `Kelas_${currentClass.name}` : 'Semua_Kelas'}_Sem${selectedSemester}`
                    )
                  }
                  className="btn-precision w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white"
                >
                  <Printer className="w-3.5 h-3.5 text-current" />
                  <span>Cetak</span>
                </button>
                <button
                  type="button"
                  disabled={isGeneratingPdf}
                  onClick={() =>
                    handleDownloadPdfFromContainer(
                      batchSheetsWrapperRef.current,
                      `Bundel_Rapor_${currentClass ? `Kelas_${currentClass.name}` : 'Semua_Kelas'}_Sem${selectedSemester}`
                    )
                  }
                  className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white shadow-2xs disabled:opacity-60`}
                >
                  <Download className="w-3.5 h-3.5 text-current" />
                  <span>
                    {isGeneratingPdf
                      ? 'Menyusun PDF...'
                      : `PDF (${classStudents.length})`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsBatchPrinting(false)}
                  className="btn-precision w-full sm:w-auto col-span-2 sm:col-span-1 text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Render all students sequentially */}
            <div ref={batchSheetsWrapperRef} className="space-y-6">
              {classStudents.map((st) => renderOfficialReportCardSheet(st, true))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: PENGATURAN LENGKAP PDF & KOP SURAT (2 GAMBAR KIRI-KANAN) */}
      {/* ============================================================ */}
      <PdfSettingsModal
        isOpen={isPdfSettingsOpen}
        onClose={() => setIsPdfSettingsOpen(false)}
        initialTab={pdfSettingsInitialTab}
      />
    </div>
  );
};
